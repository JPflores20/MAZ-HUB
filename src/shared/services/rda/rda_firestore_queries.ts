/**
 * rda_firestore_queries.ts
 * Operaciones de lectura única y suscripción en tiempo real para documentos RDA en Firestore.
 */
import { collection, getDocs, limit, onSnapshot, query } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type { Rda } from "@/domain/models/rda";
import { RDA_COLLECTION, rda_snapshot_cache } from "./rda_snapshot_cache";

/**
 * Extrae documentos RDA del snapshot recibido y sincroniza la caché en memoria.
 *
 * @param snapshot_docs - Arreglo de documentos de Firestore (`QueryDocumentSnapshot`).
 * @returns Lista tipada de RDAs presentes en el snapshot.
 */
function extract_rdas_from_snapshot(
  snapshot_docs: { data: () => unknown }[],
): Rda[] {
  return snapshot_docs.map((doc_snapshot) => {
    const rda_record = doc_snapshot.data() as Rda;
    if (rda_record?.id) {
      rda_snapshot_cache.set(rda_record.id, rda_record);
    }
    return rda_record;
  });
}

/**
 * Recupera los documentos RDA desde Firestore en una única lectura.
 *
 * @param max_limit - Límite máximo opcional de documentos a consultar.
 * @returns Promesa con el arreglo de RDAs, o arreglo vacío si ocurre un fallo.
 */
export async function fetch_rdas(max_limit?: number): Promise<Rda[]> {
  try {
    const collection_ref = collection(db, RDA_COLLECTION);
    const fetch_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

    const query_snapshot = await getDocs(fetch_query);
    return extract_rdas_from_snapshot(query_snapshot.docs);
  } catch (fetch_error) {
    console.error("[rda_firestore_queries] Error al obtener RDAs:", fetch_error);
    return [];
  }
}

/**
 * Abre una suscripción en tiempo real sobre la colección `rdas`.
 *
 * @param on_update - Callback que recibe el arreglo actualizado de RDAs.
 * @param max_limit - Límite máximo opcional de documentos observados.
 * @returns Función para cancelar la suscripción.
 */
export function subscribe_to_rdas(
  on_update: (rdas: Rda[]) => void,
  max_limit?: number,
): () => void {
  const collection_ref = collection(db, RDA_COLLECTION);
  const subscribe_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

  return onSnapshot(
    subscribe_query,
    (query_snapshot) => {
      on_update(extract_rdas_from_snapshot(query_snapshot.docs));
    },
    (listener_error) => {
      console.error("[rda_firestore_queries] Error en listener en tiempo real:", listener_error);
    },
  );
}
