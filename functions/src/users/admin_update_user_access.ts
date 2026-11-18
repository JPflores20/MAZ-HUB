/**
 * Cloud Function invocable exclusiva para administradores: actualización de rol, área y aprobación.
 * Sincroniza de inmediato los Custom Claims del usuario destino e impide la auto-revocación administrativa.
 */
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import { clamp_string } from "../security/domain_and_strings";
import {
  normalize_permissions,
  normalize_role,
  ROLE_DEFAULT_PERMISSIONS,
} from "../security/roles_and_permissions";

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
    const rol_siguiente =
      cuerpo_solicitud["role"] !== undefined
        ? normalize_role(cuerpo_solicitud["role"])
        : normalize_role(perfil_actual["role"]);
    const aprobacion_siguiente =
      typeof cuerpo_solicitud["approved"] === "boolean"
        ? cuerpo_solicitud["approved"]
        : perfil_actual["approved"] === true;

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
      updatedAt: new Date().toISOString(),
    };

    if (cuerpo_solicitud["verifiedByAdmin"] === true) {
      cambios_perfil["verifiedByAdmin"] = true;
      cambios_perfil["approved"] = true;
    }

    await referencia_objetivo.set(cambios_perfil, { merge: true });
    await firebase_auth
      .setCustomUserClaims(uid_objetivo, {
        role: rol_siguiente,
        area: area_siguiente,
        approved: Boolean(cambios_perfil["approved"]),
        admin: rol_siguiente === "admin" && Boolean(cambios_perfil["approved"]),
      })
      .catch(() => {});

    return {
      uid: uid_objetivo,
      role: rol_siguiente,
      approved: Boolean(cambios_perfil["approved"]),
    };
  },
);
