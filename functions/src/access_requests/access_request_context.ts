/**
 * Contexto compartido y validado para aprobar o rechazar solicitudes de acceso sobre PDCA/RDA.
 * Centraliza lectura de notificación, verificación del documento destino y comprobación RBAC en servidor.
 */
import { type DocumentReference } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { assert_verified_approved_caller, type VerifiedCaller } from "../core/caller_guard";
import { firestore_db } from "../core/firebase_admin";
import { can_authorize_access_grant } from "../security/access_grant_policy";
import { clamp_string } from "../security/domain_and_strings";

export interface AuthorizedAccessRequestContext {
  caller: VerifiedCaller;
  notification_id: string;
  related_ids: string[];
  notification_data: Record<string, unknown>;
  module_type: "PDCA" | "RDA";
  target_doc_id: string;
  target_ref: DocumentReference;
  target_data: Record<string, unknown>;
  pdca_id: string;
  rda_id: string;
}

/**
 * Valida al usuario llamador, recupera la notificación de solicitud y comprueba en servidor
 * que el aprobador tenga autoridad real sobre el PDCA o RDA referenciado.
 * @param solicitud_callable - Contexto `onCall` entrante.
 * @param opciones - Opciones para exigir tipo exacto `access_request` o existencia del documento.
 * @returns Contexto validado listo para ejecutar aprobación o rechazo.
 */
export async function resolve_authorized_access_request(
  solicitud_callable: CallableRequest<unknown>,
  opciones: { require_access_request_type: boolean; require_existing_target: boolean },
): Promise<AuthorizedAccessRequestContext> {
  const caller = await assert_verified_approved_caller(solicitud_callable, false);
  const cuerpo_solicitud = (solicitud_callable.data ?? {}) as Record<string, unknown>;
  const notification_id = clamp_string(cuerpo_solicitud["notificationId"], 128);
  const ids_relacionados_crudos = Array.isArray(cuerpo_solicitud["relatedDocIds"])
    ? (cuerpo_solicitud["relatedDocIds"] as unknown[])
    : [];
  const related_ids = Array.from(
    new Set([
      notification_id,
      ...ids_relacionados_crudos
        .filter((valor_id): valor_id is string => typeof valor_id === "string" && Boolean(valor_id.trim()))
        .map((valor_id) => valor_id.trim())
        .slice(0, 20),
    ]),
  ).filter(Boolean);

  if (!notification_id) {
    throw new HttpsError("invalid-argument", "notificationId es obligatorio.");
  }

  const instantanea_notificacion = await firestore_db
    .collection("notifications")
    .doc(notification_id)
    .get();
  if (!instantanea_notificacion.exists) {
    throw new HttpsError("not-found", "La notificación no existe.");
  }

  const notification_data = (instantanea_notificacion.data() ?? {}) as Record<string, unknown>;
  if (opciones.require_access_request_type && notification_data["type"] !== "access_request") {
    throw new HttpsError("invalid-argument", "Tipo de notificación inválido.");
  }

  const pdca_id = clamp_string(notification_data["pdcaId"], 128);
  const rda_id = clamp_string(notification_data["rdaId"], 128);
  const module_type: "PDCA" | "RDA" = rda_id ? "RDA" : "PDCA";
  const target_doc_id = rda_id || pdca_id;

  if (!target_doc_id) {
    throw new HttpsError("invalid-argument", "La solicitud no referencia un documento válido.");
  }

  const nombre_coleccion = module_type === "RDA" ? "rdas" : "pdcas";
  const target_ref = firestore_db.collection(nombre_coleccion).doc(target_doc_id);
  const instantanea_objetivo = await target_ref.get();
  if (opciones.require_existing_target && !instantanea_objetivo.exists) {
    throw new HttpsError("not-found", `No se encontró el ${module_type} solicitado.`);
  }

  const target_data = (instantanea_objetivo.data() ?? {}) as Record<string, unknown>;
  const tiene_autoridad = can_authorize_access_grant({
    callerUid: caller.uid,
    callerEmail: caller.email,
    callerRole: caller.role,
    callerArea: caller.area,
    callerApproved: caller.approved,
    module: module_type,
    targetData: target_data,
  });

  if (!tiene_autoridad) {
    throw new HttpsError(
      "permission-denied",
      "No tienes permisos para resolver esta solicitud de acceso.",
    );
  }

  return {
    caller,
    notification_id,
    related_ids,
    notification_data,
    module_type,
    target_doc_id,
    target_ref,
    target_data,
    pdca_id,
    rda_id,
  };
}

/**
 * Marca en lote todas las notificaciones vinculadas a la solicitud como leídas y aprobadas/rechazadas.
 * @param ids_notificaciones - Lista acotada de IDs de notificaciones relacionadas.
 * @param estado_resolucion - Campos de estado a aplicar sobre cada notificación.
 */
export async function update_related_notifications_batch(
  ids_notificaciones: readonly string[],
  estado_resolucion: { approved?: boolean; rejected?: boolean },
): Promise<void> {
  const lote_escritura = firestore_db.batch();
  for (const id_notificacion of ids_notificaciones) {
    lote_escritura.update(firestore_db.collection("notifications").doc(id_notificacion), {
      read: true,
      ...estado_resolucion,
    });
  }
  await lote_escritura.commit();
}
