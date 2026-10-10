/**
 * Tipos relacionados a la fase Act (Estandarización).
 */
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
