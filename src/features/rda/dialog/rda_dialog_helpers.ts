/**
 * @fileoverview Constants, phase theme colors, progress calculator, and error mapping for RdaDialog.
 */

import type { Rda } from "@/domain/models/rda";
import { DocumentTooLargeError } from "@/shared/services/media/inline_media_service";

export type RdaPhase =
  | "1. Resumen"
  | "2. Descripción del Problema"
  | "3. Análisis de Causas Raíz"
  | "4. Evaluación de Calidad RDA"
  | "5. Evaluación de Efectividad de RDA";

export const RDA_PHASES: { id: RdaPhase; label: string }[] = [
  { id: "1. Resumen", label: "1. Resumen" },
  { id: "2. Descripción del Problema", label: "2. Descripción del Problema" },
  { id: "3. Análisis de Causas Raíz", label: "3. Análisis de Causas Raíz" },
  { id: "4. Evaluación de Calidad RDA", label: "4. Evaluación de Calidad RDA" },
  { id: "5. Evaluación de Efectividad de RDA", label: "5. Evaluación de Efectividad de RDA" },
];

export const RDA_PROGRESS_STEP_IDS = [
  "rda-step-1",
  "rda-step-2",
  "rda-step-3",
  "rda-step-4",
  "rda-step-5",
  "rda-step-6",
  "rda-step-7",
  "rda-step-8",
  "rda-step-9",
  "rda-step-11",
  "rda-step-12",
  "rda-step-14",
  "rda-step-15",
] as const;

const ACTIVE_TAB_COLOR_MAP: Record<RdaPhase, string> = {
  "1. Resumen": "bg-purple-600 text-white shadow-sm",
  "2. Descripción del Problema": "bg-blue-600 text-white shadow-sm",
  "3. Análisis de Causas Raíz": "bg-orange-500 text-white shadow-sm",
  "4. Evaluación de Calidad RDA": "bg-teal-600 text-white shadow-sm",
  "5. Evaluación de Efectividad de RDA": "bg-indigo-600 text-white shadow-sm",
};

const INACTIVE_TAB_COLOR_MAP: Record<RdaPhase, string> = {
  "1. Resumen": "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
  "2. Descripción del Problema":
    "bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:bg-blue-900/30",
  "3. Análisis de Causas Raíz": "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
  "4. Evaluación de Calidad RDA": "bg-teal-600/10 text-teal-700 hover:bg-teal-600/20",
  "5. Evaluación de Efectividad de RDA": "bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/20",
};

const INACTIVE_CHECK_COLOR_MAP: Record<RdaPhase, string> = {
  "1. Resumen": "border-purple-500/30 text-purple-500/30 hover:border-purple-500 hover:text-purple-500",
  "2. Descripción del Problema":
    "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500",
  "3. Análisis de Causas Raíz":
    "border-orange-500/30 text-orange-500/30 hover:border-orange-500 hover:text-orange-500",
  "4. Evaluación de Calidad RDA":
    "border-teal-600/30 text-teal-600/30 hover:border-teal-600 hover:text-teal-600",
  "5. Evaluación de Efectividad de RDA":
    "border-indigo-600/30 text-indigo-600/30 hover:border-indigo-600 hover:text-indigo-600",
};

/** Returns Tailwind classes for an RDA phase stepper button based on selection state. */
export function get_phase_tab_colors(phase_id: RdaPhase, is_current: boolean): string {
  return is_current ? ACTIVE_TAB_COLOR_MAP[phase_id] : INACTIVE_TAB_COLOR_MAP[phase_id];
}

/** Returns Tailwind classes for the circular phase completion checkmark inside the stepper. */
export function get_phase_check_colors(
  phase_id: RdaPhase,
  is_current: boolean,
  is_completed: boolean,
): string {
  if (is_completed) return "bg-emerald-500 text-white border-transparent hover:bg-emerald-600";
  if (is_current) return "border-white/40 text-white/50 hover:border-white hover:text-white";
  return INACTIVE_CHECK_COLOR_MAP[phase_id];
}

/** Computes completed step ratio and percentage across all 13 RDA methodological steps. */
export function compute_rda_progress(rda_record: Rda) {
  const total_steps = RDA_PROGRESS_STEP_IDS.length;
  const done_or_na = new Set([
    ...(rda_record.completedSteps || []),
    ...(rda_record.naSteps || []),
  ]);
  const completed_count = RDA_PROGRESS_STEP_IDS.filter((step_id) => done_or_na.has(step_id)).length;
  const progress_pct = Math.round((completed_count / total_steps) * 100) || 0;
  return { total_steps, completed_count, progress_pct };
}

/** Translates Firestore, Storage, or payload size errors into user-friendly Spanish feedback. */
export function describe_rda_save_error(save_error: unknown): string {
  if (save_error instanceof DocumentTooLargeError) {
    return `${save_error.message} Elimina o reduce algunas imágenes y vuelve a intentar.`;
  }
  const error_code = (save_error as { code?: string } | null)?.code;
  if (error_code === "permission-denied" || error_code === "unauthenticated") {
    return "No tienes permiso para guardar este RDA. Cierra sesión y vuelve a entrar.";
  }
  if (error_code === "unavailable" || error_code === "deadline-exceeded") {
    return "Sin conexión con el servidor. Revisa tu internet; tus cambios siguen en pantalla.";
  }
  if (error_code === "storage/unauthorized" || error_code?.startsWith("storage/")) {
    return "No se pudo subir una de las imágenes del RDA. Inténtalo de nuevo.";
  }
  return "No se pudieron guardar los cambios del RDA. Tus cambios siguen en pantalla; inténtalo de nuevo.";
}
