/**
 * @fileoverview Shared progress percentage, deadline date parsing, and expiration helpers for PDCAs.
 */

import { isBefore, isValid, startOfDay } from "date-fns";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/features/pdca/dialog/pdca_step_constants";
import type { Pdca, Phase } from "@/domain/pdca";

/** Computes methodological completion percentage from completed step tracking or legacy progress field. */
export function get_computed_pdca_progress(pdca_record: Pdca): number {
  if (!pdca_record.completedSteps) {
    return pdca_record.progreso || 0;
  }
  const completed_set = new Set(pdca_record.completedSteps);
  const completed_count = ALL_STEP_IDS.filter((step_id) => completed_set.has(step_id)).length;
  return TOTAL_STEPS > 0 ? Math.round((completed_count / TOTAL_STEPS) * 100) : 0;
}

/** Parses a PDCA `dd/MM/yyyy` deadline string into a valid `Date`, handling `"Sin límite"` as undefined. */
export function parse_pdca_deadline(raw_deadline?: string): {
  deadline_text: string;
  is_no_limit: boolean;
  deadline_date: Date | undefined;
} {
  const deadline_text = raw_deadline?.trim() || "";
  const is_no_limit = deadline_text === "Sin límite";
  let deadline_date: Date | undefined;

  if (deadline_text && !is_no_limit) {
    const date_parts = deadline_text.split("/");
    if (date_parts.length === 3 && date_parts[0] && date_parts[1] && date_parts[2]) {
      const parsed_date = new Date(+date_parts[2], +date_parts[1] - 1, +date_parts[0]);
      if (isValid(parsed_date)) {
        deadline_date = parsed_date;
      }
    }
  }

  return { deadline_text, is_no_limit, deadline_date };
}

/** Evaluates whether an active PDCA has passed its deadline without reaching 100% in Act phase. */
export function is_pdca_deadline_expired(
  deadline_date: Date | undefined,
  phase: Phase,
  progress: number,
): boolean {
  if (!deadline_date) {
    return false;
  }
  if (phase === "Act" && progress === 100) {
    return false;
  }
  return isBefore(startOfDay(deadline_date), startOfDay(new Date()));
}
