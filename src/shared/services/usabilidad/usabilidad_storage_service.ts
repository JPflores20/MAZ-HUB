/**
 * usabilidad_storage_service.ts
 * Servicio de persistencia local (`localStorage`) para registros personalizados,
 * archivos Excel importados y ediciones de rúbrica 5W o matriz de severidad.
 */
import type { RegistroAnalisis5WRda } from "@/domain/models/usabilidad/usabilidad_types";

const CLAVE_STORAGE_REGISTROS_PERSONALIZADOS = "maz_hub_usabilidad_custom_records_v2";
const CLAVE_STORAGE_OVERRIDES_REGISTROS = "maz_hub_usabilidad_overrides_v2";

/**
 * Obtiene la lista de registros agregados manualmente o importados por el usuario desde `localStorage`.
 *
 * @returns Arreglo de registros personalizados o arreglo vacío si no hay datos válidos.
 */
export function obtener_registros_personalizados(): RegistroAnalisis5WRda[] {
  try {
    const json_crudo = localStorage.getItem(CLAVE_STORAGE_REGISTROS_PERSONALIZADOS);
    if (!json_crudo) return [];
    const parsed_records = JSON.parse(json_crudo);
    return Array.isArray(parsed_records) ? (parsed_records as RegistroAnalisis5WRda[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persiste la lista completa de registros personalizados o importados en `localStorage`.
 *
 * @param lista_registros - Arreglo actualizado de registros personalizados.
 */
export function guardar_registros_personalizados(
  lista_registros: RegistroAnalisis5WRda[],
): void {
  try {
    localStorage.setItem(
      CLAVE_STORAGE_REGISTROS_PERSONALIZADOS,
      JSON.stringify(lista_registros),
    );
  } catch (error_storage) {
    console.error("Error al guardar registros personalizados en localStorage:", error_storage);
  }
}

/**
 * Obtiene el diccionario de modificaciones (overrides) aplicadas sobre registros existentes.
 *
 * @returns Mapa indexado por ID de registro con parches parciales de campos editados.
 */
export function obtener_overrides_registros(): Record<
  string,
  Partial<RegistroAnalisis5WRda>
> {
  try {
    const json_crudo = localStorage.getItem(CLAVE_STORAGE_OVERRIDES_REGISTROS);
    if (!json_crudo) return {};
    const parsed_overrides = JSON.parse(json_crudo);
    return parsed_overrides && typeof parsed_overrides === "object"
      ? (parsed_overrides as Record<string, Partial<RegistroAnalisis5WRda>>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Guarda o actualiza un parche de propiedades sobre un registro específico por su ID.
 *
 * @param id_registro - Identificador único del registro afectado.
 * @param parche_cambios - Subconjunto de propiedades a fusionar en el override local.
 */
export function guardar_override_registro(
  id_registro: string,
  parche_cambios: Partial<RegistroAnalisis5WRda>,
): void {
  try {
    const diccionario_actual = obtener_overrides_registros();
    diccionario_actual[id_registro] = {
      ...(diccionario_actual[id_registro] || {}),
      ...parche_cambios,
    };
    localStorage.setItem(
      CLAVE_STORAGE_OVERRIDES_REGISTROS,
      JSON.stringify(diccionario_actual),
    );
  } catch (error_storage) {
    console.error("Error al guardar override del registro:", error_storage);
  }
}
