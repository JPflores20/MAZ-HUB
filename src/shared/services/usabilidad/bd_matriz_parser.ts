/**
 * bd_matriz_parser.ts
 * Orquestador para leer el libro Excel `"08. Analisis de 5Ws y RDAs.xlsx"` (hoja "BD" + "Hoja1")
 * y mantener caché en memoria del archivo base servido desde `/public`.
 */
import * as XLSX from "xlsx";
import { REPORTES_INCIDENTES_OFICIALES } from "@/domain/defaults/usabilidad_qir_defaults";
import type {
  RegistroAnalisis5WRda,
  ResumenReporteIncidente,
} from "@/domain/models/usabilidad/usabilidad_types";
import { mapear_fila_hoja_bd } from "./bd_row_mapper";
import { extraer_rubricas_de_hoja1, parsear_registros_solo_hoja1 } from "./hoja1_rubrica_parser";

/**
 * Parsea todas las filas válidas de la hoja maestra "BD" cruzándolas con las rúbricas de "Hoja1".
 *
 * @param hoja_bd - Hoja de cálculo correspondiente a la pestaña `"BD"`.
 * @param hoja_1 - Hoja de cálculo opcional correspondiente a la pestaña `"Hoja1"`.
 * @returns Arreglo de registros normalizados `RegistroAnalisis5WRda`.
 */
export function parsear_hoja_bd_maestra(
  hoja_bd: XLSX.WorkSheet,
  hoja_1: XLSX.WorkSheet | undefined,
): RegistroAnalisis5WRda[] {
  const { mapa_rubrica_por_ial, mapa_rubrica_por_titulo } = extraer_rubricas_de_hoja1(hoja_1);
  const lista_registros: RegistroAnalisis5WRda[] = [];
  const filas_bd = XLSX.utils.sheet_to_json<unknown[]>(hoja_bd, { header: 1, defval: "" });

  for (let indice_fila = 5; indice_fila < filas_bd.length; indice_fila++) {
    const fila_actual = filas_bd[indice_fila];
    if (!fila_actual) continue;

    const registro_mapeado = mapear_fila_hoja_bd(
      fila_actual,
      indice_fila,
      lista_registros.length + 1,
      mapa_rubrica_por_ial,
      mapa_rubrica_por_titulo,
    );
    if (registro_mapeado) {
      lista_registros.push(registro_mapeado);
    }
  }

  return lista_registros;
}

/**
 * Parsea un `ArrayBuffer` completo de un libro Excel de Usabilidad.
 *
 * @param buffer_archivo - Bytes binarios del archivo `.xlsx` o `.xls`.
 * @returns Objeto con registros analizados y reportes oficiales de incidentes QIR.
 */
export function parsear_libro_excel_usabilidad(buffer_archivo: ArrayBuffer): {
  registros_analisis: RegistroAnalisis5WRda[];
  reportes_incidentes: ResumenReporteIncidente[];
} {
  const libro_excel = XLSX.read(buffer_archivo, { type: "array" });
  const hoja_bd = libro_excel.Sheets["BD"];
  const hoja_1 = libro_excel.Sheets["Hoja1"];

  const registros_analisis = hoja_bd
    ? parsear_hoja_bd_maestra(hoja_bd, hoja_1)
    : hoja_1
      ? parsear_registros_solo_hoja1(hoja_1)
      : [];

  return { registros_analisis, reportes_incidentes: REPORTES_INCIDENTES_OFICIALES };
}

let cache_excel_base: {
  registros_analisis: RegistroAnalisis5WRda[];
  reportes_incidentes: ResumenReporteIncidente[];
} | null = null;

/**
 * Descarga (una sola vez por sesión) y parsea el libro oficial base desde `/public`.
 *
 * @returns Promesa con los registros base y reportes QIR precargados.
 */
export async function cargar_excel_base_usabilidad(): Promise<{
  registros_analisis: RegistroAnalisis5WRda[];
  reportes_incidentes: ResumenReporteIncidente[];
}> {
  if (cache_excel_base) return cache_excel_base;
  const respuesta_http = await fetch("/08.%20Analisis%20de%205Ws%20y%20RDAs.xlsx");
  if (!respuesta_http.ok) {
    throw new Error(`No se pudo cargar el archivo base: ${respuesta_http.statusText}`);
  }
  const buffer_archivo = await respuesta_http.arrayBuffer();
  cache_excel_base = parsear_libro_excel_usabilidad(buffer_archivo);
  return cache_excel_base;
}
