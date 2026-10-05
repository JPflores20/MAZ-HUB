export type RdaStatus = 'Abierto' | 'En Progreso' | 'Cerrado';

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

export interface Rda {
  id: string;
  title: string;
  status: RdaStatus;
  createdAt: string;
  updatedAt: string;
  
  context: RdaAnomalyContext;
  ishikawa: any[];
  five_whys_tables?: any[];
  validationActions: RdaValidationAction[];
  preventionActions: RdaPreventionAction[];
  standardization: RdaStandardization;
  closure: RdaClosure;
}

export const defaultRda: Rda = {
  id: '',
  title: 'Nuevo RDA',
  status: 'Abierto',
  createdAt: '',
  updatedAt: '',
  context: {
    planta: 'ZACATECAS', fecha: '', turno: '', iniciadoPor: '', responsable: '',
    etapa: '', departamento: '', area: '', disparador: '', equiposAfectados: '',
    folio: '', tiempoParo: '', unidades: '', perdidas: ''
  },
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
