import type { 
  DefinicionMeta, 
  ParticipantesData, 
  ActionItem, 
  ParetoItem, 
  TablaEstandarizacionItem,
  ItfR2d2Evaluation 
} from "./pdca";

export type RdaStatus = 'Abierto' | 'En Progreso' | 'Cerrado';

export interface RdaQualityEval {
  definicionProblema: number;
  evidencia: number;
  causaRaiz: number;
  accionesCorrectivas: number;
  validacionEfectividad: number;
  conclusion: string;
}

export interface RdaEffectivenessEvalItem {
  id: string;
  concepto: string;
  antes: string;
  despues: string;
}

export interface RdaEffectivenessEval {
  periodoEvaluado?: string;
  periodoEvaluadoInicio?: string;
  periodoEvaluadoFin?: string;
  indicadorEvaluado: string;
  items: RdaEffectivenessEvalItem[];
  resultado: string;
}

export interface RdaPortada {
  titulo: string;
  area: string;
  fechaLimite: string;
  autorOriginal: string;
  autorEmail?: string;
  usuariosAsignados: string[];
  descripcionProblema: string;
  definicionMeta?: DefinicionMeta;
  participantes?: ParticipantesData;
}

export interface RdaValidationAction {
  id: string;
  categoria: string;
  causaPotencial: string;
  accion: string;
  responsable: string;
  fechaLimite: string;
  estatus: 'Pendiente' | 'En progreso' | 'Completa';
  esCausaRaiz: 'SI' | 'NO' | 'Pendiente';
}

export interface RdaPreventionAction {
  id: string;
  fecha: string;
  asunto: string;
  accion: string;
  comentarios: string;
  responsable: string;
  fechaLimite: string;
  estatus: 'Pendiente' | 'En progreso' | 'Completa';
}

export interface RdaStandardization {
  requiereActualizarMapeo: boolean;
  requiereOwd: boolean;
  requiereActualizarSop: boolean;
  requiereCapacitacion: boolean;
  requiereMonitoreoIp: boolean;
}

export interface RdaClosure {
  eliminoCausaRaiz: boolean;
  requiereEscalar: boolean;
  necesitaCapex: boolean;
  incluyeComoGop: boolean;
  fechaFinalizacion: string;
}

export interface RdaAnomalyContext {
  planta: string;
  fecha: string;
  turno: string;
  iniciadoPor: string;
  responsable: string;
  etapa: string;
  departamento: string;
  area: string;
  disparador: string;
  equiposAfectados: string;
  folio: string;
  tiempoParo: string;
  unidadesTiempoParo: string;
  perdidas: string;
  unidadesPerdidas: string;
  productosNoConformes: string;
  unidadesNoConformes: string;
}

export interface RdaProblemDescription {
  que: string;
  como: string;
  cuando: string;
  donde: string;
  quien: string;
  cual: string;
}

export interface RdaTimelineEvent {
  id: string;
  time: string;
  description: string;
  images: string[];
}

export interface RdaAnalysis {
  data: string;
  images: string[];
}

export interface RdaEvidenceItem {
  id: string;
  title: string;
  description: string;
  images: string[];
}

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
  
  // Phase 2
  immediateActions?: RdaValidationAction[]; // Reusing validation action shape for simplicity
  observacionesAdicionales?: string;
  timeline?: RdaTimelineEvent[];
  
  // Phase 3
  analizadoEnOtrosReportes?: string;
  participantesRC?: string;
  ishikawa?: any[];
  pareto_data_map?: Record<string, ParetoItem[]>;
  correlaciones?: any[]; // To match PDCA flavorCorrelationData or simple string/images
  statistical_analysis_files?: string[];
  rendimientoActualItems?: any[];
  rendimientoActualImage?: string;
  
  // Phase 4
  validationActions?: RdaValidationAction[];
  evidenciasValidacion?: RdaEvidenceItem[];

  // Phase 5
  tablaEstandarizacion?: TablaEstandarizacionItem[];
  checklistEstandarizacion?: Record<string, boolean>;
  pda?: ActionItem[];
  evidenciasEliminacionCausa?: RdaEvidenceItem[];
  
  // Phase 6 & 7
  evaluacionCalidad?: ItfR2d2Evaluation;
  evaluacionEfectividad?: ItfR2d2Evaluation;
  calidadRda?: RdaQualityEval;
  efectividadRda?: RdaEffectivenessEval;

  // Legacy fields (kept for backward compatibility)
  analysis?: RdaAnalysis;
  evidences?: RdaEvidenceItem[];
  evidence1?: RdaEvidenceItem[];
  evidence2?: RdaEvidenceItem[];
  five_whys_tables?: any[];
  preventionActions?: RdaPreventionAction[];
  standardization?: RdaStandardization;
  closure?: RdaClosure;
}

export const defaultRda: Rda = {
  id: '',
  title: 'Nuevo RDA',
  status: 'Abierto',
  createdAt: '',
  updatedAt: '',
  completedPhases: [],
  completedSteps: [],
  naSteps: [],
  portada: {
    titulo: 'Nuevo RDA',
    area: '',
    fechaLimite: '',
    autorOriginal: '',
    autorEmail: '',
    usuariosAsignados: [],
    descripcionProblema: '',
  },
  context: {
    planta: 'ZACATECAS', fecha: '', turno: '', iniciadoPor: '', responsable: '',
    etapa: '', departamento: '', area: '', disparador: '', equiposAfectados: '',
    folio: '', tiempoParo: '', unidadesTiempoParo: '', perdidas: '', unidadesPerdidas: '',
    productosNoConformes: '', unidadesNoConformes: ''
  },
  problemDescription: {
    que: '', como: '', cuando: '', donde: '', quien: '', cual: ''
  },
  immediateActions: [],
  observacionesAdicionales: '',
  timeline: [],
  analizadoEnOtrosReportes: 'No',
  participantesRC: '',
  ishikawa: [],
  pareto_data_map: {},
  correlaciones: [],
  statistical_analysis_files: [],
  rendimientoActualItems: [],
  rendimientoActualImage: '',
  validationActions: [],
  evidenciasValidacion: [],
  tablaEstandarizacion: [],
  pda: [],
  evidenciasEliminacionCausa: [],

  // Legacy initialization
  analysis: { data: '', images: [] },
  evidences: [],
  evidence1: [],
  evidence2: [],
  five_whys_tables: [],
  preventionActions: [],
  standardization: {
    requiereActualizarMapeo: false, requiereOwd: false, requiereActualizarSop: false,
    requiereCapacitacion: false, requiereMonitoreoIp: false
  },
  closure: {
    eliminoCausaRaiz: false, requiereEscalar: false, necesitaCapex: false, incluyeComoGop: false, fechaFinalizacion: ''
  }
};
