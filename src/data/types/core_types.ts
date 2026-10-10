/**
 * Tipos base y comunes para PDCA.
 */
export type Phase = "Resumen" | "Plan" | "Do" | "Check" | "Act" | "Evaluacion";

/**
 * Representa un comentario en el PDCA.
 */
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

/**
 * Representa un evento en el historial del PDCA.
 */
export type PdcaHistoryEvent = {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  action: string;
  timestamp: string;
};
