/**
 * Cloud Function invocable exclusiva para administradores: creación aislada de cuentas de terceros,
 * incluyendo perfiles temporales de becario con correo externo (ej. Gmail) y vigencia en días.
 */
import { randomBytes } from "node:crypto";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import {
  clamp_string,
  compute_intern_expiration,
  is_corporate_email,
  is_valid_email_format,
  normalize_email,
  parse_active_days,
} from "../security/domain_and_strings";
import {
  normalize_permissions,
  normalize_role,
  ROLE_DEFAULT_PERMISSIONS,
  VALID_ROLES,
} from "../security/roles_and_permissions";
import { build_custom_claims } from "./user_verification_sync";

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,128}$/;

/**
 * Crea una cuenta nueva en Firebase Authentication (pendiente de verificación de correo)
 * y su perfil en Firestore. Permite correos externos exclusivamente para el rol `intern` con vigencia en días.
 */
export const admin_create_user_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    await assert_verified_approved_caller(solicitud_callable, true);
    const cuerpo_solicitud = (solicitud_callable.data ?? {}) as Record<string, unknown>;

    const correo_usuario = normalize_email(cuerpo_solicitud["email"]);
    const nombre_completo = clamp_string(cuerpo_solicitud["name"], 120).toUpperCase();
    const area_usuario = clamp_string(cuerpo_solicitud["area"], 80).toUpperCase();
    const puesto_usuario = clamp_string(cuerpo_solicitud["position"], 80).toUpperCase();
    const rol_solicitado = normalize_role(cuerpo_solicitud["role"]);
    const clave_temporal =
      typeof cuerpo_solicitud["password"] === "string" ? cuerpo_solicitud["password"] : "";

    if (!is_valid_email_format(correo_usuario)) {
      throw new HttpsError("invalid-argument", "Ingresa un correo electrónico válido.");
    }
    if (!nombre_completo || !area_usuario) {
      throw new HttpsError("invalid-argument", "Nombre y área son obligatorios.");
    }
    if (!(VALID_ROLES as readonly string[]).includes(String(cuerpo_solicitud["role"] ?? "user"))) {
      throw new HttpsError("invalid-argument", "Rol inválido.");
    }

    const es_corporativo = is_corporate_email(correo_usuario);
    if (!es_corporativo && rol_solicitado !== "intern") {
      throw new HttpsError(
        "invalid-argument",
        "Solo los perfiles temporales de Becario pueden usar un correo externo (ej. Gmail).",
      );
    }

    let expiracion: ReturnType<typeof compute_intern_expiration> | null = null;
    const dias_crudos = cuerpo_solicitud["activeDays"];
    if (!es_corporativo || (rol_solicitado === "intern" && dias_crudos !== undefined)) {
      const dias_validados = parse_active_days(dias_crudos);
      if (dias_validados === null) {
        throw new HttpsError(
          "invalid-argument",
          "Asigna una vigencia válida en días (entre 1 y 730) para el perfil de becario temporal.",
        );
      }
      expiracion = compute_intern_expiration(dias_validados);
    }

    if (clave_temporal && !PASSWORD_COMPLEXITY_REGEX.test(clave_temporal)) {
      throw new HttpsError(
        "invalid-argument",
        "La contraseña temporal debe tener al menos 8 caracteres, mayúscula, número y carácter especial.",
      );
    }

    const clave_inicializacion =
      clave_temporal || `Tmp#${randomBytes(12).toString("base64url")}A1!`;

    let uid_creado = "";
    try {
      const registro_auth = await firebase_auth.createUser({
        email: correo_usuario,
        password: clave_inicializacion,
        displayName: nombre_completo,
        emailVerified: false,
      });
      uid_creado = registro_auth.uid;
    } catch (error_auth: unknown) {
      const codigo_error = (error_auth as { code?: string } | null)?.code;
      if (codigo_error === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "No se pudo crear la cuenta con el correo indicado.",
        );
      }
      throw new HttpsError("internal", "Error creando cuenta en el servicio de identidad.");
    }

    const marca_tiempo_iso = new Date().toISOString();
    const permisos_sanitizados = normalize_permissions(
      rol_solicitado,
      cuerpo_solicitud["permissions"] as Partial<
        Record<keyof typeof ROLE_DEFAULT_PERMISSIONS.admin, unknown>
      >,
    );
    const es_temporal = Boolean(expiracion);

    await firebase_auth.setCustomUserClaims(
      uid_creado,
      build_custom_claims({
        role: rol_solicitado,
        area: area_usuario,
        approved: true,
        temporaryAccount: es_temporal,
        ...(expiracion ? { expiresAtMs: expiracion.expiresAtMs } : {}),
      }),
    );

    await firestore_db
      .collection("users")
      .doc(uid_creado)
      .set({
        uid: uid_creado,
        name: nombre_completo,
        email: correo_usuario,
        role: rol_solicitado,
        permissions: permisos_sanitizados,
        area: area_usuario,
        ...(puesto_usuario ? { position: puesto_usuario } : {}),
        approved: true,
        emailVerified: false,
        verifiedByAdmin: true,
        ...(es_temporal && expiracion
          ? {
              temporaryAccount: true,
              activeDays: expiracion.activeDays,
              expiresAt: expiracion.expiresAt,
              expiresAtMs: expiracion.expiresAtMs,
            }
          : {}),
        createdAt: marca_tiempo_iso,
        updatedAt: marca_tiempo_iso,
      });

    return {
      uid: uid_creado,
      email: correo_usuario,
      role: rol_solicitado,
      approved: true,
      ...(es_temporal && expiracion
        ? {
            temporaryAccount: true,
            activeDays: expiracion.activeDays,
            expiresAt: expiracion.expiresAt,
            expiresAtMs: expiracion.expiresAtMs,
          }
        : {}),
    };
  },
);
