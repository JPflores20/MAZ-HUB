/**
 * Blocking Functions de Firebase Authentication with Identity Platform (`beforeUserCreated` y `beforeUserSignedIn`).
 * Garantiza en servidor el rechazo de dominios externos, cuentas deshabilitadas e inicializa Custom Claims.
 */
import {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError as IdentityHttpsError,
} from "firebase-functions/v2/identity";
import { firestore_db } from "../core/firebase_admin";
import { clamp_string, is_corporate_email } from "../security/domain_and_strings";
import { normalize_role } from "../security/roles_and_permissions";

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
 * Verifica dominio corporativo, cuenta activa y sincroniza Custom Claims reales desde Firestore.
 */
export const before_user_signed_in_trigger = beforeUserSignedIn(async (evento_identidad) => {
  const registro_usuario = evento_identidad.data;
  if (!registro_usuario || !is_corporate_email(registro_usuario.email)) {
    throw new IdentityHttpsError(
      "permission-denied",
      "Acceso restringido a correos corporativos autorizados.",
    );
  }
  if (registro_usuario.disabled) {
    throw new IdentityHttpsError("permission-denied", "Cuenta deshabilitada.");
  }

  const perfil_snapshot = await firestore_db.collection("users").doc(registro_usuario.uid).get();
  if (!perfil_snapshot.exists) {
    return {
      customClaims: {
        role: "user",
        approved: false,
        admin: false,
      },
    };
  }

  const datos_perfil = perfil_snapshot.data() ?? {};
  const rol_verificado = normalize_role(datos_perfil["role"]);
  const usuario_aprobado = datos_perfil["approved"] === true;
  const area_verificada = clamp_string(datos_perfil["area"], 80) || "Usuario";

  return {
    customClaims: {
      role: rol_verificado,
      area: area_verificada,
      approved: usuario_aprobado,
      admin: rol_verificado === "admin" && usuario_aprobado,
    },
  };
});
