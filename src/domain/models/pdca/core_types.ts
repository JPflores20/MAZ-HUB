/**
 * Tipos base y transversales compartidos entre todas las fases del modelo PDCA.
 */

/** Fases oficiales del ciclo de mejora continua PDCA más Resumen y Evaluación. */
export type Phase = "Resumen" | "Plan" | "Do" | "Check" | "Act" | "Evaluacion";

/** Comentario registrado sobre un documento PDCA y opcionalmente asociado a un paso. */
export type PdcaComment = {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  text: string;
  timestamp: string;
  stepTitle?: string | undefined;
  step_title?: string | undefined;
};

/** Evento de auditoría e historial de cambios dentro de un proyecto PDCA. */
export type PdcaHistoryEvent = {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  action: string;
  timestamp: string;
};
