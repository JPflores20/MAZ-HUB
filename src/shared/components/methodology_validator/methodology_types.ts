/**
 * @fileoverview Shared TypeScript contracts and scoring helpers for methodology validation.
 * Used by both RDA and PDCA pre-audit consistency evaluators and the UI card component.
 */

import type React from "react";

/** Status indicator for an evaluated methodological checkpoint. */
export type ValidationCriterionStatus = "ok" | "warning" | "missing";

/** Structured evaluation result for a single methodology dimension. */
export interface ValidationCriterion {
  id: string;
  label: string;
  detail: string;
  status: ValidationCriterionStatus;
  suggestedScore5: number;
}

/** Input summary metrics used to evaluate PDCA methodological consistency. */
export interface PdcaMethodologyInput {
  kpiLabel?: string | undefined;
  desdeVal?: string | undefined;
  aVal?: string | undefined;
  hasParetoOrCorrelation?: boolean | undefined;
  ishikawaCausesCount?: number | undefined;
  fiveWhysCount?: number | undefined;
  rootCauseConclusionsCount?: number | undefined;
  actionsCount?: number | undefined;
  actionsWithOwnerCount?: number | undefined;
  hasAfterComparison?: boolean | undefined;
  sdcaCheckedCount?: number | undefined;
}

/** Props accepted by the MethodologyValidatorCard UI component. */
export interface MethodologyValidatorCardProps {
  title?: string | undefined;
  criteria: ValidationCriterion[];
  scorePct: number;
  actionButton?: React.ReactNode | undefined;
}

/**
 * Converts a checkpoint status into its 1-to-5 pre-audit quality score.
 *
 * @param {ValidationCriterionStatus} criterion_status - Evaluated status of the dimension.
 * @returns {number} Numeric score on the 5-point scale (`5` = ok, `3` = warning, `1` = missing).
 */
export function score_from_validation_status(
  criterion_status: ValidationCriterionStatus,
): number {
  if (criterion_status === "ok") {
    return 5;
  }
  if (criterion_status === "warning") {
    return 3;
  }
  return 1;
}

/**
 * Computes the overall percentage score from a list of evaluated criteria.
 *
 * @param {ValidationCriterion[]} evaluated_criteria - The 5 methodology criteria results.
 * @returns {number} Rounded completion percentage from 0 to 100.
 */
export function compute_methodology_score_percentage(
  evaluated_criteria: ValidationCriterion[],
): number {
  const total_points = evaluated_criteria.reduce(
    (accumulated_points, criterion_entry) => accumulated_points + criterion_entry.suggestedScore5,
    0,
  );
  return Math.round((total_points / 25) * 100);
}
