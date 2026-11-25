/**
 * Cloud Function invocable exclusiva para administradores: actualización de rol, área y aprobación.
 * Sincroniza de inmediato los Custom Claims del usuario destino e impide la auto-revocación administrativa.
 */
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import {
  clamp_string,
  compute_intern_expiration,
  is_corporate_email,
  is_temporary_intern_profile,
  normalize_email,
  parse_active_days,
} from "../security/domain_and_strings";
import {
  normalize_permissions,
  normalize_role,
  ROLE_DEFAULT_PERMISSIONS,
} from "../security/roles_and_permissions";
import { build_custom_claims } from "./user_verification_sync";

/**
 * Actualiza en Firestore y Custom Claims el rol, permisos granulares, área o estado `approved` de un usuario.
 */
export const admin_update_user_access_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    const llamador_admin = await assert_verified_approved_caller(solicitud_callable, true);
    const cuerpo_solicitud = (solicitud_callable.data ?? {}) as Record<string, unknown>;
    const uid_objetivo = clamp_string(cuerpo_solicitud["uid"], 128);

    if (!uid_objetivo) {
      throw new HttpsError("invalid-argument", "Identificador de usuario requerido.");
    }

    const referencia_objetivo = firestore_db.collection("users").doc(uid_objetivo);
    const instantanea_objetivo = await referencia_objetivo.get();
    if (!instantanea_objetivo.exists) {
      throw new HttpsError("not-found", "El usuario solicitado no existe.");
    }

    const perfil_actual = (instantanea_objetivo.data() ?? {}) as Record<string, unknown>;
    const correo_objetivo = normalize_email(perfil_actual["email"]);
    const es_corporativo = is_corporate_email(correo_objetivo);
    const es_becario_temporal = is_temporary_intern_profile(perfil_actual);
    const solicita_verificacion_admin = cuerpo_solicitud["verifiedByAdmin"] === true;
    const dias_solicitados = cuerpo_solicitud["activeDays"];
    const rol_siguiente =
      cuerpo_solicitud["role"] !== undefined
        ? normalize_role(cuerpo_solicitud["role"])
        : normalize_role(perfil_actual["role"]);
    const aprobacion_siguiente =
      typeof cuerpo_solicitud["approved"] === "boolean"
        ? cuerpo_solicitud["approved"]
        : perfil_actual["approved"] === true;

    if (!es_corporativo) {
      if (!es_becario_temporal || rol_siguiente !== "intern") {
        throw new HttpsError(
          "failed-precondition",
          "Los correos externos solo están permitidos para perfiles temporales de Becario.",
        );
      }
      if (solicita_verificacion_admin) {
        throw new HttpsError(
          "failed-precondition",
          "Los becarios temporales deben verificar su correo mediante el enlace enviado a su bandeja.",
        );
      }
    }

    let expiracion_actualizada: ReturnType<typeof compute_intern_expiration> | null = null;
    if (dias_solicitados !== undefined) {
      if (rol_siguiente !== "intern") {
        throw new HttpsError(
          "invalid-argument",
          "La vigencia en días solo aplica para cuentas con rol de Becario / Practicante.",
        );
      }
      const dias_validados = parse_active_days(dias_solicitados);
      if (dias_validados === null) {
        throw new HttpsError(
          "invalid-argument",
          "Los días activos deben ser un entero entre 1 y 730.",
        );
      }
      expiracion_actualizada = compute_intern_expiration(dias_validados);
    }

    if (
      uid_objetivo === llamador_admin.uid &&
      (rol_siguiente !== "admin" || !aprobacion_siguiente)
    ) {
      throw new HttpsError(
        "failed-precondition",
        "No puedes revocar tu propio rol o aprobación administrativa.",
      );
    }

    const area_siguiente =
      typeof cuerpo_solicitud["area"] === "string" && cuerpo_solicitud["area"].trim()
        ? clamp_string(cuerpo_solicitud["area"], 80).toUpperCase()
        : clamp_string(perfil_actual["area"], 80) || "Usuario";

    const permisos_siguientes = normalize_permissions(
      rol_siguiente,
      (cuerpo_solicitud["permissions"] as Partial<
        Record<keyof typeof ROLE_DEFAULT_PERMISSIONS.admin, unknown>
      >) ??
        (perfil_actual["permissions"] as Partial<
          Record<keyof typeof ROLE_DEFAULT_PERMISSIONS.admin, unknown>
        >),
    );

    const cambios_perfil: Record<string, unknown> = {
      role: rol_siguiente,
      approved: aprobacion_siguiente,
      area: area_siguiente,
      permissions: permisos_siguientes,
      ...(expiracion_actualizada
        ? {
            temporaryAccount: true,
            activeDays: expiracion_actualizada.activeDays,
            expiresAt: expiracion_actualizada.expiresAt,
            expiresAtMs: expiracion_actualizada.expiresAtMs,
            approved: true,
          }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    if (solicita_verificacion_admin) {
      try {
        await firebase_auth.updateUser(uid_objetivo, { emailVerified: true });
      } catch (error_auth: unknown) {
        const codigo_error = (error_auth as { code?: string } | null)?.code;
        if (codigo_error === "auth/user-not-found") {
          throw new HttpsError(
            "failed-precondition",
            "El usuario no tiene cuenta registrada en Firebase Authentication.",
          );
        }
        throw new HttpsError(
          "internal",
          "No se pudo verificar el correo del usuario en Firebase Auth.",
        );
      }
      cambios_perfil["verifiedByAdmin"] = true;
      cambios_perfil["approved"] = true;
      cambios_perfil["emailVerified"] = true;
    }

    const es_temporal_final =
      Boolean(expiracion_actualizada) || perfil_actual["temporaryAccount"] === true;
    const exp_ms_final =
      expiracion_actualizada?.expiresAtMs ??
      (typeof perfil_actual["expiresAtMs"] === "number" ? perfil_actual["expiresAtMs"] : undefined);

    await referencia_objetivo.set(cambios_perfil, { merge: true });
    await firebase_auth
      .setCustomUserClaims(
        uid_objetivo,
        build_custom_claims({
          role: rol_siguiente,
          area: area_siguiente,
          approved: Boolean(cambios_perfil["approved"]),
          temporaryAccount: es_temporal_final,
          ...(typeof exp_ms_final === "number" ? { expiresAtMs: exp_ms_final } : {}),
        }),
      )
      .catch(() => {});

    return {
      uid: uid_objetivo,
      role: rol_siguiente,
      approved: Boolean(cambios_perfil["approved"]),
      emailVerified: solicita_verificacion_admin ? true : perfil_actual["emailVerified"] === true,
      ...(expiracion_actualizada ? expiracion_actualizada : {}),
    };
  },
);
