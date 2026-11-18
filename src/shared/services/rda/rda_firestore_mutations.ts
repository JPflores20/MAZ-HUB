/**
 * rda_firestore_mutations.ts
 * Operaciones de creación, actualización completa con externalización de medios y borrado
 * de Reportes de Anomalía (RDA) en Firestore.
 */
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db, primary_auth } from "@/core/config/firebase";
import type { Rda } from "@/domain/models/rda";
import { generate_next_rda_folio } from "@/features/rda";
import {
  DocumentTooLargeError,
  FIRESTORE_SAFE_DOC_BYTES,
  estimate_document_bytes,
  externalize_inline_media,
} from "@/shared/services/media/inline_media_service";
import { notify_new_action_assignments } from "@/shared/services/notifications/action_assignment_notifier";
import {
  RDA_COLLECTION,
  rda_snapshot_cache,
  with_write_ack_timeout,
} from "./rda_snapshot_cache";

/**
 * Asegura un folio secuencial válido si el documento aún no tiene folio asignado.
 *
 * @param target_rda - Objeto RDA que está por persistirse.
 */
function ensure_rda_folio(target_rda: Rda): void {
  if (!target_rda.context?.folio?.trim()) {
    target_rda.context = {
      ...target_rda.context,
      folio: generate_next_rda_folio(Array.from(rda_snapshot_cache.values())),
    };
  }
}

/**
 * Crea un nuevo documento RDA en Firestore estampando `ownerUid`, `autorEmail` normalizado
 * y folio automático cuando falta.
 *
 * @param rda_record - Datos iniciales del RDA.
 */
export async function create_rda(rda_record: Rda): Promise<void> {
  try {
    const document_ref = doc(db, RDA_COLLECTION, rda_record.id);
    const clean_rda = JSON.parse(JSON.stringify(rda_record)) as Rda & { ownerUid?: string };
    const auth_uid = primary_auth?.currentUser?.uid;
    const auth_email = primary_auth?.currentUser?.email?.trim().toLowerCase();

    if (auth_uid && !clean_rda.ownerUid) {
      clean_rda.ownerUid = auth_uid;
    }
    if (clean_rda.portada) {
      if (clean_rda.portada.autorEmail) {
        clean_rda.portada.autorEmail = clean_rda.portada.autorEmail.trim().toLowerCase();
      } else if (auth_email) {
        clean_rda.portada.autorEmail = auth_email;
      }
    }

    ensure_rda_folio(clean_rda);
    await with_write_ack_timeout(setDoc(document_ref, clean_rda));
    rda_snapshot_cache.set(rda_record.id, clean_rda);
  } catch (create_error) {
    console.error("[rda_firestore_mutations] Error al crear RDA:", create_error);
    throw create_error;
  }
}

/**
 * Guarda el RDA completo externalizando evidencias Base64 a Storage, actualizando `updatedAt`,
 * notificando nuevos responsables en el PDA y escribiendo el documento sin `merge` para conservar
 * eliminaciones dentro de arreglos u objetos anidados.
 *
 * @param rda_record - Estado actualizado del RDA desde el editor.
 * @returns Promesa con el objeto RDA final efectivamente persistido.
 */
export async function update_rda(rda_record: Rda): Promise<Rda> {
  try {
    const { value: externalized_rda } = await externalize_inline_media(rda_record, "rda_images");
    const clean_rda: Rda = JSON.parse(
      JSON.stringify({ ...externalized_rda, updatedAt: new Date().toISOString() }),
    );
    ensure_rda_folio(clean_rda);

    const document_bytes = estimate_document_bytes(clean_rda);
    if (document_bytes > FIRESTORE_SAFE_DOC_BYTES) {
      throw new DocumentTooLargeError(document_bytes);
    }

    const auth_uid = primary_auth?.currentUser?.uid;
    const clean_rda_with_owner = clean_rda as Rda & { ownerUid?: string };
    if (auth_uid && !clean_rda_with_owner.ownerUid && !rda_snapshot_cache.get(rda_record.id)) {
      clean_rda_with_owner.ownerUid = auth_uid;
    }

    const previous_rda = rda_snapshot_cache.get(rda_record.id);
    const rda_label = clean_rda.title || clean_rda.context?.folio || `RDA ${clean_rda.id}`;
    notify_new_action_assignments(previous_rda?.pda || [], clean_rda.pda || [], {
      entity_type: "rda",
      entity_id: clean_rda.id,
      notification_title: `RDA: ${rda_label}`,
    });

    await with_write_ack_timeout(setDoc(doc(db, RDA_COLLECTION, rda_record.id), clean_rda));
    rda_snapshot_cache.set(rda_record.id, clean_rda);
    return clean_rda;
  } catch (update_error) {
    console.error("[rda_firestore_mutations] Error al actualizar RDA:", update_error);
    throw update_error;
  }
}

/**
 * Elimina un documento RDA de Firestore y lo remueve de la caché local.
 *
 * @param rda_id - Identificador del RDA a eliminar.
 */
export async function delete_rda(rda_id: string): Promise<void> {
  try {
    await with_write_ack_timeout(deleteDoc(doc(db, RDA_COLLECTION, rda_id)));
    rda_snapshot_cache.delete(rda_id);
  } catch (delete_error) {
    console.error("[rda_firestore_mutations] Error al eliminar RDA:", delete_error);
    throw delete_error;
  }
}
