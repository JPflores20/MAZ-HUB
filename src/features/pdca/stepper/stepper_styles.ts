/**
 * @fileoverview Clases de color CSS para los estados activo, pendiente y completado del stepper PDCA.
 */

const COLORES_ACTIVO_POR_FASE: Record<string, string> = {
  Resumen: "bg-blue-600 text-white shadow-sm",
  Plan: "bg-red-600 text-white shadow-sm",
  Do: "bg-yellow-400 text-black shadow-sm",
  Check: "bg-emerald-500 text-white shadow-sm",
  Act: "bg-blue-600 text-white shadow-sm",
  Evaluacion: "bg-indigo-900 text-white shadow-sm",
};

const COLORES_INACTIVO_POR_FASE: Record<string, string> = {
  Resumen:
    "bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:bg-blue-900/30",
  Plan: "bg-red-500 dark:bg-red-600/10 text-red-700 dark:text-red-300 hover:bg-red-500 dark:bg-red-600/20",
  Do: "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30",
  Check: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
  Act: "bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:bg-blue-900/30",
  Evaluacion: "bg-indigo-900/10 text-indigo-900 hover:bg-indigo-900/20",
};

const COLORES_CIRCULO_POR_FASE: Record<string, string> = {
  Resumen:
    "border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  Plan: "border-red-200 bg-red-100 text-red-700 dark:text-red-300",
  Do: "border-yellow-400/40 bg-yellow-200/50 text-yellow-800",
  Check: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Act: "border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  Evaluacion: "border-indigo-200 bg-indigo-100 text-indigo-900",
};

const COLORES_SUBTEXTO_POR_FASE: Record<string, string> = {
  Resumen: "text-blue-700 dark:text-blue-300/70",
  Plan: "text-red-700 dark:text-red-300/70",
  Do: "text-yellow-800/70",
  Check: "text-emerald-700/70",
  Act: "text-blue-700 dark:text-blue-300/70",
  Evaluacion: "text-indigo-900/70",
};

const BORDES_TOGGLE_POR_FASE: Record<string, string> = {
  Plan: "border-red-500/30 text-red-500 dark:text-red-400/30 hover:border-red-500 hover:text-red-500 dark:text-red-400",
  Do: "border-yellow-600/30 text-yellow-600/30 hover:border-yellow-600 hover:text-yellow-600",
  Check: "border-emerald-500/30 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-500",
  Act: "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500",
  Evaluacion: "border-indigo-900/30 text-indigo-900/30 hover:border-indigo-900 hover:text-indigo-900",
};

/**
 * Obtiene los estilos de contenedor para una pestaña de fase del stepper.
 */
export const obtener_colores_pestana_fase = (fase_id: string, es_actual: boolean): string => {
  if (es_actual) {
    return COLORES_ACTIVO_POR_FASE[fase_id] ?? "bg-primary text-primary-foreground shadow-sm";
  }
  return COLORES_INACTIVO_POR_FASE[fase_id] ?? "hover:bg-background/80 text-muted-foreground";
};

/**
 * Obtiene los estilos para el indicador numérico circular de una fase.
 */
export const obtener_colores_circulo_fase = (
  fase_id: string,
  es_actual: boolean,
  esta_completada: boolean,
): string => {
  if (esta_completada) return "border-emerald-500 bg-emerald-500 text-white";
  if (es_actual) {
    return fase_id === "Do"
      ? "border-black/20 bg-black/10 text-black"
      : "border-white/20 bg-white/20 text-white";
  }
  return COLORES_CIRCULO_POR_FASE[fase_id] ?? "border-border bg-background";
};

/**
 * Obtiene el color del subtítulo de la fase según si está seleccionada actualmente.
 */
export const obtener_subtexto_fase = (fase_id: string, es_actual: boolean): string => {
  if (es_actual) return fase_id === "Do" ? "text-black/70" : "text-white/80";
  return COLORES_SUBTEXTO_POR_FASE[fase_id] ?? "text-muted-foreground/80";
};

/**
 * Obtiene los colores del botón circular para marcar una fase como completada.
 */
export const obtener_borde_toggle_fase = (
  fase_id: string,
  es_actual: boolean,
  esta_completada: boolean,
): string => {
  if (esta_completada) return "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600";
  if (es_actual) {
    return fase_id === "Do"
      ? "border-black/30 text-black/40 hover:border-black hover:text-black"
      : "border-white/40 text-white/50 hover:border-white hover:text-white";
  }
  return (
    BORDES_TOGGLE_POR_FASE[fase_id] ??
    "border-muted-foreground/30 text-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500"
  );
};
