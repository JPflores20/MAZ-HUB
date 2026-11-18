/**
 * platform_sync_service.ts
 * Orquestador de sincronización en vivo que unifica RDAs y PDCAs de la plataforma
 * dentro de un mismo arreglo compatible con Usabilidad y Severidad.
 */
import type { Pdca } from "@/domain/pdca";
import type { Rda } from "@/domain/models/rda";
import type { RegistroAnalisis5WRda } from "@/domain/models/usabilidad/usabilidad_types";
import { map_pdca_to_usabilidad_record } from "./platform_pdca_mapper";
import { map_rda_to_usabilidad_record } from "./platform_rda_mapper";

/**
 * Convierte un arreglo de RDAs y PDCAs activos al modelo unificado `RegistroAnalisis5WRda`.
 *
 * @param lista_rdas - Lista actual de RDAs de Firestore.
 * @param lista_pdcas - Lista actual de PDCAs de Firestore.
 * @returns Arreglo combinado de registros de plataforma listos para filtrar y graficar.
 */
export function mapear_rdas_y_pdcas_a_registros(
  lista_rdas: Rda[],
  lista_pdcas: Pdca[],
): RegistroAnalisis5WRda[] {
  return [
    ...lista_rdas.map(map_rda_to_usabilidad_record),
    ...lista_pdcas.map(map_pdca_to_usabilidad_record),
  ];
}
