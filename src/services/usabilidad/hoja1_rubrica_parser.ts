/**
 * hoja1_rubrica_parser.ts
 * Parser especializado para la hoja "Hoja1" (exportación de Interaction Log / 5W)
 * que extrae las rúbricas detalladas de 7 criterios de calidad.
 */
import * as XLSX from "xlsx";
import {
  calcular_puntaje_rubrica_5w,
  calcular_puntaje_severidad,
} from "@/data/usabilidad/usabilidad_calculators";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
  RubricaCalidad5W,
} from "@/data/usabilidad/usabilidad_types";
import {
  convertir_fecha_excel_a_iso,
  normalizar_calificacion_decimal,
} from "./excel_date_utils";

export interface RubricaPorTitulo {
  id_ial: string;
  puntaje_calificacion: number | null;
  rubrica_5w?: RubricaCalidad5W | undefined;
}

/**
 * Extrae mapas de búsqueda de rúbricas 5W por ID IAL y por título desde "Hoja1".
 */
export function extraer_rubricas_de_hoja1(hoja_trabajo: XLSX.WorkSheet | undefined): {
  mapa_rubrica_por_ial: Map<string, RubricaCalidad5W>;
  mapa_rubrica_por_titulo: Map<string, RubricaPorTitulo>;
} {
  const mapa_rubrica_por_ial = new Map<string, RubricaCalidad5W>();
  const mapa_rubrica_por_titulo = new Map<string, RubricaPorTitulo>();

  if (!hoja_trabajo) {
    return { mapa_rubrica_por_ial, mapa_rubrica_por_titulo };
  }

  const filas_hoja1 = XLSX.utils.sheet_to_json<unknown[]>(hoja_trabajo, {
    header: 1,
    defval: "",
  });

  for (let indice_fila = 1; indice_fila < filas_hoja1.length; indice_fila++) {
    const fila_actual = filas_hoja1[indice_fila];
    if (!fila_actual) continue;

    const referencia_ial = String(fila_actual[11] ?? "").trim();
    const titulo_limpio = String(fila_actual[12] ?? "")
      .replace(/^'+|'+$/g, "")
      .trim();
    if (!referencia_ial && !titulo_limpio) continue;

    const tiene_columnas_rubrica =
      String(fila_actual[25] ?? "").trim() !== "" ||
      String(fila_actual[26] ?? "").trim() !== "";

    let rubrica_5w: RubricaCalidad5W | undefined;

    if (tiene_columnas_rubrica) {
      rubrica_5w = {
        informacion_completa: String(fila_actual[25] ?? "").trim().toUpperCase() === "OK",
        flujo_cumplido: String(fila_actual[26] ?? "").trim().toUpperCase() === "OK",
        primera_linea_involucrada: String(fila_actual[27] ?? "").trim().toUpperCase() === "OK",
        evidencia_por_ques: String(fila_actual[28] ?? "").trim().toUpperCase() === "OK",
        secuencia_logica: String(fila_actual[29] ?? "").trim().toUpperCase() === "OK",
        causa_raiz_encontrada: String(fila_actual[30] ?? "").trim().toUpperCase() === "OK",
        acciones_cierre_ciclo: String(fila_actual[31] ?? "").trim().toUpperCase() === "OK",
        comentarios_mejora: String(fila_actual[32] ?? "").trim() || undefined,
        evaluado_por: String(fila_actual[24] ?? "").trim() || undefined,
      };
    }

    const puntaje_calificacion = normalizar_calificacion_decimal(fila_actual[33]);
    if (referencia_ial && rubrica_5w) {
      mapa_rubrica_por_ial.set(referencia_ial, rubrica_5w);
    }
    if (titulo_limpio) {
      mapa_rubrica_por_titulo.set(titulo_limpio.toLowerCase(), {
        id_ial: referencia_ial,
        puntaje_calificacion,
        rubrica_5w,
      });
    }
  }

  return { mapa_rubrica_por_ial, mapa_rubrica_por_titulo };
}

/**
 * Parsea registros completos cuando un archivo importado solo contiene la pestaña "Hoja1".
 */
