/**
 * @fileoverview Pure initialization, localStorage draft recovery, and phase-completion helpers for RdaDialog.
 */

import type { Rda } from "@/domain/models/rda";
import { normalize_rda_name } from "../utils/rda_name";
import { get_rda_status, is_rda_phase_complete, RDA_PHASE_STEP_IDS } from "../utils/rda_status";
import { RDA_PHASES, type RdaPhase } from "./rda_dialog_helpers";

export interface RecoverableRdaDraft {
  rda: Rda;
  savedAt: string;
}

const DRAFT_KEY_PREFIX = "maz_hub_rda_draft_";

/** Normalizes initial RDA record and backfills legacy status into `completedPhases` if needed. */
export function normalize_initial_rda(raw_rda: Rda): Rda {
  const normalized = normalize_rda_name({ ...raw_rda });
  const has_phase_or_step_data =
    (normalized.completedPhases && normalized.completedPhases.length > 0) ||
    (normalized.completedSteps && normalized.completedSteps.length > 0) ||
    (normalized.naSteps && normalized.naSteps.length > 0);

  if (!has_phase_or_step_data) {
    if (normalized.status === "Evaluado") {
      normalized.completedPhases = RDA_PHASES.map((phase_item) => phase_item.id);
    } else if (normalized.status === "Cerrado") {
      normalized.completedPhases = [
        "1. Resumen",
        "2. Descripción del Problema",
        "3. Análisis de Causas Raíz",
      ];
    }
  }
  return normalized;
}

/** Reads an unsynced localStorage RDA draft if newer/different from `initial_json`. */
export function load_recoverable_rda_draft(
  rda_id: string,
  initial_json: string,
): RecoverableRdaDraft | null {
  try {
    const raw_draft = localStorage.getItem(`${DRAFT_KEY_PREFIX}${rda_id}`);
    if (!raw_draft) return null;
    const parsed = JSON.parse(raw_draft) as { rda?: Rda; savedAt?: string };
    if (parsed?.rda && parsed?.savedAt && JSON.stringify(parsed.rda) !== initial_json) {
      return { rda: parsed.rda, savedAt: parsed.savedAt };
    }
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${rda_id}`);
    return null;
  } catch {
    return null;
  }
}

/** Stores a dirty RDA snapshot into localStorage as an offline safety net. */
export function save_rda_local_draft(rda_record: Rda): void {
  try {
    localStorage.setItem(
      `${DRAFT_KEY_PREFIX}${rda_record.id}`,
      JSON.stringify({ rda: rda_record, savedAt: new Date().toISOString() }),
    );
  } catch {
    // Ignore storage quota restrictions
  }
}

/** Deletes any persisted localStorage draft once Firestore sync succeeds or is discarded. */
export function clear_rda_local_draft(rda_id: string): void {
  try {
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${rda_id}`);
  } catch {
    // Ignore storage restrictions
  }
}

/** Checks whether the local saved response differs in media URLs or generated folio and needs state adoption. */
export function should_adopt_saved_rda_state(
  snapshot: Rda,
  snapshot_json: string,
  saved_rda: Rda,
): boolean {
  return (
    snapshot_json.includes('"data:') ||
    (!snapshot.context?.folio && Boolean(saved_rda.context?.folio))
  );
}

/** Toggles completion status for an entire RDA phase and updates its overall lifecycle status. */
export function compute_next_phase_complete_rda(
  previous_rda: Rda,
  phase_id: RdaPhase,
  phase_number: 1 | 2 | 3 | 4 | 5,
): Rda {
  const completed_phases = previous_rda.completedPhases || [];
  const currently_complete = is_rda_phase_complete(previous_rda, phase_number);
  const phase_step_ids = new Set(RDA_PHASE_STEP_IDS[phase_number]);

  const next_rda: Rda = currently_complete
    ? {
        ...previous_rda,
        completedPhases: completed_phases.filter((existing_id) => existing_id !== phase_id),
        completedSteps: (previous_rda.completedSteps || []).filter(
          (step_id) => !phase_step_ids.has(step_id),
        ),
        naSteps: (previous_rda.naSteps || []).filter((step_id) => !phase_step_ids.has(step_id)),
      }
    : {
        ...previous_rda,
        completedPhases: completed_phases.includes(phase_id)
          ? completed_phases
          : [...completed_phases, phase_id],
      };

  return { ...next_rda, status: get_rda_status(next_rda, { ignoreLegacyStatus: true }) };
}
