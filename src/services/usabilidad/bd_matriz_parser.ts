/**
 * bd_matriz_parser.ts
 * Parser de la hoja maestra "BD" del libro "08. Analisis de 5Ws y RDAs.xlsx"
 * y cargador con caché en memoria del archivo base ubicado en /public.
 */
import * as XLSX from "xlsx";
import { calcular_puntaje_severidad } from "@/data/usabilidad/usabilidad_calculators";
import { REPORTES_INCIDENTES_OFICIALES } from "@/data/usabilidad/usabilidad_qir_defaults";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
  ResumenReporteIncidente,
} from "@/data/usabilidad/usabilidad_types";
import {
  convertir_fecha_excel_a_iso,
  es_marca_afirmativa,
  normalizar_calificacion_decimal,
} from "./excel_date_utils";
import { extraer_rubricas_de_hoja1, parsear_registros_solo_hoja1 } from "./hoja1_rubrica_parser";

/**
 * Parsea las filas de la hoja maestra "BD" y las cruza con las rúbricas de "Hoja1".
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

    const fecha_cruda = fila_actual[4];
    const descripcion_limpia = String(fila_actual[6] ?? "").replace(/^'+|'+$/g, "").trim();
    const responsable_limpio = String(fila_actual[7] ?? "").trim();
    if (!fecha_cruda && !descripcion_limpia && !responsable_limpio) continue;

    const datos_fecha = convertir_fecha_excel_a_iso(fecha_cruda);
    const semana_evento = Number(fila_actual[1]) || datos_fecha.semana;
    const mes_evento = Number(fila_actual[2]) || datos_fecha.mes;
    const anio_evento = Number(fila_actual[3]) || datos_fecha.anio;

    let id_ial = String(fila_actual[5] ?? "").trim();
    const coincidencia_hoja1 =
      (id_ial ? { id_ial, rubrica_5w: mapa_rubrica_por_ial.get(id_ial), puntaje_calificacion: null } : null) ||
      mapa_rubrica_por_titulo.get(descripcion_limpia.toLowerCase());

    if (!id_ial && coincidencia_hoja1?.id_ial) id_ial = coincidencia_hoja1.id_ial;

    let calificacion_ial = normalizar_calificacion_decimal(fila_actual[8]);
    if (calificacion_ial === null && coincidencia_hoja1?.puntaje_calificacion !== undefined && coincidencia_hoja1.puntaje_calificacion !== null) {
      calificacion_ial = coincidencia_hoja1.puntaje_calificacion;
    }

    const texto_estatus = String(fila_actual[10] ?? "").trim().toLowerCase();
    const estatus_analisis = texto_estatus.includes("complet")
      ? "Completo"
      : texto_estatus.includes("proceso") || texto_estatus.includes("curso")
        ? "En Proceso"
        : "Pendiente";

    const texto_herramienta = String(fila_actual[16] ?? "5W").trim().toUpperCase();
    const tipo_herramienta = texto_herramienta === "RDA" ? "RDA" : texto_herramienta === "PDCA" ? "PDCA" : "5W";

    const pilares_sdca: MapaPilaresSdca = {
      owd: es_marca_afirmativa(fila_actual[17]),
      skap: es_marca_afirmativa(fila_actual[18]),
      cinco_s: es_marca_afirmativa(fila_actual[19]),
      mapeo_proceso: es_marca_afirmativa(fila_actual[20]),
      arbol_kpi: es_marca_afirmativa(fila_actual[21]),
      sop_opl: es_marca_afirmativa(fila_actual[22]),
      plan_reaccion: es_marca_afirmativa(fila_actual[23]),
      gops: es_marca_afirmativa(fila_actual[24]),
      bom: es_marca_afirmativa(fila_actual[25]),
      partes_refacciones: es_marca_afirmativa(fila_actual[26]),
      material_defectuoso: es_marca_afirmativa(fila_actual[27]),
      sic: es_marca_afirmativa(fila_actual[28]),
    };

    const criterios_severidad: CriteriosSeveridad = {
      perdida_mayor_50hl: es_marca_afirmativa(fila_actual[29]),
      tiempo_inactividad_mayor_3h: es_marca_afirmativa(fila_actual[30]),
      volumen_destruir_retrabajo: es_marca_afirmativa(fila_actual[31]),
      incidente_recurrente: es_marca_afirmativa(fila_actual[32]),
      fallo_tecnico_inusual: es_marca_afirmativa(fila_actual[33]),
      volumen_bloqueado_apartado: es_marca_afirmativa(fila_actual[34]),
      impacto_planificacion: es_marca_afirmativa(fila_actual[35]),
    };

    const resultado_severidad = calcular_puntaje_severidad(criterios_severidad);
    const estatus_qir_crudo = String(fila_actual[39] ?? "").trim().toUpperCase();

    lista_registros.push({
      id: `excel-bd-${indice_fila}`,
      numero_consecutivo: Number(fila_actual[0]) || lista_registros.length + 1,
      semana_evento,
      mes_evento,
      anio_evento,
      fecha_evento: datos_fecha.fecha_iso,
      id_ial,
      descripcion_falla: descripcion_limpia || "Sin descripción",
      nombre_responsable: responsable_limpio ? responsable_limpio.toUpperCase() : "SIN ASIGNAR",
      calificacion_ial,
      kpi_afectado: String(fila_actual[9] ?? "").trim().toUpperCase() || "NA",
      estatus_analisis,
      area_operativa: String(fila_actual[11] ?? "").trim().toUpperCase() || "COCIMIENTOS",
      proceso_cervecero: String(fila_actual[12] ?? "").trim() || "General",
      equipo_afectado: String(fila_actual[13] ?? "").trim().toUpperCase() || "GENERAL",
      marca_cerveza: String(fila_actual[14] ?? "").trim().toUpperCase() || "NA",
      variable_afectada: String(fila_actual[15] ?? "").trim() || "NA",
      tipo_herramienta,
      pilares_sdca,
      criterios_severidad,
      porcentaje_severidad: resultado_severidad.porcentaje_severidad,
      clasificacion_incidente: resultado_severidad.clasificacion,
      estatus_reporte_incidente:
        resultado_severidad.clasificacion === "Precursor"
          ? "NA"
          : estatus_qir_crudo === "ENVIADO" || estatus_qir_crudo === "SI"
            ? "ENVIADO"
            : "PENDIENTE",
      rubrica_5w: coincidencia_hoja1?.rubrica_5w,
      origen_registro: "excel_base",
    });
  }

  return lista_registros;
}

/**
 * Parsea un ArrayBuffer completo del libro Excel de Usabilidad.
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
 * Carga y parsea el archivo oficial "08. Analisis de 5Ws y RDAs.xlsx" desde /public.
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
