/**
 * Catálogo ordenado de fases del ciclo PDCA y sus clases de estilos visuales Tailwind.
 */
import type { Phase } from "../models/pdca";

/** Secuencia oficial de las 6 pestañas/fases dentro de un proyecto PDCA. */
export const PHASES: Phase[] = ["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"];

/** Mapeo de clases Tailwind por fase para insignias, tarjetas y encabezados. */
export const PHASE_STYLES: Record<Phase, string> = {
  Resumen:
    "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  Plan: "bg-phase-plan/12 text-phase-plan border-phase-plan/30",
  Do: "bg-phase-do/25 text-brand-yellow-foreground border-phase-do/50",
  Check: "bg-phase-check/15 text-phase-check border-phase-check/35",
  Act: "bg-phase-act/15 text-phase-act border-phase-act/35",
  Evaluacion: "bg-primary/15 text-primary border-primary/35",
};
