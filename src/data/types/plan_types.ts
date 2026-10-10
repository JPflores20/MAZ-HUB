/**
 * Tipos relacionados a la fase Plan.
 */
export type GopThemeItem = {
  id: number;
  tema: string;
  meses: boolean[];
  focus_items?: string;
  focusItems?: string;
  focusType?: string;
  status: "Not Started" | "In Progress" | "Complete" | "";
};

export type ImpactMatrixRow = {
  id: string;
  issue?: string;
  root_cause?: string;
  rootCause?: string;
  accion: string;
  seguridad: number | "";
  calidad_higiene?: number | "";
  calidadHigiene?: number | "";
  costo: number | "";
  medio_ambiente?: number | "";
  medioAmbiente?: number | "";
  servicio: number | "";
  priorizar: "SI" | "NO" | "";
};

export type IshikawaItem = {
  id: string;
  title?: string;
  effect: string;
  causes: Record<string, string[]>;
  prioritization: unknown[];
  prioritization_custom_criterion?: string;
  prioritizationCustomCriterion?: string;
  custom_labels?: Record<string, string>;
  customLabels?: Record<string, string>;
  images?: string[];
};

export type FiveWhysTableData = {
  id: string;
  title: string;
  rows: unknown[];
};

export type ParticipantesData = {
  locales_nombres?: string;
  localesNombres?: string;
  locales_roles?: string;
  localesRoles?: string;
  externos_nombres?: string;
  externosNombres?: string;
  externos_roles?: string;
  externosRoles?: string;
  fecha_reunion_inicial?: string;
  fechaReunionInicial?: string;
  fecha_reunion_final?: string;
  fechaReunionFinal?: string;
  reunion_rutina?: string;
  reunionRutina?: string;
};

export type DefinicionMeta = {
  kpi: string;
  pis: string;
  metodo_calculo?: string;
  metodoCalculo?: string;
  desde_valor?: string;
  desdeValor?: string;
  a_valor?: string;
  aValor?: string;
  hasta_fecha?: string;
  hastaFecha?: string;
  unidad_medida?: string;
  unidadMedida?: string;
  benchmark: string;
  mejora: "lower" | "higher" | "menor" | "mayor" | string;
  responsable: string;
  facilitador_lider?: string;
  facilitadorLider?: string;
};

export type VpoCheckpointItem = {
  id: string;
  pilar: string;
  checkpoint: string;
  evidencia: string;
  status: "YES" | "NO" | "N/A" | "";
};

export type ParetoItem = { id: number; area: string; gap: number };

export type FlavorCorrelationPoint = { id: number; x: number; y: number };

export type FlavorCorrelationChart = {
  id: string;
  title: string;
  series_name?: string;
  seriesName?: string;
  pearson: string;
  points: FlavorCorrelationPoint[];
  y_min?: number;
  yMin?: number;
  y_max?: number | "";
  yMax?: number | "";
};

export type RendimientoActualPiItem = {
  id: string;
  estacionTrabajo: string;
  nombreIndicador: string;
  estadoActual: string;
  puestoResponsable: string;
  herramienta: string;
  ubicacion: string;
  evidencia?: string;
};

export type ColeccionDatosItem = {
  id: string;
  xs_ys: string;
  variable: string;
  tipo_dato: string;
  definicion_operacional: string;
  metodo_medicion: string;
  estratificacion: string;
  metodo_recoleccion: string;
  quien: string;
  tipo_muestreo: string;
  cuantos: string;
  cada_cuando: string;
};

export type VozDelConsumidorItem = {
  id: string;
  necesidad: string;
  importancia: string;
  metrica: string;
  comentario: string;
};

export type AnalisisRiesgoItem = {
  id: string;
  riesgo: string;
  tipo_impacto?: string;
  probabilidad: string;
  impacto: string;
  prioridad?: string;
  mitigacion: string;
  responsable: string;
  fecha_limite?: string;
};

export type ConclusionCausaRaizItem = {
  id: string;
  problema: string;
  causaRaiz: string;
  validacion: string;
  valorP: string;
  conclusion: string;
};

export type ItfR2d2Evaluation = {
  rightPeople: { check: boolean; score: number; comment: string };
  rightProblem: { check: boolean; score: number; comment: string };
  dataWillSetYouFree: { check: boolean; score: number; comment: string };
  dontReinventTheWheel: { check: boolean; score: number; comment: string };
  noHippos: { check: boolean; score: number; comment: string };
  evaluators?: { name: string; timestamp: string }[];
};
