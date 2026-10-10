import type { Phase, PdcaComment, PdcaHistoryEvent } from "./core_types";
import type {
  DefinicionMeta,
  ParticipantesData,
  IshikawaItem,
  FiveWhysTableData,
  GopThemeItem,
  ImpactMatrixRow,
  VpoCheckpointItem,
  ParetoItem,
  FlavorCorrelationChart,
  RendimientoActualPiItem,
  ColeccionDatosItem,
  VozDelConsumidorItem,
  AnalisisRiesgoItem,
  ConclusionCausaRaizItem,
  ItfR2d2Evaluation,
} from "./plan_types";
import type { ActionItem, EvidenciaSolucionItem, PruebaEjecutadaItem } from "./do_types";
import type {
  ConclusionesKpiData,
  ConclusionesPiItem,
  ResultadosFinalesData,
  NuevoPerformanceItem,
} from "./check_types";
import type { TablaEstandarizacionItem, TablaEstandarizacionVpoItem } from "./act_types";

/**
 * Representa el modelo principal del PDCA.
 */
export type Pdca = {
  id: string;
  titulo: string;
  area: string;
  fase: Phase;
  actualizado: string;
  progreso: number;
  problema: string;
  causa_raiz?: string;
  causaRaiz?: string;
  acciones: ActionItem[];
  verificacion: string;
  evidencias: string[];
  estandarizacion: string;
  indicador: { etiqueta: string; antes: number; despues: number; unidad: string };
  serie: { mes: string; valor: number }[];
  fecha_finalizacion?: string;
  fechaFinalizacion?: string;
  kpi_nodes?: unknown[];
  kpiNodes?: unknown[];
  kpi_edges?: unknown[];
  kpiEdges?: unknown[];
  kpi_tree_image?: string;
  kpiTreeImage?: string;
  completed_phases?: string[];
  completedPhases?: string[];
  completed_steps?: string[];
  completedSteps?: string[];
  na_steps?: string[];
  naSteps?: string[];
  ishikawa_causes?: Record<string, string[]>;
  ishikawaCauses?: Record<string, string[]>;
  ishikawa_effect?: string;
  ishikawaEffect?: string;
  ishikawas?: IshikawaItem[];
  prioritization_causes?: unknown[];
  prioritizationCauses?: unknown[];
  five_whys?: unknown[];
  fiveWhys?: unknown[];
  five_whys_tables?: FiveWhysTableData[];
  fiveWhysTables?: FiveWhysTableData[];
  target_vs_actual?: { mes: string; target: number; actual: number | null }[];
  targetVsActual?: { mes: string; target: number; actual: number | null }[];
  target_vs_actual_unit?: string;
  targetVsActualUnit?: string;
  target_vs_actual_title?: string;
  targetVsActualTitle?: string;
  target_vs_actual_ymin?: number;
  targetVsActualYmin?: number;
  target_vs_actual_ymax?: string;
  targetVsActualYmax?: string;
  pareto_data_map?: Record<string, ParetoItem[]>;
  paretoDataMap?: Record<string, ParetoItem[]>;
  pareto_drill_downs?: string[];
  paretoDrillDowns?: string[];
  pareto_unit?: string;
  paretoUnit?: string;
  pareto_titles?: Record<string, string>;
  paretoTitles?: Record<string, string>;
  autor?: string;
  autor_email?: string;
  autorEmail?: string;
  asignados?: { name: string; email: string }[];
  vpo_checkpoints?: VpoCheckpointItem[];
  vpoCheckpoints?: VpoCheckpointItem[];
  definicion_meta?: DefinicionMeta;
  definicionMeta?: DefinicionMeta;
  participantes?: ParticipantesData;
  equipo?: string[];
  impact_matrix?: ImpactMatrixRow[];
  impactMatrix?: ImpactMatrixRow[];
  has_flavor_correlation?: boolean;
  hasFlavorCorrelation?: boolean;
  flavor_correlation_data?: FlavorCorrelationChart[];
  flavorCorrelationData?: FlavorCorrelationChart[];
  gop_themes_columns?: boolean[];
  gopThemesColumns?: boolean[];
  has_gop_themes?: boolean;
  hasGopThemes?: boolean;
  gop_themes_data?: GopThemeItem[];
  gopThemesData?: GopThemeItem[];
  process_mapping_image?: string | null;
  processMappingImage?: string | null;
  process_mapping_files?: string[];
  processMappingFiles?: string[];
  problem_timeline_option?: "A" | "B";
  problemTimelineOption?: "A" | "B";
  problem_timeline_filter?: "day" | "week" | "month" | "3months";
  problemTimelineFilter?: "day" | "week" | "month" | "3months";
  problem_timeline_events?: { id: string; time: string; description: string }[];
  problemTimelineEvents?: { id: string; time: string; description: string }[];
  kpi_final_result_data?: { mes: string; target: number; actual: number | null }[];
  kpiFinalResultData?: { mes: string; target: number; actual: number | null }[];
  kpi_final_result_unit?: string;
  kpiFinalResultUnit?: string;
  gemba_final_image?: string | null;
  gembaFinalImage?: string | null;
  gemba_final_images?: string[];
  gembaFinalImages?: string[];
  kpi_documents?: string[];
  kpiDocuments?: string[];
  comentarios?: PdcaComment[];
  historial?: PdcaHistoryEvent[];
  statisticalAnalysisFiles?: string[];
  statistical_analysis_files?: string[];
  itf_r2d2_evaluation?: ItfR2d2Evaluation;
  itfR2d2Evaluation?: ItfR2d2Evaluation;
  baselineImage?: string | undefined;
  baseline_image?: string | undefined;
  tablaEstandarizacion?: TablaEstandarizacionItem[];
  tabla_estandarizacion?: TablaEstandarizacionItem[];
  tablaEstandarizacionVpo?: TablaEstandarizacionVpoItem[];
  tabla_estandarizacion_vpo?: TablaEstandarizacionVpoItem[];
  resultadosFinales?: ResultadosFinalesData;
  resultados_finales?: ResultadosFinalesData;
  kpiTreeFocoImage?: string | undefined;
  kpi_tree_foco_image?: string | undefined;
  evidenciasSolucion?: EvidenciaSolucionItem[];
  evidencias_solucion?: EvidenciaSolucionItem[];
  hasMapeoProceso?: boolean;
  has_mapeo_proceso?: boolean;
  mapeoProcesoImage?: string | undefined;
  mapeo_proceso_image?: string | undefined;
  mapeoProcesoDesc?: string | undefined;
  mapeo_proceso_desc?: string | undefined;
  sipocMapFiles?: string[];
  sipoc_map_files?: string[];
  coleccionDatos?: ColeccionDatosItem[];
  coleccion_datos?: ColeccionDatosItem[];
  especificacionProcesosText?: string | undefined;
  especificacion_procesos_text?: string | undefined;
  especificacionProcesosImage?: string | undefined;
  especificacion_procesos_image?: string | undefined;
  finalTimeSeriesTitle?: string | undefined;
  final_time_series_title?: string | undefined;
  finalTimeSeriesData?: { mes: string; target: number; actual: number | null }[] | undefined;
  final_time_series_data?: { mes: string; target: number; actual: number | null }[] | undefined;
  finalTimeSeriesUnit?: string | undefined;
  final_time_series_unit?: string | undefined;
  finalTimeSeriesYmin?: number | undefined;
  final_time_series_ymin?: number | undefined;
  finalTimeSeriesYmax?: string | undefined;
  final_time_series_ymax?: string | undefined;
  currentTimesTitle?: string | undefined;
  current_times_title?: string | undefined;
  ishikawaConceptos?: Record<string, string> | undefined;
  ishikawa_conceptos?: Record<string, string> | undefined;
  informacionAdicionalFiles?: string[] | undefined;
  informacion_adicional_files?: string[] | undefined;
  vozConsumidor?: VozDelConsumidorItem[] | undefined;
  voz_consumidor?: VozDelConsumidorItem[] | undefined;
  analisisRiesgosProyecto?: AnalisisRiesgoItem[] | undefined;
  analisis_riesgos_proyecto?: AnalisisRiesgoItem[] | undefined;
  conclusionesCausaRaiz?: ConclusionCausaRaizItem[] | undefined;
  conclusiones_causa_raiz?: ConclusionCausaRaizItem[] | undefined;
  pruebasEjecutadas?: PruebaEjecutadaItem[] | undefined;
  pruebas_ejecutadas?: PruebaEjecutadaItem[] | undefined;
  nuevoPerformance?: NuevoPerformanceItem[] | undefined;
  nuevo_performance?: NuevoPerformanceItem[] | undefined;
  nuevo_performance_image?: string | undefined;
  nuevo_pareto_image?: string | undefined;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_drill_downs?: string[] | undefined;
  nuevo_pareto_unit?: string | undefined;
  nuevo_pareto_titles?: Record<string, string> | undefined;
  nueva_correlacion_image?: string | undefined;
  has_nueva_correlacion?: boolean | undefined;
  nueva_correlacion_data?: FlavorCorrelationChart[] | undefined;
  analisisRiesgosEstandarizacion?: AnalisisRiesgoItem[] | undefined;
  analisis_riesgos_estandarizacion?: AnalisisRiesgoItem[] | undefined;
  conclusionesFinales?: string | undefined;
  conclusionesStoryboardImage?: string | undefined;
  conclusionesKpiData?: ConclusionesKpiData | undefined;
  conclusionesPiItems?: ConclusionesPiItem[] | undefined;
  conclusiones_finales?: string | undefined;
  conclusiones_storyboard_image?: string | undefined;
  conclusiones_kpi_data?: ConclusionesKpiData | undefined;
  conclusiones_pi_items?: ConclusionesPiItem[] | undefined;
  sops_documentos_image?: string | undefined;
  plan_entrenamiento_image?: string | undefined;
  plan_control_image?: string | undefined;
  lecciones_aprendidas?: string | undefined;
  benchmarkImage?: string | undefined;
  benchmark_image?: string | undefined;
  rendimientoActualPis?: RendimientoActualPiItem[] | undefined;
  rendimiento_actual_pis?: RendimientoActualPiItem[] | undefined;
  rendimientoActualImage?: string | undefined;
  rendimiento_actual_image?: string | undefined;
};
