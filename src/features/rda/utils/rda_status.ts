/**
 * @fileoverview Business rules evaluating phase completion and overall Abierto/Cerrado/Evaluado RDA status.
 */

import type { Rda } from "@/domain/models/rda";

export const RDA_PHASE_STEP_IDS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  1: [],
  2: ["rda-step-1", "rda-step-2", "rda-step-3", "rda-step-4"],
  3: [
    "rda-step-5",
    "rda-step-6",
    "rda-step-7",
    "rda-step-8",
    "rda-step-9",
    "rda-step-11",
    "rda-step-12",
  ],
  4: ["rda-step-14"],
  5: ["rda-step-15"],
};

/** Checks whether all steps in the specified RDA phase (or explicit phase flag) are completed. */
export function is_rda_phase_complete(rda_record: Rda, phase_number: 1 | 2 | 3 | 4 | 5): boolean {
  if (!rda_record) return false;
  const completed_phases = rda_record.completedPhases || [];
  const completed_or_na_steps = new Set([
    ...(rda_record.completedSteps || []),
    ...(rda_record.naSteps || []),
  ]);

  const phase_prefix = `${phase_number}.`;
  if (completed_phases.some((phase_label) => phase_label.trim().startsWith(phase_prefix))) {
    return true;
  }

  const required_steps = RDA_PHASE_STEP_IDS[phase_number];
  return (
    required_steps.length > 0 &&
    required_steps.every((step_id) => completed_or_na_steps.has(step_id))
  );
}

/** Derives overall RDA lifecycle status from phase completion or legacy status fields. */
export function get_rda_status(
  rda_record: Rda,
  options?: { ignoreLegacyStatus?: boolean },
): "Abierto" | "Cerrado" | "Evaluado" {
  if (!rda_record) return "Abierto";

  const is_phase_4_done = is_rda_phase_complete(rda_record, 4);
  const is_phase_5_done = is_rda_phase_complete(rda_record, 5);
  if (is_phase_4_done && is_phase_5_done) {
    return "Evaluado";
  }

  const is_phase_1_done = is_rda_phase_complete(rda_record, 1);
  const is_phase_2_done = is_rda_phase_complete(rda_record, 2);
  const is_phase_3_done = is_rda_phase_complete(rda_record, 3);
  if (is_phase_1_done && is_phase_2_done && is_phase_3_done) {
    return "Cerrado";
  }

  const has_phase_or_step_data =
    (rda_record.completedPhases && rda_record.completedPhases.length > 0) ||
    (rda_record.completedSteps && rda_record.completedSteps.length > 0) ||
    (rda_record.naSteps && rda_record.naSteps.length > 0);

  if (!options?.ignoreLegacyStatus && !has_phase_or_step_data) {
    if (rda_record.status === "Evaluado") return "Evaluado";
    if (rda_record.status === "Cerrado") return "Cerrado";
  }

  return "Abierto";
}