export function parsear_registros_solo_hoja1(
  hoja_trabajo: XLSX.WorkSheet,
): RegistroAnalisis5WRda[] {
  const lista_registros: RegistroAnalisis5WRda[] = [];
  const filas_hoja1 = XLSX.utils.sheet_to_json<unknown[]>(hoja_trabajo, {
    header: 1,
    defval: "",
  });

  for (let indice_fila = 1; indice_fila < filas_hoja1.length; indice_fila++) {
    const fila_actual = filas_hoja1[indice_fila];
    if (!fila_actual) continue;

    const referencia_ial = String(fila_actual[11] ?? "").trim();
    const titulo_limpio = String(fila_actual[12] ?? "")
      .replace(/^'+|'+$/g, "")
      .trim();
    if (!referencia_ial && !titulo_limpio) continue;

    const datos_fecha = convertir_fecha_excel_a_iso(fila_actual[7]);
    const texto_estatus = String(fila_actual[15] ?? "").trim().toLowerCase();
    const estatus_analisis = texto_estatus.includes("complet") ? "Completo" : "En Proceso";

    const responsable_limpio = String(fila_actual[34] || fila_actual[16] || "")
      .replace(/^\d+\s*-\s*/, "")
      .replace(/^'+|'+$/g, "")
      .trim();

    const rubrica_5w: RubricaCalidad5W = {
      informacion_completa: String(fila_actual[25] ?? "").trim().toUpperCase() === "OK",
      flujo_cumplido: String(fila_actual[26] ?? "").trim().toUpperCase() === "OK",
      primera_linea_involucrada: String(fila_actual[27] ?? "").trim().toUpperCase() === "OK",
      evidencia_por_ques: String(fila_actual[28] ?? "").trim().toUpperCase() === "OK",
      secuencia_logica: String(fila_actual[29] ?? "").trim().toUpperCase() === "OK",
      causa_raiz_encontrada: String(fila_actual[30] ?? "").trim().toUpperCase() === "OK",
      acciones_cierre_ciclo: String(fila_actual[31] ?? "").trim().toUpperCase() === "OK",
      comentarios_mejora: String(fila_actual[32] ?? "").trim() || undefined,
      evaluado_por: String(fila_actual[24] ?? "").trim() || undefined,
    };

    const calificacion_ial =
      normalizar_calificacion_decimal(fila_actual[33]) ??
      calcular_puntaje_rubrica_5w(rubrica_5w);

    const texto_sdca = String(fila_actual[19] ?? "").toUpperCase();
    const pilares_sdca: MapaPilaresSdca = {
      skap: texto_sdca.includes("ENTRENAMIENTO") || texto_sdca.includes("SKAP"),
      sop_opl: texto_sdca.includes("SOP") || texto_sdca.includes("OPL"),
      mapeo_proceso: texto_sdca.includes("MAPEO"),
      cinco_s: texto_sdca.includes("5S"),
      sic: texto_sdca.includes("SIC"),
      material_defectuoso: texto_sdca.includes("MATERIAL DEFECTUOSO"),
    };

    const texto_repetido = String(fila_actual[13] ?? "").trim().toUpperCase();
    const criterios_severidad: CriteriosSeveridad = {
      perdida_mayor_50hl: false,
      tiempo_inactividad_mayor_3h: false,
      volumen_destruir_retrabajo: false,
      incidente_recurrente: texto_repetido === "SÍ" || texto_repetido === "SI",
      fallo_tecnico_inusual: false,
      volumen_bloqueado_apartado: false,
      impacto_planificacion: false,
    };
    const resultado_severidad = calcular_puntaje_severidad(criterios_severidad);

    lista_registros.push({
      id: `ial-import-${referencia_ial || indice_fila}`,
      numero_consecutivo: indice_fila,
      semana_evento: datos_fecha.semana,
      mes_evento: datos_fecha.mes,
      anio_evento: datos_fecha.anio,
      fecha_evento: datos_fecha.fecha_iso,
      id_ial: referencia_ial,
      descripcion_falla: titulo_limpio,
      nombre_responsable: responsable_limpio ? responsable_limpio.toUpperCase() : "SIN ASIGNAR",
      calificacion_ial,
      kpi_afectado: String(fila_actual[9] ?? "BHT").toUpperCase(),
      estatus_analisis,
      area_operativa: String(fila_actual[4] ?? "COCIMIENTOS").toUpperCase(),
      proceso_cervecero: String(fila_actual[5] ?? "General").replace(/^'+|'+$/g, ""),
      equipo_afectado: String(fila_actual[6] ?? "GENERAL")
        .replace(/^'+|'+$/g, "")
        .toUpperCase(),
      marca_cerveza: "NA",
      variable_afectada: String(fila_actual[10] ?? "NA"),
      tipo_herramienta: "5W",
      pilares_sdca,
      criterios_severidad,
      porcentaje_severidad: resultado_severidad.porcentaje_severidad,
      clasificacion_incidente: resultado_severidad.clasificacion,
      estatus_reporte_incidente:
        resultado_severidad.clasificacion === "Incidente" ? "PENDIENTE" : "NA",
      rubrica_5w,
      origen_registro: "importado",
    });
  }

  return lista_registros;
}
