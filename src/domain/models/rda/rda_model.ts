/**
 * Interfaz principal del documento Reporte de Anomalía (RDA) cubriendo sus fases actuales y campos legados.
 */
import type {
  ActionItem,
  ItfR2d2Evaluation,
  ParetoItem,
  TablaEstandarizacionItem,
} from "../pdca";
import type {
  RdaAnalysis,
  RdaAnomalyContext,
  RdaClosure,
  RdaEffectivenessEval,
  RdaEvidenceItem,
  RdaPortada,
  RdaPreventionAction,
  RdaProblemDescription,
  RdaQualityEval,
  RdaStandardization,
  RdaStatus,
  RdaTimelineEvent,
  RdaValidationAction,
} from "./rda_section_types";

/** Modelo completo persistido de un Reporte de Anomalía (RDA) en Firestore. */
export interface Rda {
  id: string;
  title: string;
  status: RdaStatus;
  createdAt: string;
  updatedAt: string;

  completedPhases?: string[];
  completedSteps?: string[];
  naSteps?: string[];
  portada?: RdaPortada;
  context: RdaAnomalyContext;
  problemDescription?: RdaProblemDescription;

  immediateActions?: RdaValidationAction[];
  observacionesAdicionales?: string;
  timeline?: RdaTimelineEvent[];

  analizadoEnOtrosReportes?: string;
  participantesRC?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ishikawa?: any[];
  pareto_data_map?: Record<string, ParetoItem[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correlaciones?: any;
  statistical_analysis_files?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rendimientoActualItems?: any[];
  rendimientoActualImage?: string;

  validationActions?: RdaValidationAction[];
  evidenciasValidacion?: RdaEvidenceItem[];

  tablaEstandarizacion?: TablaEstandarizacionItem[];
  checklistEstandarizacion?: Record<string, boolean>;
  pda?: ActionItem[];
  evidenciasEliminacionCausa?: RdaEvidenceItem[];

  evaluacionCalidad?: ItfR2d2Evaluation;
  evaluacionEfectividad?: ItfR2d2Evaluation;
  calidadRda?: RdaQualityEval;
  efectividadRda?: RdaEffectivenessEval;

  analysis?: RdaAnalysis;
  evidences?: RdaEvidenceItem[];
  evidence1?: RdaEvidenceItem[];
  evidence2?: RdaEvidenceItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  five_whys_tables?: any[];
  preventionActions?: RdaPreventionAction[];
  standardization?: RdaStandardization;
  closure?: RdaClosure;
}
