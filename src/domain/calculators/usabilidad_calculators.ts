/**
 * Funciones matemáticas y de agregación puras para Matriz de Severidad, Rúbrica 5W y resumen de Deudores.
 */
import type {
  ClasificacionSeveridad,
  CriteriosSeveridad,
  RegistroAnalisis5WRda,
  ResumenDeudorResponsable,
  RubricaCalidad5W,
} from "../models/usabilidad/usabilidad_types";

/**
 * Calcula el puntaje de la Matriz de Severidad conforme a la fórmula oficial de la hoja BD:
 * `100 * (pérdida > 50HL + volumen apartado + impacto planificación) + 50 * (resto)`.
 * @param criterios_evaluados - Banderas booleanas activas de los 7 criterios oficiales.
 * @returns Puntaje total (0-500), indicador booleano de incidente y clasificación resultante.
 */
export function calcular_puntaje_severidad(criterios_evaluados: CriteriosSeveridad): {
  porcentaje_severidad: number;
  es_incidente: boolean;
  clasificacion: ClasificacionSeveridad;
} {
  const porcentaje_severidad =
    (criterios_evaluados.perdida_mayor_50hl ? 100 : 0) +
    (criterios_evaluados.tiempo_inactividad_mayor_3h ? 50 : 0) +
    (criterios_evaluados.volumen_destruir_retrabajo ? 50 : 0) +
    (criterios_evaluados.incidente_recurrente ? 50 : 0) +
    (criterios_evaluados.fallo_tecnico_inusual ? 50 : 0) +
    (criterios_evaluados.volumen_bloqueado_apartado ? 100 : 0) +
    (criterios_evaluados.impacto_planificacion ? 100 : 0);

  const es_incidente = porcentaje_severidad >= 100;
  return {
    porcentaje_severidad,
    es_incidente,
    clasificacion: es_incidente ? "Incidente" : "Precursor",
  };
}

/**
 * Calcula la calificación decimal (0 a 1) de un análisis 5W según los 7 criterios de la rúbrica oficial.
 * @param rubrica_evaluada - Estado booleano de los 7 criterios de calidad 5W.
 * @returns Calificación decimal redondeada a 4 decimales.
 */
export function calcular_puntaje_rubrica_5w(rubrica_evaluada: RubricaCalidad5W): number {
  const lista_verificaciones = [
    rubrica_evaluada.informacion_completa,
    rubrica_evaluada.flujo_cumplido,
    rubrica_evaluada.primera_linea_involucrada,
    rubrica_evaluada.evidencia_por_ques,
    rubrica_evaluada.secuencia_logica,
    rubrica_evaluada.causa_raiz_encontrada,
    rubrica_evaluada.acciones_cierre_ciclo,
  ];
  const cantidad_aprobados = lista_verificaciones.filter(Boolean).length;
  return Number((cantidad_aprobados / 7).toFixed(4));
}

/**
 * Normaliza una calificación de escala decimal (0.8571) o porcentual (85.71) a porcentaje redondeado a 1 decimal.
 * @param valor_calificacion - Calificación numérica cruda o nula.
 * @returns Porcentaje en escala 0-100 o `null` si no existe calificación válida.
 */
export function normalizar_calificacion_porcentaje(
  valor_calificacion: number | null | undefined,
): number | null {
  if (
    valor_calificacion === null ||
    valor_calificacion === undefined ||
    Number.isNaN(Number(valor_calificacion))
  ) {
    return null;
  }
  const numero_limpio = Number(valor_calificacion);
  if (numero_limpio <= 0) return 0;
  if (numero_limpio <= 1.05) return Math.round(numero_limpio * 1000) / 10;
  return Math.min(100, Math.round(numero_limpio * 10) / 10);
}

/**
 * Agrupa los registros de análisis por responsable ordenados por pendientes y volumen total asignado.
 * @param registros_analisis - Colección de registros de usabilidad 5W, RDA y PDCA.
 * @returns Lista ordenada de resumen de seguimiento por responsable.
 */
export function calcular_resumen_deudores(
  registros_analisis: RegistroAnalisis5WRda[],
): ResumenDeudorResponsable[] {
  const mapa_responsables = new Map<
    string,
    {
      nombre_responsable: string;
      area_operativa: string;
      total_asignados: number;
      total_completos: number;
      total_en_proceso: number;
      conteo_5w: number;
      conteo_rda_pdca: number;
      suma_calificaciones: number;
      cantidad_calificaciones: number;
    }
  >();

  registros_analisis.forEach((registro_actual) => {
    const nombre_limpio = registro_actual.nombre_responsable || "SIN ASIGNAR";
    const acumulado_actual = mapa_responsables.get(nombre_limpio) || {
      nombre_responsable: nombre_limpio,
      area_operativa: registro_actual.area_operativa,
      total_asignados: 0,
      total_completos: 0,
      total_en_proceso: 0,
      conteo_5w: 0,
      conteo_rda_pdca: 0,
      suma_calificaciones: 0,
      cantidad_calificaciones: 0,
    };
    acumulado_actual.total_asignados += 1;
    if (registro_actual.estatus_analisis === "Completo") acumulado_actual.total_completos += 1;
    else acumulado_actual.total_en_proceso += 1;

    if (registro_actual.tipo_herramienta === "5W") acumulado_actual.conteo_5w += 1;
    else acumulado_actual.conteo_rda_pdca += 1;

    const porcentaje_calif = normalizar_calificacion_porcentaje(registro_actual.calificacion_ial);
    if (porcentaje_calif !== null && porcentaje_calif > 0) {
      acumulado_actual.suma_calificaciones += porcentaje_calif;
      acumulado_actual.cantidad_calificaciones += 1;
    }
    mapa_responsables.set(nombre_limpio, acumulado_actual);
  });

  return Array.from(mapa_responsables.values())
    .map((resumen_responsable) => ({
      nombre_responsable: resumen_responsable.nombre_responsable,
      area_operativa: resumen_responsable.area_operativa,
      total_asignados: resumen_responsable.total_asignados,
      total_completos: resumen_responsable.total_completos,
      total_en_proceso: resumen_responsable.total_en_proceso,
      conteo_5w: resumen_responsable.conteo_5w,
      conteo_rda_pdca: resumen_responsable.conteo_rda_pdca,
      porcentaje_cierre:
        resumen_responsable.total_asignados > 0
          ? Math.round(
              (resumen_responsable.total_completos / resumen_responsable.total_asignados) * 100,
            )
          : 0,
      promedio_calificacion:
        resumen_responsable.cantidad_calificaciones > 0
          ? Math.round(
              (resumen_responsable.suma_calificaciones /
                resumen_responsable.cantidad_calificaciones) *
                10,
            ) / 10
          : null,
    }))
    .sort(
      (deudor_a, deudor_b) =>
        deudor_b.total_en_proceso - deudor_a.total_en_proceso ||
        deudor_b.total_asignados - deudor_a.total_asignados,
    );
}
