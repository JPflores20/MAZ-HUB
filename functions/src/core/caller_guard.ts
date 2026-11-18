/**
 * Guardia Zero Trust de invocación para Cloud Functions `onCall`.
 * Valida sesión real, verificación de correo, dominio corporativo, perfil aprobado y rol admin en servidor.
 */
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { firestore_db } from "./firebase_admin";
import { clamp_string, is_corporate_email, normalize_email } from "../security/domain_and_strings";
import { normalize_role, type UserRole } from "../security/roles_and_permissions";

export interface VerifiedCaller {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  area: string;
  approved: boolean;
}

/**
 * Comprueba que quien invoca una Callable posea token válido, correo corporativo verificado
 * y cuenta aprobada en Firestore; opcionalmente exige privilegios de administrador.
 * @param solicitud_callable - Contexto de petición recibido por `onCall`.
 * @param requiere_admin - Cuando es `true`, rechaza cualquier rol distinto de `admin`.
 * @returns Identidad verificada y autorizada del llamador en servidor.
 */
export async function assert_verified_approved_caller(
  solicitud_callable: CallableRequest<unknown>,
  requiere_admin = false,
): Promise<VerifiedCaller> {
  if (!solicitud_callable.auth) {
    throw new HttpsError("unauthenticated", "Autenticación requerida.");
  }

  const token_auth = solicitud_callable.auth.token;
  const correo_verificado = normalize_email(token_auth.email);
  if (token_auth.email_verified !== true || !is_corporate_email(correo_verificado)) {
    throw new HttpsError("permission-denied", "Se requiere correo corporativo verificado.");
  }

  const perfil_snapshot = await firestore_db
    .collection("users")
    .doc(solicitud_callable.auth.uid)
    .get();
  if (!perfil_snapshot.exists) {
    throw new HttpsError("permission-denied", "Perfil de usuario no encontrado.");
  }

  const datos_perfil = perfil_snapshot.data() ?? {};
  const rol_verificado = normalize_role(datos_perfil["role"]);
  const usuario_aprobado = datos_perfil["approved"] === true;

  if (!usuario_aprobado) {
    throw new HttpsError("permission-denied", "Cuenta pendiente de aprobación.");
  }
  if (requiere_admin && rol_verificado !== "admin") {
    throw new HttpsError("permission-denied", "Se requieren permisos de administrador.");
  }

  return {
    uid: solicitud_callable.auth.uid,
    email: correo_verificado,
    name: clamp_string(datos_perfil["name"], 120) || "Usuario",
    role: rol_verificado,
    area: clamp_string(datos_perfil["area"], 80) || "Usuario",
    approved: usuario_aprobado,
  };
}
