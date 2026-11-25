/**
 * Cloud Function invocable para activar o reconciliar en servidor el perfil de un colaborador
 * corporativo cuyo correo ya figura como verificado en Firebase Authentication.
 */
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { enforce_app_check, firebase_auth } from "../core/firebase_admin";
import {
  is_corporate_email,
  is_valid_email_format,
  normalize_email,
} from "../security/domain_and_strings";
import { build_custom_claims, ensure_verified_corporate_profile } from "./user_verification_sync";

/**
 * Valida la verificación real del correo en Auth y marca `approved: true` en Firestore y Custom Claims.
 */
export const sync_verified_profile_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    if (!solicitud_callable.auth) {
      throw new HttpsError("unauthenticated", "Autenticación requerida.");
    }

    const uid_usuario = solicitud_callable.auth.uid;
    const token_auth = solicitud_callable.auth.token;
    const correo_token = normalize_email(token_auth.email);

    if (token_auth.email_verified !== true || !is_valid_email_format(correo_token)) {
      throw new HttpsError(
        "permission-denied",
        "Debes verificar tu correo electrónico antes de activar tu cuenta.",
      );
    }

    const registro_auth = await firebase_auth.getUser(uid_usuario);
    const correo_auth = normalize_email(registro_auth.email);
    if (registro_auth.disabled) {
      throw new HttpsError("permission-denied", "Cuenta deshabilitada.");
    }
    if (registro_auth.emailVerified !== true || !is_valid_email_format(correo_auth)) {
      throw new HttpsError(
        "permission-denied",
        "El correo aún no aparece verificado en Firebase Authentication.",
      );
    }

    const perfil_resultado = await ensure_verified_corporate_profile({
      uid: uid_usuario,
      email: correo_auth,
      displayName: registro_auth.displayName,
      emailVerified: true,
      createIfMissingUnverified: true,
    });

    if (perfil_resultado.expired) {
      throw new HttpsError(
        "permission-denied",
        "Tu acceso temporal como becario ha expirado. Contacta al administrador.",
      );
    }
    if (!is_corporate_email(correo_auth) && !perfil_resultado.exists) {
      throw new HttpsError(
        "permission-denied",
        "Solo se permiten correos corporativos o becarios temporales autorizados.",
      );
    }

    await firebase_auth
      .setCustomUserClaims(
        uid_usuario,
        build_custom_claims({
          role: perfil_resultado.role,
          area: perfil_resultado.area,
          approved: perfil_resultado.approved,
          temporaryAccount: perfil_resultado.temporaryAccount,
          ...(typeof perfil_resultado.expiresAtMs === "number"
            ? { expiresAtMs: perfil_resultado.expiresAtMs }
            : {}),
        }),
      )
      .catch(() => {});

    return {
      uid: uid_usuario,
      role: perfil_resultado.role,
      approved: perfil_resultado.approved,
      emailVerified: perfil_resultado.emailVerified,
    };
  },
);
