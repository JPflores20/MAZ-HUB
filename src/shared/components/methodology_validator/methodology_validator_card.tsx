/**
 * @fileoverview Visual pre-audit consistency semaphore card for PDCA and RDA methodology evaluators.
 * Renders the overall percentage badge and the 5 individual checkpoint tiles.
 */

import type React from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import type {
  MethodologyValidatorCardProps,
  ValidationCriterionStatus,
} from "./methodology_types";

/**
 * Selects semantic badge classes matching the consistency score threshold.
 *
 * @param {number} score_percentage - Consistency percentage from 0 to 100.
 * @returns {string} Tailwind color utility classes for the badge.
 */
function resolve_score_badge_classes(score_percentage: number): string {
  if (score_percentage >= 80) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  }
  if (score_percentage >= 50) {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
  }
  return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
}

/**
 * Renders the status icon associated with an individual criterion evaluation.
 *
 * @param {{ status: ValidationCriterionStatus }} props - Criterion status descriptor.
 * @returns {React.ReactElement} Lucide icon element colored for ok/warning/missing.
 */
function CriterionStatusIcon({
  status,
}: {
  status: ValidationCriterionStatus;
}): React.ReactElement {
  if (status === "ok") {
    return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  }
  if (status === "warning") {
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />;
  }
  return <XCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />;
}

/**
 * Displays a responsive pre-audit consistency scorecard across 5 methodology dimensions.
 *
 * @param {MethodologyValidatorCardProps} props - Card title, evaluated criteria, percentage score, and optional action slot.
 * @returns {React.ReactElement} Rendered pre-audit validation card.
 */
export const MethodologyValidatorCard: React.FC<MethodologyValidatorCardProps> = ({
  title = "Semáforo de Consistencia Metodológica (Pre-Auditoría)",
  criteria,
  scorePct,
  actionButton,
}) => {
  const score_badge_classes = resolve_score_badge_classes(scorePct);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs print:break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${score_badge_classes}`}
          >
            Índice de Consistencia: {scorePct}%
          </span>
          {actionButton}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {criteria.map((criterion_entry) => (
          <div
            key={criterion_entry.id}
            className="flex flex-col justify-between rounded-lg border border-border/70 bg-secondary/20 p-2.5 text-xs"
          >
            <div className="flex items-start gap-2">
              <CriterionStatusIcon status={criterion_entry.status} />
              <span className="font-semibold text-foreground leading-snug">
                {criterion_entry.label}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              {criterion_entry.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
