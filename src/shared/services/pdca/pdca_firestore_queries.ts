/**
 * pdca_firestore_queries.ts
 * Operaciones de lectura única y suscripción en tiempo real sobre la colección `pdcas` en Firestore.
 */
import { getDocs, limit, onSnapshot, query } from "firebase/firestore";
import type { Pdca } from "@/domain/models/pdca";
import { set_pdca_snapshot } from "./pdca_cache_service";
import { CONFIG_DOC_ID, get_pdca_collection_ref } from "./pdca_seed_service";

/**
 * Convierte los documentos de un `QuerySnapshot` en objetos `Pdca`, excluyendo el documento
 * técnico `_config` y sincronizando la caché local en memoria para diffs posteriores.
 *
 * @param snapshot_docs - Documentos provenientes de `getDocs` o `onSnapshot`.
 * @returns Lista tipada de PDCAs válidos.
 */
export function extract_pdcas_from_snapshot(
  snapshot_docs: { id: string; data: () => unknown }[],
): Pdca[] {
  return snapshot_docs
    .filter((doc_snapshot) => doc_snapshot.id !== CONFIG_DOC_ID)
    .map((doc_snapshot) => {
      const pdca_record = doc_snapshot.data() as Pdca;
      set_pdca_snapshot(pdca_record.id, pdca_record);
      return pdca_record;
    });
}

/**
 * Obtiene todos los documentos PDCA desde Firestore en una única consulta.
 *
 * @param max_limit - Límite opcional de documentos a recuperar.
 * @returns Promesa con el arreglo de PDCAs, o arreglo vacío si ocurre un error de lectura.
 */
export async function fetch_pdcas_from_firestore(max_limit?: number): Promise<Pdca[]> {
  try {
    const collection_ref = get_pdca_collection_ref();
    const fetch_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

    const query_snapshot = await getDocs(fetch_query);
    return extract_pdcas_from_snapshot(query_snapshot.docs);
  } catch (fetch_error) {
    console.error("[pdca_firestore_queries] Error al obtener PDCAs:", fetch_error);
    return [];
  }
}

/**
 * Registra un listener en tiempo real sobre la colección PDCA.
 *
 * @param on_update - Callback invocado en cada actualización con la lista completa de PDCAs.
 * @param max_limit - Límite opcional de documentos observados.
 * @returns Función `unsubscribe` para cancelar la escucha al desmontar el consumidor.
 */
export function subscribe_to_pdcas(
  on_update: (pdcas: Pdca[]) => void,
  max_limit?: number,
): () => void {
  const collection_ref = get_pdca_collection_ref();
  const subscribe_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

  return onSnapshot(
    subscribe_query,
    (query_snapshot) => {
      on_update(extract_pdcas_from_snapshot(query_snapshot.docs));
    },
    (listener_error) => {
      console.error("[pdca_firestore_queries] Error en listener en tiempo real:", listener_error);
    },
  );
}
