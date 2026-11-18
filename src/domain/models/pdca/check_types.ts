/**
 * Definición de tipos para la fase Check (Resultados finales, comparativo KPI/PI y Nuevo Performance).
 */

/** Resumen comparativo final del indicador clave KPI al cierre del PDCA. */
export type ConclusionesKpiData = {
  fechaFinalizacion: string;
  mejoroPi: string;
  mejoroKpi: string;
  kpiName: string;
  kpiDe: string;
  kpiA: string;
  kpiVerdeEs: string;
  kpiMejora: string;
};

/** Fila de comparación antes/después de un Indicador de Proceso (PI). */
export type ConclusionesPiItem = {
  id: string;
  piName: string;
  piDe: string;
  piA: string;
  piVerdeEs: string;
  piMejora: string;
};

/** Estructura de resultados finales y filas de PIs en la vista de cierre. */
export type ResultadosFinalesData = {
  fechaFinalizacion?: string;
  mejoroPI?: string;
  mejoroKPI?: string;
  kpi?: { de: string; a: string; verdeEs: string; mejoraPct: string };
  piRows?: { id: string; pi: string; de: string; a: string; verdeEs: string; mejoraPct: string }[];
};

/** Indicador estadístico del nuevo nivel de desempeño tras implementar mejoras. */
export type NuevoPerformanceItem = {
  id: string;
  indicador: string;
  antes: string;
  despues: string;
  mejora: string;
};
