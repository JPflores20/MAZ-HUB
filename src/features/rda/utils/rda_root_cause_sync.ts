/**
 * @fileoverview Synchronization logic between Ishikawa causes, Step 9 Validation Actions, and Step 12 PDA.
 */

import { crear_fila_accion_vacia } from "@/features/pdca/do/paso_18/action_plan_utils";
import type { Rda, RdaValidationAction } from "@/domain/models/rda";
import type { ActionItem } from "@/domain/pdca";
import { ISHIKAWA_CATEGORY_MAP } from "./rda_step_helpers";

type LinkedPdaItem = ActionItem & { sourceValidationId?: string };

function is_root_cause_confirmed(raw_value?: string): boolean {
  const normalized = String(raw_value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  return normalized === "SI";
}

/** Collects confirmed root causes and unconfirmed IDs/texts from validation state snapshots. */
function index_validation_snapshot(
  validation_actions: RdaValidationAction[],
  previous_actions?: RdaValidationAction[],
) {
  const confirmed_map = new Map<string, RdaValidationAction>();
  const previous_confirmed_ids = new Set<string>();
  const previous_confirmed_lower = new Set<string>();
  const unconfirmed_causes_lower = new Set<string>();

  for (const action_item of validation_actions) {
    if (
      is_root_cause_confirmed(action_item.esCausaRaiz) &&
      String(action_item.causaPotencial || "").trim() !== ""
    ) {
      confirmed_map.set(action_item.id, action_item);
    }
  }

  for (const previous_item of previous_actions || []) {
    if (!is_root_cause_confirmed(previous_item.esCausaRaiz)) continue;
    previous_confirmed_ids.add(previous_item.id);
    const lower_text = String(previous_item.causaPotencial || "").trim().toLowerCase();
    if (lower_text) previous_confirmed_lower.add(lower_text);
    if (!confirmed_map.has(previous_item.id) && lower_text) {
      unconfirmed_causes_lower.add(lower_text);
    }
  }

  return { confirmed_map, previous_confirmed_ids, previous_confirmed_lower, unconfirmed_causes_lower };
}

/**
 * Automatically synchronizes Step 9 Validation rows marked `esCausaRaiz === 'SI'` into Step 12 PDA
 * without recreating rows the user explicitly deleted or stripping rows with custom actions written.
 */
export function sync_root_causes_to_pda(
  validation_actions: RdaValidationAction[],
  current_pda: ActionItem[],
  default_topic: string,
  previous_validation_actions?: RdaValidationAction[],
): { nextPda: ActionItem[]; changed: boolean } {
  let changed = false;
  const { confirmed_map, previous_confirmed_ids, previous_confirmed_lower, unconfirmed_causes_lower } =
    index_validation_snapshot(validation_actions || [], previous_validation_actions);

  const pda_list: LinkedPdaItem[] = current_pda
    .map((action_item) => ({ ...action_item }) as LinkedPdaItem)
    .filter((pda_item) => {
      const has_custom_action = String(pda_item.accion || "").trim() !== "";
      if (
        pda_item.sourceValidationId &&
        !confirmed_map.has(pda_item.sourceValidationId) &&
        !has_custom_action
      ) {
        changed = true;
        return false;
      }
      const cause_lower = String(pda_item.causaRaiz || "").trim().toLowerCase();
      if (
        !pda_item.sourceValidationId &&
        cause_lower &&
        unconfirmed_causes_lower.has(cause_lower) &&
        !has_custom_action
      ) {
        changed = true;
        return false;
      }
      return true;
    });

  confirmed_map.forEach((validation_item) => {
    const cause_text = String(validation_item.causaPotencial || "").trim();
    const cause_lower = cause_text.toLowerCase();

    let existing_index = pda_list.findIndex(
      (pda_item) => pda_item.sourceValidationId === validation_item.id,
    );
    if (existing_index === -1) {
      existing_index = pda_list.findIndex(
        (pda_item) =>
          !pda_item.sourceValidationId &&
          String(pda_item.causaRaiz || "").trim().toLowerCase() === cause_lower,
      );
    }

    if (existing_index !== -1) {
      const existing_row = pda_list[existing_index]!;
      const next_topic = String(existing_row.tema || "").trim() || default_topic;
      if (
        existing_row.causaRaiz !== cause_text ||
        existing_row.sourceValidationId !== validation_item.id ||
        existing_row.tema !== next_topic
      ) {
        pda_list[existing_index] = {
          ...existing_row,
          sourceValidationId: validation_item.id,
          tema: next_topic,
          causaRaiz: cause_text,
        };
        changed = true;
      }
      return;
    }

    if (
      previous_validation_actions &&
      (previous_confirmed_ids.has(validation_item.id) ||
        (cause_lower && previous_confirmed_lower.has(cause_lower)))
    ) {
      return;
    }

    const blank_index = pda_list.findIndex(
      (pda_item) =>
        !pda_item.sourceValidationId &&
        !String(pda_item.tema || "").trim() &&
        !String(pda_item.causaRaiz || "").trim() &&
        !String(pda_item.accion || "").trim(),
    );

    const next_row: LinkedPdaItem = {
      ...crear_fila_accion_vacia(),
      sourceValidationId: validation_item.id,
      tema: default_topic,
      causaRaiz: cause_text,
      accion: "",
      priorizar: "SI",
    };

    if (blank_index !== -1) {
      pda_list[blank_index] = { ...next_row, id: pda_list[blank_index]!.id };
    } else {
      pda_list.push(next_row);
    }
    changed = true;
  });

  return { nextPda: pda_list, changed };
}

/** Imports unique non-empty Ishikawa causes into the Step 9 Validation Actions array. */
export function import_ishikawa_causes_to_validation(rda_record: Rda): {
  next_actions: RdaValidationAction[];
  added_count: number;
} {
  const causes_map = rda_record.ishikawa?.[0]?.causes || {};
  const next_actions = [...(rda_record.validationActions || [])];
  let added_count = 0;

  Object.entries(causes_map).forEach(([category_key, cause_list]) => {
    const category_label = ISHIKAWA_CATEGORY_MAP[category_key] || "Método";
    const items = Array.isArray(cause_list) ? cause_list : Object.values(cause_list || {});
    items.forEach((raw_cause, cause_index) => {
      const normalized_text = String(raw_cause || "").trim();
      if (!normalized_text) return;
      const already_exists = next_actions.some(
        (existing_item) =>
          String(existing_item.causaPotencial || "").trim().toLowerCase() ===
          normalized_text.toLowerCase(),
      );
      if (!already_exists) {
        next_actions.push({
          id: `${Date.now()}-${category_key}-${cause_index}-${Math.random().toString(36).slice(2, 6)}`,
          categoria: category_label,
          causaPotencial: normalized_text,
          accion: "",
          responsable: "",
          fechaLimite: "",
          estatus: "Pendiente",
          esCausaRaiz: "Pendiente",
        });
        added_count++;
      }
    });
  });

  return { next_actions, added_count };
}
