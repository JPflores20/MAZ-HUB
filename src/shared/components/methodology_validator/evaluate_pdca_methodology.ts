/**
 * @fileoverview Evaluates PDCA project methodological consistency from PLAN through ACT/SDCA.
 * Checks goal definition, stratification/Ishikawa, 5 Whys, action owners, and verification/standardization.
 */

import {
  compute_methodology_score_percentage,
  score_from_validation_status,
  type PdcaMethodologyInput,
  type ValidationCriterion,
  type ValidationCriterionStatus,
} from "./methodology_types";

/**
 * Evaluates whether a PDCA project maintains end-to-end methodological continuity.
 *
 * @param {PdcaMethodologyInput} methodology_input - Aggregated phase metrics for the PDCA project.
 * @returns {{ criteria: ValidationCriterion[]; scorePct: number }} Evaluated 5 criteria and total percentage score.
 */
export function evaluate_pdca_methodology(methodology_input: PdcaMethodologyInput): {
  criteria: ValidationCriterion[];
  scorePct: number;
} {
  const has_complete_goal = Boolean(
    methodology_input.kpiLabel &&
      methodology_input.kpiLabel !== "-" &&
      methodology_input.desdeVal &&
      methodology_input.desdeVal !== "-" &&
      methodology_input.aVal &&
      methodology_input.aVal !== "-",
  );
  const goal_status: ValidationCriterionStatus = has_complete_goal
    ? "ok"
    : methodology_input.kpiLabel && methodology_input.kpiLabel !== "-"
      ? "warning"
      : "missing";

  const ishikawa_causes_count = methodology_input.ishikawaCausesCount ?? 0;
  const has_stratification_data = Boolean(methodology_input.hasParetoOrCorrelation);
  const facts_status: ValidationCriterionStatus =
    ishikawa_causes_count >= 3 && has_stratification_data
      ? "ok"
      : ishikawa_causes_count >= 1 || has_stratification_data
        ? "warning"
        : "missing";

  const five_whys_count = methodology_input.fiveWhysCount ?? 0;
  const root_cause_conclusions_count = methodology_input.rootCauseConclusionsCount ?? 0;
  const root_cause_status: ValidationCriterionStatus =
    five_whys_count >= 1 && root_cause_conclusions_count >= 1
      ? "ok"
      : five_whys_count >= 1 || root_cause_conclusions_count >= 1
        ? "warning"
        : "missing";

  const actions_count = methodology_input.actionsCount ?? 0;
  const actions_with_owner_count = methodology_input.actionsWithOwnerCount ?? 0;
  const action_plan_status: ValidationCriterionStatus =
    actions_count >= 1 && actions_with_owner_count === actions_count
      ? "ok"
      : actions_count >= 1
        ? "warning"
        : "missing";

  const has_after_comparison = Boolean(methodology_input.hasAfterComparison);
  const sdca_checked_count = methodology_input.sdcaCheckedCount ?? 0;
  const check_act_status: ValidationCriterionStatus =
    has_after_comparison && sdca_checked_count >= 1
      ? "ok"
      : has_after_comparison || sdca_checked_count >= 1
        ? "warning"
        : "missing";

  const criteria: ValidationCriterion[] = [
    {
      id: "pdca-goal",
      label: "1. Definición de Meta y GAP (Fase PLAN)",
      detail: has_complete_goal
        ? `KPI (${methodology_input.kpiLabel}) con línea base y meta configuradas`
        : "Falta completar KPI, valor inicial (Desde) o valor meta (A)",
      status: goal_status,
      suggestedScore5: score_from_validation_status(goal_status),
    },
    {
      id: "pdca-facts",
      label: "2. Estratificación (Pareto/Correlación) e Ishikawa 6M",
      detail: `${ishikawa_causes_count} causa(s) en Ishikawa • Datos de Pareto/Correlación: ${has_stratification_data ? "Registrados" : "Pendientes"}`,
      status: facts_status,
      suggestedScore5: score_from_validation_status(facts_status),
    },
    {
      id: "pdca-rc",
      label: "3. Hilo Conductor: 5 Porqués → Conclusiones de Causa Raíz",
      detail: `${five_whys_count} cadena(s) de 5 Porqués • ${root_cause_conclusions_count} conclusión(es) de Causa Raíz`,
      status: root_cause_status,
      suggestedScore5: score_from_validation_status(root_cause_status),
    },
    {
      id: "pdca-do",
      label: "4. Plan de Acción (Fase DO)",
      detail: `${actions_count} acción(es) registrada(s) (${actions_with_owner_count} con responsable asignado)`,
      status: action_plan_status,
      suggestedScore5: score_from_validation_status(action_plan_status),
    },
    {
      id: "pdca-check-act",
      label: "5. Verificación Antes/Después y Estandarización SDCA (CHECK / ACT)",
      detail: `Comparativo Antes/Después: ${has_after_comparison ? "Sí" : "Pendiente"} • Checkpoints SDCA evaluados: ${sdca_checked_count}`,
      status: check_act_status,
      suggestedScore5: score_from_validation_status(check_act_status),
    },
  ];

  return {
    criteria,
    scorePct: compute_methodology_score_percentage(criteria),
  };
}
