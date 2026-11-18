/**
 * pdca_cache_service.ts
 * Caché en memoria para documentos PDCA y cálculo de diffs granulares,
 * minimizando escrituras redundantes hacia Firestore sin depender de React/Firebase.
 */

/** Mapa de `pdca_id` → JSON serializado del último estado confirmado. */
const pdca_snapshot_cache = new Map<string, string>();

/**
 * Guarda o actualiza el snapshot serializado de un PDCA en caché.
 *
 * @param pdca_id - Identificador único del documento PDCA.
 * @param pdca_data - Estado actual del PDCA a serializar.
 */
export function set_pdca_snapshot(pdca_id: string, pdca_data: object): void {
  pdca_snapshot_cache.set(pdca_id, JSON.stringify(pdca_data));
}

/**
 * Recupera el snapshot JSON serializado de un PDCA desde caché, si existe.
 *
 * @param pdca_id - Identificador único del documento PDCA.
 * @returns Cadena JSON del último snapshot guardado o `undefined`.
 */
export function get_pdca_snapshot(pdca_id: string): string | undefined {
  return pdca_snapshot_cache.get(pdca_id);
}

/**
 * Elimina el snapshot en caché asociado a un PDCA eliminado o invalidado.
 *
 * @param pdca_id - Identificador único del documento PDCA.
 */
export function remove_pdca_snapshot(pdca_id: string): void {
  pdca_snapshot_cache.delete(pdca_id);
}

/**
 * Aplica un parche parcial sobre el snapshot en caché sin re-serializar desde fuera.
 *
 * @param pdca_id - Identificador del PDCA en caché.
 * @param partial_update - Subconjunto de propiedades actualizadas.
 */
export function patch_pdca_snapshot(
  pdca_id: string,
  partial_update: Record<string, unknown>,
): void {
  const existing_snapshot = pdca_snapshot_cache.get(pdca_id);
  if (!existing_snapshot) return;

  const parsed_snapshot = JSON.parse(existing_snapshot) as Record<string, unknown>;
  const updated_snapshot = { ...parsed_snapshot, ...partial_update };
  pdca_snapshot_cache.set(pdca_id, JSON.stringify(updated_snapshot));
}

/**
 * Compara dos valores arbitrarios de forma estructural recursiva.
 *
 * @param first_value - Primer valor a comparar.
 * @param second_value - Segundo valor a comparar.
 * @returns `true` cuando ambos valores tienen estructura y valores equivalentes.
 */
export function is_deep_equal(first_value: unknown, second_value: unknown): boolean {
  if (first_value === second_value) return true;

  if (
    typeof first_value !== "object" ||
    typeof second_value !== "object" ||
    first_value == null ||
    second_value == null
  ) {
    return false;
  }

  if (Array.isArray(first_value) !== Array.isArray(second_value)) return false;

  const first_keys = Object.keys(first_value as object);
  const second_keys = Object.keys(second_value as object);

  if (first_keys.length !== second_keys.length) return false;

  return first_keys.every((property_key) =>
    is_deep_equal(
      (first_value as Record<string, unknown>)[property_key],
      (second_value as Record<string, unknown>)[property_key],
    ),
  );
}

/**
 * Calcula las diferencias superficiales de primer nivel comparando propiedades en profundidad.
 *
 * @param original_record - Estado base previo del documento.
 * @param current_record - Nuevo estado del documento por guardar.
 * @returns Diccionario únicamente con los campos de primer nivel que cambiaron en `current_record`.
 */
export function get_shallow_diff(
  original_record: Record<string, unknown>,
  current_record: Record<string, unknown>,
): Record<string, unknown> {
  const diff_record: Record<string, unknown> = {};

  for (const property_key in current_record) {
    if (!is_deep_equal(original_record[property_key], current_record[property_key])) {
      diff_record[property_key] = current_record[property_key];
    }
  }

  return diff_record;
}
