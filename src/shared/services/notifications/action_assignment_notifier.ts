/**
 * action_assignment_notifier.ts
 * Helper compartido para despachar notificaciones en Firestore cuando se asigna
 * un nuevo responsable a una acción de PDCA o a una acción PDA de un RDA.
 */
import { db, primary_auth } from "@/core/config/firebase";

export interface ActionAssignmentItem {
  id: string;
  responsable?: string | undefined;
  who?: string | undefined;
  accion?: string | undefined;
  what?: string | undefined;
}

export interface AssignmentNotificationTarget {
  entity_type: "pdca" | "rda";
  entity_id: string;
  notification_title: string;
}

/**
 * Extrae y normaliza el identificador del responsable de una acción.
 *
 * @param action_item - Acción del plan PDCA o PDA del RDA.
 * @returns Nombre o identificador limpio del responsable, o cadena vacía si no aplica.
 */
function extract_action_responsable(action_item: ActionAssignmentItem | undefined): string {
  if (!action_item) return "";
  return (action_item.responsable || action_item.who || "").trim();
}

/**
 * Compara acciones previas y nuevas para notificar en Firestore únicamente a quienes
 * acaban de ser asignados como responsables, evitando duplicados en guardados subsecuentes.
 *
 * @param previous_actions - Lista de acciones del último snapshot guardado.
 * @param next_actions - Lista actualizada de acciones que se está guardando.
 * @param target_metadata - Metadatos del PDCA o RDA padre para armar la notificación.
 */
export function notify_new_action_assignments(
  previous_actions: ActionAssignmentItem[],
  next_actions: ActionAssignmentItem[],
  target_metadata: AssignmentNotificationTarget,
): void {
  const auth_uid = primary_auth?.currentUser?.uid;
  if (!auth_uid || next_actions.length === 0) return;

  next_actions.forEach((current_action) => {
    const previous_action = previous_actions.find(
      (candidate_action) => candidate_action.id === current_action.id,
    );
    const current_responsable = extract_action_responsable(current_action);
    const previous_responsable = extract_action_responsable(previous_action);

    if (!current_responsable || current_responsable === previous_responsable) {
      return;
    }

    const action_label = current_action.accion || current_action.what || "Nueva Acción";
    const assignment_message =
      target_metadata.entity_type === "pdca"
        ? `Has sido asignado como responsable en la acción: ${action_label}`
        : `Has sido asignado como responsable en el PDA del RDA: ${action_label}`;

    const entity_link_field =
      target_metadata.entity_type === "pdca"
        ? { pdcaId: target_metadata.entity_id }
        : { rdaId: target_metadata.entity_id };

    // Importación dinámica para mantener ligero el bundle inicial cuando no hay asignaciones nuevas.
    import("firebase/firestore").then(({ collection, addDoc }) => {
      addDoc(collection(db, "notifications"), {
        userId: current_responsable,
        senderUid: auth_uid,
        type: "task_assigned",
        ...entity_link_field,
        pdcaTitle: target_metadata.notification_title,
        actionId: current_action.id,
        message: assignment_message,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch((notification_error) =>
        console.error(
          `[action_assignment_notifier] Error al crear notificación (${target_metadata.entity_type}):`,
          notification_error,
        ),
      );
    });
  });
}
