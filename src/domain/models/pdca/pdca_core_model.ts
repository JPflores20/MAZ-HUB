/**
 * Campos estructurales base, metadatos de asignación, fase Plan inicial y bitácoras del modelo PDCA.
 * Los campos conservan compatibilidad dual snake_case/camelCase para documentos históricos en Firestore.
 */
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
} from "./plan_types";
import type { ActionItem } from "./do_types";

/** Propiedades centrales del documento PDCA (identidad, fase Plan base, participantes y bitácora). */
export type PdcaCoreFields = {
  id: string;
  titulo: string;
  planta?: string;
  departamento?: string;
  area: string;
  etapa?: string;
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
  ownerUid?: string | undefined;
  asignados?: { name: string; email: string }[];
  assignedEmails?: string[] | undefined;
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
};
