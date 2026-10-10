/**
 * Tipos relacionados a la fase Do.
 */
export type ActionItem = {
  id: string;
  // Campos nuevos (tabla de Plan de Acción)
  tema?: string;
  causaRaiz?: string;
  causaRaiz2?: string;
  accion?: string;
  accion2?: string;
  comentarios?: string;
  herramientaSdca?: string;
  // Campos legacy (compatibilidad)
  what?: string;
  who?: string;
  when?: string;
  status: "Pendiente" | "En progreso" | "Retrasado" | "Completada";
  responsable?: string;
  fecha?: string;
  done?: boolean;
  // Campos de matriz de impacto integrados
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

/**
 * Evidencia de solución en la fase Do.
 */
export type EvidenciaSolucionItem = {
  actionId: string;
  image: string;
};

/**
 * Representa una prueba ejecutada.
 */
export type PruebaEjecutadaItem = {
  id: string;
  prueba: string;
  fecha: string;
  resultado: string;
  estado: "Exitoso" | "Fallido" | "Pendiente" | "";
  evidencia?: string;
};
