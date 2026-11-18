/**
 * Cloud Function invocable para aprobar solicitudes de acceso a proyectos PDCA o documentos RDA.
 * Añade al solicitante en las listas de asignación autorizadas y emite notificación `access_approved`.
 */
import { type DocumentReference } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";
import { enforce_app_check, firestore_db } from "../core/firebase_admin";
import { clamp_string, normalize_email } from "../security/domain_and_strings";
import {
  resolve_authorized_access_request,
  update_related_notifications_batch,
} from "./access_request_context";

interface RequesterIdentity {
  requester_uid: string;
  requester_name: string;
  requester_email: string;
}

/**
 * Incorpora al solicitante dentro de los arreglos de responsables/asignados de un PDCA.
 */
async function append_pdca_assignment(
  referencia_pdca: DocumentReference,
  datos_pdca: Record<string, unknown>,
  solicitante: RequesterIdentity,
): Promise<void> {
  const asignados_actuales = Array.isArray(datos_pdca["asignados"])
    ? (datos_pdca["asignados"] as { name?: string; email?: string }[])
    : [];
  const ya_asignado = asignados_actuales.some(
    (registro_asignado) =>
      (solicitante.requester_email &&
        normalize_email(registro_asignado.email) === solicitante.requester_email) ||
      (solicitante.requester_name &&
        clamp_string(registro_asignado.name, 120).toLowerCase() ===
          solicitante.requester_name.toLowerCase()),
  );

  const siguientes_asignados = ya_asignado
    ? asignados_actuales
    : [
        ...asignados_actuales,
        { name: solicitante.requester_name, email: solicitante.requester_email },
      ];
  const siguiente_equipo = Array.from(
    new Set([
      ...(Array.isArray(datos_pdca["equipo"]) ? (datos_pdca["equipo"] as string[]) : []),
      ...(solicitante.requester_name ? [solicitante.requester_name] : []),
    ]),
  );
  const siguientes_uids = Array.from(
    new Set([
      ...(Array.isArray(datos_pdca["assignedUids"])
        ? (datos_pdca["assignedUids"] as string[])
        : []),
      ...(solicitante.requester_uid ? [solicitante.requester_uid] : []),
    ]),
  );
  const siguientes_correos = Array.from(
    new Set([
      ...(Array.isArray(datos_pdca["assignedEmails"])
        ? (datos_pdca["assignedEmails"] as string[]).map(normalize_email)
        : []),
      ...(solicitante.requester_email ? [solicitante.requester_email] : []),
    ]),
  ).filter(Boolean);

  await referencia_pdca.update({
    asignados: siguientes_asignados,
    equipo: siguiente_equipo,
    assignedUids: siguientes_uids,
    assignedEmails: siguientes_correos,
  });
}

/**
 * Incorpora al solicitante dentro de los campos de asignación de un RDA.
 */
async function append_rda_assignment(
  referencia_rda: DocumentReference,
  datos_rda: Record<string, unknown>,
  solicitante: RequesterIdentity,
): Promise<void> {
  const contexto_rda = (datos_rda["context"] as Record<string, unknown> | undefined) ?? {};
  const portada_rda = (datos_rda["portada"] as Record<string, unknown> | undefined) ?? {};
  const responsables_contexto = String(contexto_rda["responsable"] ?? "")
    .split(",")
    .map((nombre_item) => nombre_item.trim())
    .filter(Boolean);

  const lista_actual =
    responsables_contexto.length > 0
      ? responsables_contexto
      : (Array.isArray(portada_rda["usuariosAsignados"])
          ? (portada_rda["usuariosAsignados"] as string[])
          : []
        )
          .map((nombre_item) => nombre_item.trim())
          .filter(Boolean);

  const ya_en_lista = lista_actual.some(
    (nombre_existente) => nombre_existente.toLowerCase() === solicitante.requester_name.toLowerCase(),
  );
  const siguiente_lista =
    ya_en_lista || !solicitante.requester_name
      ? lista_actual
      : [...lista_actual, solicitante.requester_name];

  const siguientes_uids = Array.from(
    new Set([
      ...(Array.isArray(datos_rda["assignedUids"]) ? (datos_rda["assignedUids"] as string[]) : []),
      ...(solicitante.requester_uid ? [solicitante.requester_uid] : []),
    ]),
  );
  const siguientes_correos = Array.from(
    new Set([
      ...(Array.isArray(datos_rda["assignedEmails"])
        ? (datos_rda["assignedEmails"] as string[]).map(normalize_email)
        : []),
      ...(solicitante.requester_email ? [solicitante.requester_email] : []),
    ]),
  ).filter(Boolean);

  await referencia_rda.update({
    "context.responsable": siguiente_lista.join(", "),
    "portada.usuariosAsignados": siguiente_lista,
    assignedUids: siguientes_uids,
    assignedEmails: siguientes_correos,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Aprueba en servidor una solicitud de acceso a PDCA o RDA tras validar autoridad real.
 */
export const approve_access_request_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    const contexto_solicitud = await resolve_authorized_access_request(solicitud_callable, {
      require_access_request_type: true,
      require_existing_target: true,
    });

    const solicitante: RequesterIdentity = {
      requester_uid: clamp_string(contexto_solicitud.notification_data["requesterUid"], 128),
      requester_name: clamp_string(contexto_solicitud.notification_data["requesterName"], 120),
      requester_email: normalize_email(contexto_solicitud.notification_data["requesterEmail"]),
    };

    if (contexto_solicitud.module_type === "PDCA") {
      await append_pdca_assignment(
        contexto_solicitud.target_ref,
        contexto_solicitud.target_data,
        solicitante,
      );
    } else {
      await append_rda_assignment(
        contexto_solicitud.target_ref,
        contexto_solicitud.target_data,
        solicitante,
      );
    }

    await update_related_notifications_batch(contexto_solicitud.related_ids, { approved: true });

    const titulo_documento = clamp_string(contexto_solicitud.notification_data["pdcaTitle"], 200);
    await firestore_db.collection("notifications").add({
      userId: solicitante.requester_name || solicitante.requester_email,
      recipientUid: solicitante.requester_uid,
      recipientEmail: solicitante.requester_email,
      senderUid: contexto_solicitud.caller.uid,
      requesterUid: solicitante.requester_uid,
      requesterName: solicitante.requester_name,
      requesterEmail: solicitante.requester_email,
      type: "access_approved",
      ...(contexto_solicitud.pdca_id ? { pdcaId: contexto_solicitud.pdca_id } : {}),
      ...(contexto_solicitud.rda_id ? { rdaId: contexto_solicitud.rda_id } : {}),
      pdcaTitle: titulo_documento,
      actionId: `access-ok-${contexto_solicitud.notification_id}`,
      message: `${contexto_solicitud.caller.name} aprobó tu solicitud de acceso para "${titulo_documento.slice(0, 120)}". Ya puedes abrirlo.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return {
      approved: true,
      targetDocId: contexto_solicitud.target_doc_id,
      module: contexto_solicitud.module_type,
    };
  },
);
