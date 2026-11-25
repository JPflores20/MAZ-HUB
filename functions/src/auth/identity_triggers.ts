/**
 * Blocking Functions de Firebase Authentication with Identity Platform (`beforeUserCreated` y `beforeUserSignedIn`).
 * Garantiza en servidor el rechazo de dominios externos, cuentas deshabilitadas e inicializa Custom Claims.
 */
import {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError as IdentityHttpsError,
} from "firebase-functions/v2/identity";
import { is_corporate_email, is_valid_email_format } from "../security/domain_and_strings";
import {
  build_custom_claims,
  ensure_verified_corporate_profile,
} from "../users/user_verification_sync";

/**
 * Trigger ejecutado antes de registrar un usuario nuevo en Identity Platform.
 * Bloquea correos no corporativos e inyecta Custom Claims bloqueados por defecto.
 */
export const before_user_created_trigger = beforeUserCreated((evento_identidad) => {
  const registro_usuario = evento_identidad.data;
  if (!registro_usuario || !is_corporate_email(registro_usuario.email)) {
    throw new IdentityHttpsError(
      "permission-denied",
      "Solo se permiten correos corporativos @ab-inbev.com o @gmodelo.com.mx.",
    );
  }

  return {
    customClaims: {
      role: "user",
      approved: false,
      admin: false,
    },
  };
});

/**
 * Trigger ejecutado antes de emitir token de sesión en Identity Platform.
 * Verifica dominio corporativo, aprueba automáticamente cuentas con correo verificado y sincroniza Custom Claims.
 */
export const before_user_signed_in_trigger = beforeUserSignedIn(async (evento_identidad) => {
  const registro_usuario = evento_identidad.data;
  if (!registro_usuario || !is_valid_email_format(registro_usuario.email)) {
    throw new IdentityHttpsError("permission-denied", "Acceso restringido a correos autorizados.");
  }
  if (registro_usuario.disabled) {
    throw new IdentityHttpsError("permission-denied", "Cuenta deshabilitada.");
  }

  const perfil_resultado = await ensure_verified_corporate_profile({
    uid: registro_usuario.uid,
    email: registro_usuario.email,
    displayName: registro_usuario.displayName,
    emailVerified: registro_usuario.emailVerified === true,
    createIfMissingUnverified: false,
  });

  if (perfil_resultado.expired) {
    throw new IdentityHttpsError(
      "permission-denied",
      "Tu acceso temporal como becario ha expirado. Contacta al administrador.",
    );
  }

  if (!is_corporate_email(registro_usuario.email) && !perfil_resultado.exists) {
    throw new IdentityHttpsError(
      "permission-denied",
      "Acceso restringido a correos corporativos autorizados.",
    );
  }

  if (!perfil_resultado.exists) {
    return {
      customClaims: {
        role: "user",
        approved: false,
        admin: false,
      },
    };
  }

  return {
    customClaims: build_custom_claims({
      role: perfil_resultado.role,
      area: perfil_resultado.area,
      approved: perfil_resultado.approved,
      temporaryAccount: perfil_resultado.temporaryAccount,
      ...(typeof perfil_resultado.expiresAtMs === "number"
        ? { expiresAtMs: perfil_resultado.expiresAtMs }
        : {}),
    }),
  };
});
