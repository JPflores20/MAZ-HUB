/**
 * @fileoverview Evaluates RDA report completeness across 5W2H, evidence, root cause, PDA, and standardization.
 * Produces structured criteria feedback and suggested quality self-evaluation scores.
 */

import type { Rda, RdaQualityEval } from "@/domain/models/rda";
import {
  compute_methodology_score_percentage,
  score_from_validation_status,
  type ValidationCriterion,
  type ValidationCriterionStatus,
} from "./methodology_types";

/**
 * Counts populated Ishikawa 6M cause strings/objects across all categories.
 *
 * @param {Record<string, ({ text?: string } | string)[]>} causes_by_category - Ishikawa causes map.
 * @returns {number} Total count of non-empty cause entries.
 */
function count_ishikawa_causes(
  causes_by_category: Record<string, ({ text?: string } | string)[]>,
): number {
  return Object.values(causes_by_category).reduce<number>((total_count, category_causes) => {
    if (!Array.isArray(category_causes)) {
      return total_count;
    }
    const valid_category_count = category_causes.filter((cause_entry) => {
      const cause_text = typeof cause_entry === "string" ? cause_entry : cause_entry?.text;
      return Boolean(cause_text?.trim());
    }).length;
    return total_count + valid_category_count;
  }, 0);
}

/**
 * Evaluates methodological consistency for an RDA record across the 5 audit dimensions.
 *
 * @param {Rda} rda_record - Full RDA problem-solving record to inspect.
 * @returns {{
 *   criteria: ValidationCriterion[];
 *   scorePct: number;
 *   suggestedQualityEval: Omit<RdaQualityEval, "conclusion">;
 * }} Pre-audit criteria, percentage score, and suggested rubric scores.
 */
