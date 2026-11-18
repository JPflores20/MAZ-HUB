/**
 * bd_row_mapper.ts
 * Convierte una fila cruda de la hoja maestra "BD" del Excel de Usabilidad en un objeto
 * `RegistroAnalisis5WRda` cruzado con las rúbricas de calidad 5W provenientes de "Hoja1".
 */
import { calcular_puntaje_severidad } from "@/domain/calculators/usabilidad_calculators";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
  RubricaCalidad5W,
} from "@/domain/models/usabilidad/usabilidad_types";
import {
  convertir_fecha_excel_a_iso,
  es_marca_afirmativa,
  normalizar_calificacion_decimal,
} from "./excel_date_utils";

export interface CoincidenciaRubricaHoja1 {
  id_ial: string;
  rubrica_5w?: RubricaCalidad5W | undefined;
  puntaje_calificacion?: number | null | undefined;
}

/**
 * Mapea una fila individual de la hoja "BD" a `RegistroAnalisis5WRda` o `null` si está vacía.
 *
 * @param fila_actual - Celda-arreglo correspondiente a la fila de Excel en curso.
 * @param indice_fila - Índice de fila en la hoja "BD" para construir un ID único estable.
 * @param numero_secuencia - Número de orden de fila válida dentro del resultado.
 * @param mapa_rubrica_por_ial - Índice de rúbricas de Hoja1 indexadas por ID de IAL.
 * @param mapa_rubrica_por_titulo - Índice de rúbricas de Hoja1 indexadas por descripción normalizada.
 * @returns Registro parseado listo para agregarse a la matriz, o `null` si la fila carece de datos clave.
 */
export function mapear_fila_hoja_bd(
  fila_actual: unknown[],
  indice_fila: number,
  numero_secuencia: number,
  mapa_rubrica_por_ial: Map<string, RubricaCalidad5W>,
  mapa_rubrica_por_titulo: Map<string, CoincidenciaRubricaHoja1>,
): RegistroAnalisis5WRda | null {
  const fecha_cruda = fila_actual[4];
  const descripcion_limpia = String(fila_actual[6] ?? "").replace(/^'+|'+$/g, "").trim();
  const responsable_limpio = String(fila_actual[7] ?? "").trim();
  if (!fecha_cruda && !descripcion_limpia && !responsable_limpio) return null;

  const datos_fecha = convertir_fecha_excel_a_iso(fecha_cruda);
  const semana_evento = Number(fila_actual[1]) || datos_fecha.semana;
  const mes_evento = Number(fila_actual[2]) || datos_fecha.mes;
  const anio_evento = Number(fila_actual[3]) || datos_fecha.anio;

  let id_ial = String(fila_actual[5] ?? "").trim();
  const coincidencia_hoja1 =
    (id_ial
      ? { id_ial, rubrica_5w: mapa_rubrica_por_ial.get(id_ial), puntaje_calificacion: null }
      : null) || mapa_rubrica_por_titulo.get(descripcion_limpia.toLowerCase());

  if (!id_ial && coincidencia_hoja1?.id_ial) id_ial = coincidencia_hoja1.id_ial;

  let calificacion_ial = normalizar_calificacion_decimal(fila_actual[8]);
  if (
    calificacion_ial === null &&
    coincidencia_hoja1?.puntaje_calificacion !== undefined &&
    coincidencia_hoja1.puntaje_calificacion !== null
  ) {
    calificacion_ial = coincidencia_hoja1.puntaje_calificacion;
  }

  const texto_estatus = String(fila_actual[10] ?? "").trim().toLowerCase();
  const estatus_analisis = texto_estatus.includes("complet")
    ? "Completo"
    : texto_estatus.includes("proceso") || texto_estatus.includes("curso")
      ? "En Proceso"
      : "Pendiente";

  const texto_herramienta = String(fila_actual[16] ?? "5W").trim().toUpperCase();
  const tipo_herramienta =
    texto_herramienta === "RDA" ? "RDA" : texto_herramienta === "PDCA" ? "PDCA" : "5W";

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

  return {
    id: `excel-bd-${indice_fila}`,
    numero_consecutivo: Number(fila_actual[0]) || numero_secuencia,
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
  };
}
