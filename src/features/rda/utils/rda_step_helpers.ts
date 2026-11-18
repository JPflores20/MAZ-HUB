/**
 * @fileoverview Shared RDA step completion/NA toggles, official dropdown helpers, and 6M catalogs.
 */

import type { Rda } from "@/domain/models/rda";

export const ISHIKAWA_CATEGORY_MAP: Record<string, string> = {
  machine: "Máquina",
  method: "Método",
  material: "Material",
  manpower: "Mano de obra",
  man: "Mano de obra",
  measurement: "Medición",
  environment: "Medio ambiente",
};

export const CATEGORIAS_6M_LIST = [
  "Máquina",
  "Método",
  "Material",
  "Mano de obra",
  "Medición",
  "Medio ambiente",
] as const;

export const CINCO_MEDIOS_OPTIONS = [
  "1.- Establecer condiciones basicas del Equipo (CIL).",
  "2.- Mantener condiciones basicas de operación",
  "3.- Restaurar deterioro natural o forzado",
  "4.- Mejorar puntos debiles de diseño",
  "5.- Prevencion de errores Humanos",
] as const;

/** Prepends any persisted legacy option not present in the official list so values stay visible. */
export function resolve_select_options(
  official_options: readonly string[],
  current_value?: string,
): string[] {
  const trimmed = (current_value || "").trim();
  if (!trimmed) return [...official_options];
  const exists = official_options.some((option) => option.toLowerCase() === trimmed.toLowerCase());
  return exists ? [...official_options] : [trimmed, ...official_options];
}

/** Matches a stored string case-insensitively against the canonical casing in an official list. */
export function normalize_official_value(
  official_options: readonly string[],
  current_value?: string,
): string {
  const trimmed = (current_value || "").trim();
  if (!trimmed) return "";
  const match = official_options.find((option) => option.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

/** Builds unified completed/NA toggle callbacks for RDA StepCard wrappers across phases. */
export function create_rda_step_controls(rda_record: Rda, on_change: (updated_rda: Rda) => void) {
  const is_step_completed = (step_id: string) =>
    rda_record.completedSteps?.includes(step_id) || false;
  const is_step_na = (step_id: string) => rda_record.naSteps?.includes(step_id) || false;

  const toggle_step = (step_id: string) => {
    const completed = rda_record.completedSteps || [];
    const na_steps = rda_record.naSteps || [];
    if (completed.includes(step_id)) {
      on_change({
        ...rda_record,
        completedSteps: completed.filter((existing_id) => existing_id !== step_id),
      });
      return;
    }
    on_change({
      ...rda_record,
      completedSteps: [...completed, step_id],
      naSteps: na_steps.filter((existing_id) => existing_id !== step_id),
    });
  };

  const toggle_na = (step_id: string) => {
    const na_steps = rda_record.naSteps || [];
    const completed = rda_record.completedSteps || [];
    if (na_steps.includes(step_id)) {
      on_change({
        ...rda_record,
        naSteps: na_steps.filter((existing_id) => existing_id !== step_id),
      });
      return;
    }
    on_change({
      ...rda_record,
      naSteps: [...na_steps, step_id],
      completedSteps: completed.filter((existing_id) => existing_id !== step_id),
    });
  };

  const build_step_props = (step_id: string) => ({
    defaultExpanded: true,
    isStepCompleted: is_step_completed(step_id),
    isNa: is_step_na(step_id),
    onToggleStep: () => toggle_step(step_id),
    onToggleNa: () => toggle_na(step_id),
  });

  return { is_step_completed, is_step_na, toggle_step, toggle_na, build_step_props };
}
