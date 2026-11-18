/**
 * Definición de tipos e interfaces de datos pertenecientes a la fase Plan y evaluación R2D2 de un PDCA.
 */

/** Registro de seguimiento de temas GOP / foco mensual. */
export type GopThemeItem = {
  id: number;
  tema: string;
  meses: boolean[];
  focus_items?: string;
  focusItems?: string;
  focusType?: string;
  status: "Not Started" | "In Progress" | "Complete" | "";
};

/** Fila de matriz de impacto y priorización de acciones. */
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

/** Estructura de un diagrama causa-efecto (Ishikawa) y su priorización interna. */
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

/** Tabla independiente de análisis de 5 Por Qués. */
export type FiveWhysTableData = {
  id: string;
  title: string;
  rows: unknown[];
};

/** Información de participantes locales, externos y agenda de reuniones del PDCA. */
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

/** Metadatos de definición formal de meta e indicadores KPI/PI. */
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

/** Punto de verificación del checklist SDCA / VPO. */
export type VpoCheckpointItem = {
  id: string;
  pilar: string;
  checkpoint: string;
  evidencia: string;
  status: "YES" | "NO" | "N/A" | "";
};

/** Elemento individual en una estratificación Pareto. */
export type ParetoItem = { id: number; area: string; gap: number };

/** Par ordenado (x, y) para gráficas de correlación lineal. */
export type FlavorCorrelationPoint = { id: number; x: number; y: number };

/** Configuración y puntos de un gráfico de correlación de variables. */
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

/** Elemento de seguimiento de rendimiento actual de PIs por estación. */
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

/** Registro del plan de recopilación de datos (Paso 9). */
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

/** Requisito de la Voz del Consumidor / Cliente. */
export type VozDelConsumidorItem = {
  id: string;
  necesidad: string;
  importancia: string;
  metrica: string;
  comentario: string;
};

/** Registro de análisis de riesgos del proyecto o estandarización. */
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

/** Conclusión estadística asociada a la validación de una causa raíz. */
export type ConclusionCausaRaizItem = {
  id: string;
  problema: string;
  causaRaiz: string;
  validacion: string;
  valorP: string;
  conclusion: string;
};

/** Evaluación metodológica ITF / R2D2 firmada por evaluadores. */
export type ItfR2d2Evaluation = {
  rightPeople: { check: boolean; score: number; comment: string };
  rightProblem: { check: boolean; score: number; comment: string };
  dataWillSetYouFree: { check: boolean; score: number; comment: string };
  dontReinventTheWheel: { check: boolean; score: number; comment: string };
  noHippos: { check: boolean; score: number; comment: string };
  evaluators?: { name: string; timestamp: string }[];
};
