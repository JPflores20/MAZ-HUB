/**
 * Trigger Firestore `users/{uid}` encargado de sincronizar Custom Claims en Firebase Auth
 * y proyectar el directorio público mínimo `user_directory` sin exponer permisos ni secretos.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { firebase_auth, firestore_db, firestore_field_value } from "../core/firebase_admin";
import { clamp_string, is_profile_expired } from "../security/domain_and_strings";
import { build_directory_projection, normalize_role } from "../security/roles_and_permissions";
import { build_custom_claims } from "./user_verification_sync";

/**
 * Mantiene sincronizados `customClaims` y `user_directory/{uid}` ante cambios en `users/{uid}`.
 * Elimina automáticamente el campo legado `password` si estuviera presente en el documento.
 */
export const sync_user_profile_trigger = onDocumentWritten(
  "users/{uid}",
  async (evento_documento) => {
    const uid_usuario = evento_documento.params.uid;
    const instantanea_posterior = evento_documento.data?.after;

    if (!instantanea_posterior || !instantanea_posterior.exists) {
      await firestore_db
        .collection("user_directory")
        .doc(uid_usuario)
        .delete()
        .catch(() => {});
      return;
    }

    const datos_perfil = (instantanea_posterior.data() ?? {}) as Record<string, unknown>;

    // Higiene defensiva: purgar cualquier contraseña en texto plano heredada
    if ("password" in datos_perfil) {
      await instantanea_posterior.ref
        .update({ password: firestore_field_value.delete() })
        .catch(() => {});
    }

    const rol_verificado = normalize_role(datos_perfil["role"]);
    const expirado = is_profile_expired(datos_perfil);
    const usuario_aprobado = datos_perfil["approved"] === true && !expirado;
    const area_verificada = clamp_string(datos_perfil["area"], 80) || "Usuario";
    const es_temporal = datos_perfil["temporaryAccount"] === true;
    const exp_ms =
      typeof datos_perfil["expiresAtMs"] === "number" ? datos_perfil["expiresAtMs"] : undefined;

    await firebase_auth
      .setCustomUserClaims(
        uid_usuario,
        build_custom_claims({
          role: rol_verificado,
          area: area_verificada,
          approved: usuario_aprobado,
          temporaryAccount: es_temporal,
          ...(typeof exp_ms === "number" ? { expiresAtMs: exp_ms } : {}),
        }),
      )
      .catch(() => {});

    if (usuario_aprobado) {
      await firestore_db
        .collection("user_directory")
        .doc(uid_usuario)
        .set(build_directory_projection(uid_usuario, datos_perfil), { merge: false });
      return;
    }

    await firestore_db
      .collection("user_directory")
      .doc(uid_usuario)
      .delete()
      .catch(() => {});
  },
);
