/**
 * Cloud Function invocable exclusiva para administradores: eliminación completa de un usuario.
 * Elimina la cuenta en Firebase Authentication, su perfil privado en `users` y su proyección en `user_directory`.
 */
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import { clamp_string } from "../security/domain_and_strings";

/**
 * Elimina de forma segura un usuario distinto al administrador solicitante.
 */
export const admin_delete_user_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    const llamador_admin = await assert_verified_approved_caller(solicitud_callable, true);
    const cuerpo_solicitud = (solicitud_callable.data ?? {}) as Record<string, unknown>;
    const uid_objetivo = clamp_string(cuerpo_solicitud["uid"], 128);

    if (!uid_objetivo) {
      throw new HttpsError("invalid-argument", "Identificador de usuario requerido.");
    }
    if (uid_objetivo === llamador_admin.uid) {
      throw new HttpsError("failed-precondition", "No puedes eliminar tu propia cuenta.");
    }

    await firebase_auth.deleteUser(uid_objetivo).catch((error_auth: unknown) => {
      const codigo_error = (error_auth as { code?: string } | null)?.code;
      if (codigo_error !== "auth/user-not-found") {
        throw new HttpsError("internal", "No se pudo eliminar la cuenta en Firebase Auth.");
      }
    });

    await firestore_db.collection("users").doc(uid_objetivo).delete();
    await firestore_db
      .collection("user_directory")
      .doc(uid_objetivo)
      .delete()
      .catch(() => {});

    return { deletedUid: uid_objetivo };
  },
);
