/**
 * Cloud Function invocable exclusiva para administradores: creación aislada de cuentas de terceros.
 * Utiliza Firebase Admin SDK evitando contaminar sesiones cliente o guardar contraseñas en Firestore.
 */
import { randomBytes } from "node:crypto";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import { clamp_string, is_corporate_email, normalize_email } from "../security/domain_and_strings";
import {
  normalize_permissions,
  normalize_role,
  ROLE_DEFAULT_PERMISSIONS,
  VALID_ROLES,
} from "../security/roles_and_permissions";

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,128}$/;

/**
 * Crea una cuenta nueva en Firebase Authentication y su perfil en Firestore con estado aprobado.
 * Si no se especifica contraseña temporal, genera una aleatoria criptográficamente segura con `randomBytes`.
 */
export const admin_create_user_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    await assert_verified_approved_caller(solicitud_callable, true);
    const cuerpo_solicitud = (solicitud_callable.data ?? {}) as Record<string, unknown>;

    const correo_corporativo = normalize_email(cuerpo_solicitud["email"]);
    const nombre_completo = clamp_string(cuerpo_solicitud["name"], 120).toUpperCase();
    const area_usuario = clamp_string(cuerpo_solicitud["area"], 80).toUpperCase();
    const puesto_usuario = clamp_string(cuerpo_solicitud["position"], 80).toUpperCase();
    const rol_solicitado = normalize_role(cuerpo_solicitud["role"]);
    const clave_temporal =
      typeof cuerpo_solicitud["password"] === "string" ? cuerpo_solicitud["password"] : "";

    if (!is_corporate_email(correo_corporativo)) {
      throw new HttpsError(
        "invalid-argument",
        "Solo se permiten correos @ab-inbev.com o @gmodelo.com.mx.",
      );
    }
    if (!nombre_completo || !area_usuario) {
      throw new HttpsError("invalid-argument", "Nombre y área son obligatorios.");
    }
    if (!(VALID_ROLES as readonly string[]).includes(String(cuerpo_solicitud["role"] ?? "user"))) {
      throw new HttpsError("invalid-argument", "Rol inválido.");
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
        email: correo_corporativo,
        password: clave_inicializacion,
        displayName: nombre_completo,
        emailVerified: false,
      });
      uid_creado = registro_auth.uid;
    } catch (error_auth: unknown) {
      const codigo_error = (error_auth as { code?: string } | null)?.code;
      if (codigo_error === "auth/email-already-exists") {
        throw new HttpsError("already-exists", "No se pudo crear la cuenta con el correo indicado.");
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

    await firebase_auth.setCustomUserClaims(uid_creado, {
      role: rol_solicitado,
      area: area_usuario,
      approved: true,
      admin: rol_solicitado === "admin",
    });

    await firestore_db
      .collection("users")
      .doc(uid_creado)
      .set({
        uid: uid_creado,
        name: nombre_completo,
        email: correo_corporativo,
        role: rol_solicitado,
        permissions: permisos_sanitizados,
        area: area_usuario,
        ...(puesto_usuario ? { position: puesto_usuario } : {}),
        approved: true,
        emailVerified: false,
        verifiedByAdmin: true,
        createdAt: marca_tiempo_iso,
        updatedAt: marca_tiempo_iso,
      });

    return {
      uid: uid_creado,
      email: correo_corporativo,
      role: rol_solicitado,
      approved: true,
    };
  },
);
