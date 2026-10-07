import type { DefinicionMeta, ParticipantesData } from "./pdca";

export type RdaStatus = 'Abierto' | 'En Progreso' | 'Cerrado';

export interface RdaPortada {
  titulo: string;
  area: string;
  fechaLimite: string;
  autorOriginal: string;
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
  unidades: string;
  perdidas: string;
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
  portada?: RdaPortada;
  context: RdaAnomalyContext;
  problemDescription?: RdaProblemDescription;
  timeline?: RdaTimelineEvent[];
  analysis?: RdaAnalysis;
  evidences?: RdaEvidenceItem[];
  evidence1?: RdaEvidenceItem[]; // Legacy
  evidence2?: RdaEvidenceItem[]; // Legacy

  // Legacy fields (kept for backward compatibility)
  ishikawa?: any[];
  five_whys_tables?: any[];
  validationActions?: RdaValidationAction[];
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
  portada: {
    titulo: 'Nuevo RDA',
    area: '',
    fechaLimite: '',
    autorOriginal: '',
    usuariosAsignados: [],
    descripcionProblema: '',
  },
  context: {
    planta: 'ZACATECAS', fecha: '', turno: '', iniciadoPor: '', responsable: '',
    etapa: '', departamento: '', area: '', disparador: '', equiposAfectados: '',
    folio: '', tiempoParo: '', unidades: '', perdidas: ''
  },
  problemDescription: {
    que: '', como: '', cuando: '', donde: '', quien: '', cual: ''
  },
  timeline: [],
  analysis: { data: '', images: [] },
  evidences: [],
  evidence1: [],
  evidence2: [],
  ishikawa: [],
  five_whys_tables: [],
  validationActions: [],
  preventionActions: [],
  standardization: {
    requiereActualizarMapeo: false, requiereOwd: false, requiereActualizarSop: false,
    requiereCapacitacion: false, requiereMonitoreoIp: false
  },
  closure: {
    eliminoCausaRaiz: false, requiereEscalar: false, necesitaCapex: false, incluyeComoGop: false, fechaFinalizacion: ''
  }
};
