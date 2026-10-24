/**
 * usabilidad_calculators.ts
 * Funciones matemáticas y de agregación puras para el cálculo de la Matriz de Severidad,
 * la Calificación de Calidad de Análisis 5W (Rúbrica de 7 criterios) y el resumen de Deudores.
 */
import type {
  ClasificacionSeveridad,
  CriteriosSeveridad,
  RegistroAnalisis5WRda,
  ResumenDeudorResponsable,
  RubricaCalidad5W,
} from "./usabilidad_types";

/**
 * Calcula el puntaje de la Matriz de Severidad conforme a la fórmula oficial de la hoja BD:
 * Puntaje = 100*(AD + AI + AJ) + 50*(AE + AF + AG + AH)
 */
export function calcular_puntaje_severidad(criterios: CriteriosSeveridad): {
  porcentaje_severidad: number;
  es_incidente: boolean;
  clasificacion: ClasificacionSeveridad;
} {
  const porcentaje_severidad =
    (criterios.perdida_mayor_50hl ? 100 : 0) +
    (criterios.tiempo_inactividad_mayor_3h ? 50 : 0) +
    (criterios.volumen_destruir_retrabajo ? 50 : 0) +
    (criterios.incidente_recurrente ? 50 : 0) +
    (criterios.fallo_tecnico_inusual ? 50 : 0) +
    (criterios.volumen_bloqueado_apartado ? 100 : 0) +
    (criterios.impacto_planificacion ? 100 : 0);

  const es_incidente = porcentaje_severidad >= 100;
  return {
    porcentaje_severidad,
    es_incidente,
    clasificacion: es_incidente ? "Incidente" : "Precursor",
  };
}

/**
 * Calcula la calificación decimal (0 a 1) de un análisis 5W según los 7 criterios de Hoja1.
 */
export function calcular_puntaje_rubrica_5w(rubrica: RubricaCalidad5W): number {
  const lista_verificaciones = [
    rubrica.informacion_completa,
    rubrica.flujo_cumplido,
    rubrica.primera_linea_involucrada,
    rubrica.evidencia_por_ques,
    rubrica.secuencia_logica,
    rubrica.causa_raiz_encontrada,
    rubrica.acciones_cierre_ciclo,
  ];
  const cantidad_aprobados = lista_verificaciones.filter(Boolean).length;
  return Number((cantidad_aprobados / 7).toFixed(4));
}

/**
 * Normaliza una calificación que en el Excel puede venir en escala decimal (0.8571)
 * o porcentual (85.71) y devuelve siempre el porcentaje redondeado a 1 decimal (0 a 100).
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
 * Agrupa los registros por responsable para construir la tabla de seguimiento ("Deudores").
 */
export function calcular_resumen_deudores(
  registros: RegistroAnalisis5WRda[],
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

  registros.forEach((registro) => {
    const nombre_limpio = registro.nombre_responsable || "SIN ASIGNAR";
    const acumulado = mapa_responsables.get(nombre_limpio) || {
      nombre_responsable: nombre_limpio,
      area_operativa: registro.area_operativa,
      total_asignados: 0,
      total_completos: 0,
      total_en_proceso: 0,
      conteo_5w: 0,
      conteo_rda_pdca: 0,
      suma_calificaciones: 0,
      cantidad_calificaciones: 0,
    };
    acumulado.total_asignados += 1;
    if (registro.estatus_analisis === "Completo") acumulado.total_completos += 1;
    else acumulado.total_en_proceso += 1;

    if (registro.tipo_herramienta === "5W") acumulado.conteo_5w += 1;
    else acumulado.conteo_rda_pdca += 1;

    const porcentaje_calif = normalizar_calificacion_porcentaje(registro.calificacion_ial);
    if (porcentaje_calif !== null && porcentaje_calif > 0) {
      acumulado.suma_calificaciones += porcentaje_calif;
      acumulado.cantidad_calificaciones += 1;
    }
    mapa_responsables.set(nombre_limpio, acumulado);
  });

  return Array.from(mapa_responsables.values())
    .map((item) => ({
      nombre_responsable: item.nombre_responsable,
      area_operativa: item.area_operativa,
      total_asignados: item.total_asignados,
      total_completos: item.total_completos,
      total_en_proceso: item.total_en_proceso,
      conteo_5w: item.conteo_5w,
      conteo_rda_pdca: item.conteo_rda_pdca,
      porcentaje_cierre:
        item.total_asignados > 0
          ? Math.round((item.total_completos / item.total_asignados) * 100)
          : 0,
      promedio_calificacion:
        item.cantidad_calificaciones > 0
          ? Math.round((item.suma_calificaciones / item.cantidad_calificaciones) * 10) / 10
          : null,
    }))
    .sort((a, b) => b.total_en_proceso - a.total_en_proceso || b.total_asignados - a.total_asignados);
}