export function evaluate_rda_methodology(rda_record: Rda): {
  criteria: ValidationCriterion[];
  scorePct: number;
  suggestedQualityEval: Omit<RdaQualityEval, "conclusion">;
} {
  // 1. Definición 5W2H y Cabeza de Ishikawa
  const problem_description = rda_record.problemDescription;
  const filled_five_w_count = [
    problem_description?.que,
    problem_description?.como,
    problem_description?.cuando,
    problem_description?.donde,
    problem_description?.quien,
    problem_description?.cual,
  ].filter((field_text) => Boolean(field_text && field_text.trim())).length;

  const has_ishikawa_effect = Boolean(
    (rda_record.ishikawa?.[0]?.effect && rda_record.ishikawa[0].effect.trim()) ||
      (rda_record.title && rda_record.title.trim()),
  );
  const definition_status: ValidationCriterionStatus =
    filled_five_w_count >= 5 && has_ishikawa_effect
      ? "ok"
      : filled_five_w_count >= 2 || has_ishikawa_effect
        ? "warning"
        : "missing";
  const definition_score = score_from_validation_status(definition_status);

  // 2. Evidencia y Contención Inmediata (Paso 2 y Paso 3)
  const evidence_count =
    (rda_record.timeline || []).reduce(
      (accumulated_images, timeline_event) => accumulated_images + (timeline_event.images?.length || 0),
      0,
    ) +
    (rda_record.evidenciasValidacion?.length || 0) +
    (rda_record.evidenciasEliminacionCausa?.length || 0);
  const immediate_actions_count = (rda_record.immediateActions || []).filter((action_row) =>
    Boolean((action_row.accion || action_row.causaPotencial || "").trim()),
  ).length;
  const evidence_status: ValidationCriterionStatus =
    evidence_count > 0 && immediate_actions_count > 0
      ? "ok"
      : evidence_count > 0 || immediate_actions_count > 0
        ? "warning"
        : "missing";
  const evidence_score = score_from_validation_status(evidence_status);

  // 3. Análisis de Causa Raíz (Ishikawa 6M -> Plan de Validación Paso 9 -> 5 Porqués Paso 11)
  const ishikawa_causes_map = rda_record.ishikawa?.[0]?.causes || {};
  const total_ishikawa_causes = count_ishikawa_causes(ishikawa_causes_map);
  const validation_rows = (rda_record.validationActions || []).filter((validation_row) =>
    Boolean((validation_row.causaPotencial || validation_row.accion || "").trim()),
  );
  const confirmed_root_causes = validation_rows.filter(
    (validation_row) => validation_row.esCausaRaiz === "SI",
  );
  const root_cause_status: ValidationCriterionStatus =
    total_ishikawa_causes >= 3 && confirmed_root_causes.length >= 1
      ? "ok"
      : total_ishikawa_causes >= 1 || validation_rows.length >= 1
        ? "warning"
        : "missing";
  const root_cause_score = score_from_validation_status(root_cause_status);

  // 4. Acciones Correctivas / PDA (Paso 12) conectadas con Causas Raíz
  const pda_rows = (rda_record.pda || []).filter((pda_row) =>
    Boolean((pda_row.accion || pda_row.what || "").trim()),
  );
  const pda_with_owner_and_date = pda_rows.filter(
    (pda_row) =>
      Boolean((pda_row.responsable || pda_row.who || "").trim()) &&
      Boolean((pda_row.fecha || pda_row.when || "").trim()),
  );
  const pda_status: ValidationCriterionStatus =
    pda_rows.length > 0 &&
    pda_with_owner_and_date.length === pda_rows.length &&
    pda_rows.length >= confirmed_root_causes.length
      ? "ok"
      : pda_rows.length > 0
        ? "warning"
        : "missing";
  const pda_score = score_from_validation_status(pda_status);

  // 5. Estandarización (LUP / Documentos) y Validación de Efectividad
  const has_lup_or_standard =
    (rda_record.tablaEstandarizacion?.length || 0) > 0 ||
    Object.values(rda_record.checklistEstandarizacion || {}).some(Boolean) ||
    Boolean(rda_record.efectividadRda?.resultado?.trim());
  const completed_pda_count = pda_rows.filter((pda_row) =>
    Boolean(pda_row.done || pda_row.status === "Completada"),
  ).length;
  const effectiveness_status: ValidationCriterionStatus =
    has_lup_or_standard && completed_pda_count > 0
      ? "ok"
      : has_lup_or_standard || completed_pda_count > 0
        ? "warning"
        : "missing";
  const effectiveness_score = score_from_validation_status(effectiveness_status);

  const criteria: ValidationCriterion[] = [
    {
      id: "rda-def",
      label: "1. Definición 5W2H y Cabeza del Ishikawa",
      detail: `${filled_five_w_count}/6 preguntas 5W1H respondidas • Efecto en Ishikawa: ${has_ishikawa_effect ? "Definido" : "Pendiente"}`,
      status: definition_status,
      suggestedScore5: definition_score,
    },
    {
      id: "rda-evi",
      label: "2. Evidencia Fotográfica y Contención (Paso 2 y 3)",
      detail: `${evidence_count} evidencia(s) • ${immediate_actions_count} acción(es) inmediata(s)`,
      status: evidence_status,
      suggestedScore5: evidence_score,
    },
    {
      id: "rda-rc",
      label: "3. Hilo Conductor Ishikawa → Validación de Causa Raíz",
      detail: `${total_ishikawa_causes} causa(s) en 6M • ${validation_rows.length} validada(s) • ${confirmed_root_causes.length} Causa(s) Raíz confirmada(s)`,
      status: root_cause_status,
      suggestedScore5: root_cause_score,
    },
    {
      id: "rda-pda",
      label: "4. Cobertura de Causas Raíz en el PDA (Paso 12)",
      detail: `${pda_rows.length} acción(es) en PDA (${pda_with_owner_and_date.length} con responsable y fecha límite)`,
      status: pda_status,
      suggestedScore5: pda_score,
    },
    {
      id: "rda-eff",
      label: "5. Cierre, LUP / Estandarización y Efectividad",
      detail: `${completed_pda_count}/${pda_rows.length} acciones cerradas • Estándar/Efectividad: ${has_lup_or_standard ? "Registrado" : "Pendiente"}`,
      status: effectiveness_status,
      suggestedScore5: effectiveness_score,
    },
  ];

  return {
    criteria,
    scorePct: compute_methodology_score_percentage(criteria),
    suggestedQualityEval: {
      definicionProblema: definition_score,
      evidencia: evidence_score,
      causaRaiz: root_cause_score,
      accionesCorrectivas: pda_score,
      validacionEfectividad: effectiveness_score,
    },
  };
}
