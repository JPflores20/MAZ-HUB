/**
 * Tipos relacionados a la fase Check.
 */
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

export type ConclusionesPiItem = {
  id: string;
  piName: string;
  piDe: string;
  piA: string;
  piVerdeEs: string;
  piMejora: string;
};

export type ResultadosFinalesData = {
  fechaFinalizacion?: string;
  mejoroPI?: string;
  mejoroKPI?: string;
  kpi?: { de: string; a: string; verdeEs: string; mejoraPct: string };
  piRows?: { id: string; pi: string; de: string; a: string; verdeEs: string; mejoraPct: string }[];
};

export type NuevoPerformanceItem = {
  id: string;
  indicador: string;
  antes: string;
  despues: string;
  mejora: string;
};
