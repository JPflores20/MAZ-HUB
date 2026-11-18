/**
 * pdca_seed_service.ts
 * Servicio de configuración base y seeding inicial de la colección `pdcas` en Firestore.
 */
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import { SEED_PDCAS } from "@/domain/seeds/pdca_seed";
import { set_pdca_snapshot } from "./pdca_cache_service";

export const PDCA_COLLECTION = "pdcas";
export const CONFIG_DOC_ID = "_config";

/**
 * Puebla la colección `pdcas` con los documentos iniciales de demostración y marca `_config.isSeeded`.
 * Sólo debe invocarse manualmente por cuentas administrativas cuando la colección está vacía.
 */
export async function seed_initial_pdcas(): Promise<void> {
  for (const seed_pdca of SEED_PDCAS) {
    await setDoc(doc(db, PDCA_COLLECTION, seed_pdca.id), seed_pdca);
    set_pdca_snapshot(seed_pdca.id, seed_pdca);
  }

  await setDoc(doc(db, PDCA_COLLECTION, CONFIG_DOC_ID), {
    isSeeded: true,
  });

  console.info(`[pdca_seed_service] Seeding completado: ${SEED_PDCAS.length} PDCAs insertados.`);
}

/**
 * Verifica mediante el documento de configuración si la colección ya fue inicializada.
 *
 * @param snapshot_docs - Arreglo de snapshots pertenecientes a la colección `pdcas`.
 * @returns `true` si existe `_config` con `isSeeded === true`.
 */
export function is_collection_seeded(
  snapshot_docs: { id: string; data: () => Record<string, unknown> }[],
): boolean {
  const config_doc = snapshot_docs.find((snapshot_doc) => snapshot_doc.id === CONFIG_DOC_ID);
  return config_doc?.data()?.["isSeeded"] === true;
}

/**
 * Devuelve la referencia de Firestore a la colección principal de PDCAs.
 *
 * @returns `CollectionReference` apuntando a `pdcas`.
 */
export function get_pdca_collection_ref() {
  return collection(db, PDCA_COLLECTION);
}
