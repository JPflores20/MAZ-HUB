/**
 * Cloud Function invocable exclusiva para administradores: reconcilia usuarios corporativos
 * de Firebase Authentication hacia Firestore `/users` para mostrar pendientes y aprobar verificados.
 */
import { onCall } from "firebase-functions/v2/https";
import { assert_verified_approved_caller } from "../core/caller_guard";
import { enforce_app_check, firebase_auth, firestore_db } from "../core/firebase_admin";
import {
  is_corporate_email,
  is_temporary_intern_profile,
  normalize_email,
} from "../security/domain_and_strings";
import { build_initial_profile_payload } from "./user_verification_sync";

/**
 * Recorre cuentas activas corporativas en Firebase Auth y crea o aprueba perfiles faltantes en `/users`.
 */
export async function sync_all_auth_users_to_firestore(): Promise<{
  scannedCount: number;
  createdCount: number;
  approvedCount: number;
}> {
  const perfiles_existentes = await firestore_db.collection("users").get();
  const mapa_perfiles = new Map<string, Record<string, unknown>>();
  perfiles_existentes.forEach((doc_snapshot) => {
    mapa_perfiles.set(doc_snapshot.id, (doc_snapshot.data() ?? {}) as Record<string, unknown>);
  });

  let scanned_count = 0;
  let created_count = 0;
  let approved_count = 0;
  let next_page_token: string | undefined;
  const ahora_iso = new Date().toISOString();

  do {
    const pagina_usuarios = await firebase_auth.listUsers(1000, next_page_token);
    for (const registro_auth of pagina_usuarios.users) {
      if (registro_auth.disabled) continue;
      const correo_normalizado = normalize_email(registro_auth.email);
      const es_corporativo = is_corporate_email(correo_normalizado);
      const perfil_actual = mapa_perfiles.get(registro_auth.uid);
      const es_becario_temporal = Boolean(
        perfil_actual && is_temporary_intern_profile(perfil_actual),
      );
      if (!es_corporativo && !es_becario_temporal) continue;

      scanned_count += 1;
      const correo_verificado = registro_auth.emailVerified === true;

      if (!perfil_actual) {
        await firestore_db
          .collection("users")
          .doc(registro_auth.uid)
          .set(
            build_initial_profile_payload(
              registro_auth.uid,
              correo_normalizado,
              registro_auth.displayName,
              correo_verificado,
              ahora_iso,
            ),
          );
        created_count += 1;
        if (correo_verificado) approved_count += 1;
        continue;
      }

      if (
        correo_verificado &&
        ((es_corporativo && perfil_actual["approved"] !== true) ||
          perfil_actual["emailVerified"] !== true)
      ) {
        await firestore_db
          .collection("users")
          .doc(registro_auth.uid)
          .set(
            {
              ...(es_corporativo ? { approved: true } : {}),
              emailVerified: true,
              updatedAt: ahora_iso,
            },
            { merge: true },
          );
        approved_count += 1;
      }
    }
    next_page_token = pagina_usuarios.pageToken;
  } while (next_page_token);

  return {
    scannedCount: scanned_count,
    createdCount: created_count,
    approvedCount: approved_count,
  };
}

/**
 * Sincroniza perfiles faltantes y cuentas corporativas ya verificadas desde Firebase Auth.
 */
export const admin_sync_auth_users_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    await assert_verified_approved_caller(solicitud_callable, true);
    return sync_all_auth_users_to_firestore();
  },
);
