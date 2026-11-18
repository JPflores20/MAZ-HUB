/**
 * Definición de tipos para la fase Act (Estandarización y gestión VPO).
 */

/** Registro de actividad estandarizada tras el cierre exitoso de la causa raíz. */
export type TablaEstandarizacionItem = {
  id: string;
  actividad?: string;
  responsable?: string;
  frecuencia?: string;
  estandar?: string;
  accionesMitigar?: string;
  herramientaVpo?: string;
  dueno?: string;
  equipoComunicara?: string;
  datosEntrenamiento?: string;
  gopPresentacion?: string;
  fechaFinalizacion?: string;
};

/** Elemento de estandarización vinculado explícitamente a una herramienta VPO y GOP. */
export type TablaEstandarizacionVpoItem = {
  id: string;
  nombreEstandar: string;
  herramientaVpo: string;
  dueno: string;
  equipoComunicara: string;
  datosEntrenamiento: string;
  gopPresentacion: string;
  fechaFinalizacion: string;
  status: string;
  evidencia: string;
};
