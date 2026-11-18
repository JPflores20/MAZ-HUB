/**
 * Campos extendidos de análisis estadístico, evidencias, estandarización, conclusiones y evaluación R2D2 del PDCA.
 */
import type {
  ParetoItem,
  FlavorCorrelationChart,
  RendimientoActualPiItem,
  ColeccionDatosItem,
  VozDelConsumidorItem,
  AnalisisRiesgoItem,
  ConclusionCausaRaizItem,
  ItfR2d2Evaluation,
} from "./plan_types";
import type { EvidenciaSolucionItem, PruebaEjecutadaItem } from "./do_types";
import type {
  ConclusionesKpiData,
  ConclusionesPiItem,
  ResultadosFinalesData,
  NuevoPerformanceItem,
} from "./check_types";
import type { TablaEstandarizacionItem, TablaEstandarizacionVpoItem } from "./act_types";

/** Propiedades extendidas de cierre, evidencias, gráficas posteriores e ITF R2D2. */
export type PdcaExtendedFields = {
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
  nuevoParetoImage?: string | undefined;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  nuevoParetoDataMap?: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_drill_downs?: string[] | undefined;
  nuevoParetoDrillDowns?: string[] | undefined;
  nuevo_pareto_unit?: string | undefined;
  nuevoParetoUnit?: string | undefined;
  nuevo_pareto_titles?: Record<string, string> | undefined;
  nuevoParetoTitles?: Record<string, string> | undefined;
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
