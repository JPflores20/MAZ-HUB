/**
 * Definición de tipos para el Plan de Acción, Evidencias de Solución y Pruebas Ejecutadas (Fase Do / Check).
 */

/** Elemento del Plan de Acción con soporte para formato moderno y campos legados. */
export type ActionItem = {
  id: string;
  tema?: string;
  causaRaiz?: string;
  causaRaiz2?: string;
  accion?: string;
  accion2?: string;
  analisis5Medios?: string;
  comentarios?: string;
  herramientaSdca?: string;
  what?: string;
  who?: string;
  when?: string;
  status: "Pendiente" | "En progreso" | "Retrasado" | "Completada";
  responsable?: string;
  fecha?: string;
  done?: boolean;
  seguridad?: number | "";
  calidadHigiene?: number | "";
  costo?: number | "";
  medioAmbiente?: number | "";
  servicio?: number | "";
  resultados?: number | "";
  priorizar?: "SI" | "NO" | "";
  quickWin?: "SI" | "NO" | "";
  technologyRequired?: "SI" | "NO" | "";
};

/** Imagen o archivo asociado como evidencia de una acción ejecutada. */
export type EvidenciaSolucionItem = {
  actionId: string;
  image: string;
};

/** Registro de prueba piloto o verificación de hipótesis ejecutada en campo. */
export type PruebaEjecutadaItem = {
  id: string;
  prueba: string;
  fecha: string;
  resultado: string;
  estado: "Exitoso" | "Fallido" | "Pendiente" | "";
  evidencia?: string;
};
