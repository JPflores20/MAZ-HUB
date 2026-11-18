/**
 * pdca_firestore_mutations.ts
 * Operaciones de escritura, actualización granular, asignación de equipo y eliminación de PDCAs
 * en Firestore, manteniendo externalización automática de medios y notificaciones a responsables.
 */
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, primary_auth } from "@/core/config/firebase";
import type { ActionItem, Pdca } from "@/domain/models/pdca";
import {
  DocumentTooLargeError,
  FIRESTORE_SAFE_DOC_BYTES,
  estimate_document_bytes,
  externalize_inline_media,
} from "@/shared/services/media/inline_media_service";
import { notify_new_action_assignments } from "@/shared/services/notifications/action_assignment_notifier";
import {
  get_pdca_snapshot,
  get_shallow_diff,
  patch_pdca_snapshot,
  remove_pdca_snapshot,
  set_pdca_snapshot,
} from "./pdca_cache_service";
import { PDCA_COLLECTION } from "./pdca_seed_service";

/**
 * Estampa campos de propiedad y metadatos normalizados al crear por primera vez un PDCA.
 *
 * @param clean_pdca - Objeto JSON limpio próximo a persistirse.
 */
function stamp_pdca_creation_ownership(clean_pdca: Record<string, unknown>): void {
  const auth_uid = primary_auth?.currentUser?.uid;
  const auth_email = primary_auth?.currentUser?.email?.trim().toLowerCase();
  if (!auth_uid) return;

  if (!clean_pdca["ownerUid"]) {
    clean_pdca["ownerUid"] = auth_uid;
  }
  if (!clean_pdca["autorEmail"] && auth_email) {
    clean_pdca["autorEmail"] = auth_email;
  } else if (typeof clean_pdca["autorEmail"] === "string") {
    clean_pdca["autorEmail"] = clean_pdca["autorEmail"].trim().toLowerCase();
  }

  if (Array.isArray(clean_pdca["asignados"])) {
    const assigned_emails = (clean_pdca["asignados"] as { email?: string }[])
      .map((assigned_member) => (assigned_member?.email || "").trim().toLowerCase())
      .filter(Boolean);
    if (assigned_emails.length > 0 && !Array.isArray(clean_pdca["assignedEmails"])) {
      clean_pdca["assignedEmails"] = Array.from(new Set(assigned_emails));
    }
  }
}

/**
 * Persiste un PDCA en Firestore usando actualización granular por diff cuando ya existe snapshot,
 * o `setDoc` con merge cuando es nuevo. Externaliza previamente imágenes/PDFs embebidos en Base64.
 *
 * @param pdca_record - Documento PDCA actualizado.
 */
export async function save_pdca_to_firestore(pdca_record: Pdca): Promise<void> {
  let pdca_with_urls: Pdca = pdca_record;
  try {
    const externalized_result = await externalize_inline_media(pdca_record, "pdca_images");
    pdca_with_urls = externalized_result.value;
  } catch (media_error) {
    console.warn(
      "[pdca_firestore_mutations] No se pudieron externalizar medios en línea:",
      media_error,
    );
  }

  const clean_pdca = JSON.parse(JSON.stringify(pdca_with_urls)) as Record<string, unknown>;
  const original_snapshot = get_pdca_snapshot(pdca_record.id);

  if (!original_snapshot) {
    stamp_pdca_creation_ownership(clean_pdca);
  }

  const document_bytes = estimate_document_bytes(clean_pdca);
  if (document_bytes > FIRESTORE_SAFE_DOC_BYTES) {
    throw new DocumentTooLargeError(document_bytes);
  }

  try {
    const document_ref = doc(db, PDCA_COLLECTION, pdca_record.id);

    if (original_snapshot) {
      const original_pdca = JSON.parse(original_snapshot) as Record<string, unknown>;
      const changed_fields = get_shallow_diff(original_pdca, clean_pdca);

      if (Object.keys(changed_fields).length === 0) {
        return;
      }

      const previous_actions = (original_pdca["acciones"] as ActionItem[]) || [];
      const next_actions = pdca_with_urls.acciones || [];
      notify_new_action_assignments(previous_actions, next_actions, {
        entity_type: "pdca",
        entity_id: pdca_record.id,
        notification_title: pdca_record.titulo,
      });

      await updateDoc(document_ref, changed_fields);
    } else {
      await setDoc(document_ref, clean_pdca, { merge: true });
    }

    set_pdca_snapshot(pdca_record.id, clean_pdca);
  } catch (primary_error) {
    console.error("[pdca_firestore_mutations] Error al guardar PDCA:", primary_error);

    try {
      const document_ref = doc(db, PDCA_COLLECTION, pdca_record.id);
      await setDoc(document_ref, clean_pdca, { merge: true });
      set_pdca_snapshot(pdca_record.id, clean_pdca);
    } catch (fallback_error) {
      console.error("[pdca_firestore_mutations] Error en fallback de guardado:", fallback_error);
      throw fallback_error;
    }
  }
}

/**
 * Elimina un documento PDCA de Firestore y limpia su snapshot local en caché.
 *
 * @param pdca_id - Identificador del PDCA a eliminar.
 */
export async function delete_pdca_from_firestore(pdca_id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PDCA_COLLECTION, pdca_id));
    remove_pdca_snapshot(pdca_id);
  } catch (delete_error) {
    console.error("[pdca_firestore_mutations] Error al eliminar PDCA:", delete_error);
  }
}

/**
 * Actualiza únicamente la fecha límite (`fechaFinalizacion`) de un PDCA sin reescribir el documento.
 *
 * @param pdca_id - Identificador del PDCA.
 * @param fecha_finalizacion - Nueva fecha límite o `null` para limpiarla.
 */
export async function update_pdca_deadline(
  pdca_id: string,
  fecha_finalizacion: string | null,
): Promise<void> {
  try {
    const document_ref = doc(db, PDCA_COLLECTION, pdca_id);
    const deadline_value = fecha_finalizacion ?? "";
    await updateDoc(document_ref, { fechaFinalizacion: deadline_value });
    patch_pdca_snapshot(pdca_id, { fechaFinalizacion: deadline_value });
  } catch (deadline_error) {
    console.error("[pdca_firestore_mutations] Error al actualizar fecha límite:", deadline_error);
  }
}

/**
 * Actualiza únicamente los miembros asignados (`asignados`, `equipo`, `assignedEmails`) de un PDCA.
 *
 * @param pdca_id - Identificador del PDCA.
 * @param assigned_members - Lista actualizada de usuarios asignados.
 */
export async function update_pdca_assigned_users(
  pdca_id: string,
  assigned_members: { name: string; email: string }[],
): Promise<void> {
  try {
    const document_ref = doc(db, PDCA_COLLECTION, pdca_id);
    const team_names = assigned_members.map((assigned_user) => assigned_user.name);
    const assigned_emails = Array.from(
      new Set(
        assigned_members
          .map((assigned_user) => (assigned_user.email || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    );
    await updateDoc(document_ref, {
      asignados: assigned_members,
      equipo: team_names,
      assignedEmails: assigned_emails,
    });
    patch_pdca_snapshot(pdca_id, {
      asignados: assigned_members,
      equipo: team_names,
      assignedEmails: assigned_emails,
    });
  } catch (assignment_error) {
    console.error(
      "[pdca_firestore_mutations] Error al actualizar usuarios asignados:",
      assignment_error,
    );
  }
}
