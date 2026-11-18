/**
 * Definición de tipos e interfaces por sección para los Reportes de Anomalía (RDA).
 */
import type {
  DefinicionMeta,
  ParticipantesData,
} from "../pdca";

/** Estados posibles del ciclo de vida de un Reporte de Anomalía (RDA). */
export type RdaStatus = "Abierto" | "Cerrado" | "Evaluado" | "En Progreso";

/** Calificación de criterios metodológicos de calidad del RDA. */
export interface RdaQualityEval {
  definicionProblema: number;
  evidencia: number;
  causaRaiz: number;
  accionesCorrectivas: number;
  validacionEfectividad: number;
  conclusion: string;
}

/** Elemento comparativo antes/después en evaluación de efectividad. */
export interface RdaEffectivenessEvalItem {
  id: string;
  concepto: string;
  antes: string;
  despues: string;
}

/** Evaluación global de efectividad de las acciones implementadas en el RDA. */
export interface RdaEffectivenessEval {
  periodoEvaluado?: string;
  periodoEvaluadoInicio?: string;
  periodoEvaluadoFin?: string;
  indicadorEvaluado: string;
  items: RdaEffectivenessEvalItem[];
  resultado: string;
}

/** Metadatos de portada, responsable, equipo y definición de meta del RDA. */
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

/** Acción de validación inmediata o de comprobación de hipótesis de causa raíz. */
export interface RdaValidationAction {
  id: string;
  categoria: string;
  causaPotencial: string;
  accion: string;
  responsable: string;
  fechaLimite: string;
  estatus: "Pendiente" | "En progreso" | "Completa";
  esCausaRaiz: "SI" | "NO" | "Pendiente";
}

/** Acción preventiva heredada para control de recurrencia. */
export interface RdaPreventionAction {
  id: string;
  fecha: string;
  asunto: string;
  accion: string;
  comentarios: string;
  responsable: string;
  fechaLimite: string;
  estatus: "Pendiente" | "En progreso" | "Completa";
}

/** Banderas de checklist de estandarización VPO para el cierre del RDA. */
export interface RdaStandardization {
  requiereActualizarMapeo: boolean;
  requiereOwd: boolean;
  requiereActualizarSop: boolean;
  requiereCapacitacion: boolean;
  requiereMonitoreoIp: boolean;
}

/** Verificaciones finales y fecha de cierre del reporte RDA. */
export interface RdaClosure {
  eliminoCausaRaiz: boolean;
  requiereEscalar: boolean;
  necesitaCapex: boolean;
  incluyeComoGop: boolean;
  fechaFinalizacion: string;
}

/** Contexto operativo y cuantificación de impacto de la anomalía reportada. */
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

/** Descripción estructurada 5W + 1H del problema detectado. */
export interface RdaProblemDescription {
  que: string;
  como: string;
  cuando: string;
  donde: string;
  quien: string;
  cual: string;
}

/** Evento cronológico y evidencias visuales dentro de la línea de tiempo de la anomalía. */
export interface RdaTimelineEvent {
  id: string;
  time: string;
  description: string;
  images: string[];
}

/** Bloque legado de análisis narrativo e imágenes adjuntas. */
export interface RdaAnalysis {
  data: string;
  images: string[];
}

/** Evidencia documental vinculada a una acción o verificación dentro del RDA. */
export interface RdaEvidenceItem {
  id: string;
  title: string;
  description: string;
  images: string[];
}
