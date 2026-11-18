/**
 * Cloud Function invocable para rechazar solicitudes de acceso a PDCA o RDA desde el servidor.
 * Valida autoridad real del aprobador antes de actualizar en lote las notificaciones vinculadas.
 */
import { onCall } from "firebase-functions/v2/https";
import { enforce_app_check } from "../core/firebase_admin";
import {
  resolve_authorized_access_request,
  update_related_notifications_batch,
} from "./access_request_context";

/**
 * Marca como leídas y rechazadas las notificaciones asociadas a la solicitud de acceso.
 */
export const reject_access_request_callable = onCall(
  { enforceAppCheck: enforce_app_check },
  async (solicitud_callable) => {
    const contexto_solicitud = await resolve_authorized_access_request(solicitud_callable, {
      require_access_request_type: false,
      require_existing_target: false,
    });

    await update_related_notifications_batch(contexto_solicitud.related_ids, { rejected: true });
    return { rejected: true };
  },
);
