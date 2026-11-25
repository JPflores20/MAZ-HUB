/**
 * @fileoverview Pure helpers for formatting PDCA/RDA deadlines and computing header workload statistics.
 */

import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import type { UserWorkloadStats } from "./layout_types";

function is_valid_date(candidate: Date | undefined): candidate is Date {
  return candidate instanceof Date && !Number.isNaN(candidate.getTime());
}

/**
 * Formats a selected PDCA target date into `dd/MM/yyyy` or `"Sin límite"`.
 *
 * @param {Date | undefined} selected_date - Chosen calendar date.
 * @param {boolean} is_no_limit - True when admin explicitly clears time bounds.
 * @returns {string} Formatted deadline string for Firestore persistence.
 */
export function format_pdca_deadline_value(
  selected_date: Date | undefined,
  is_no_limit: boolean,
): string {
  if (is_no_limit) {
    return "Sin límite";
  }
  if (is_valid_date(selected_date)) {
    const day = String(selected_date.getDate()).padStart(2, "0");
    const month = String(selected_date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${selected_date.getFullYear()}`;
  }
  return "";
}

/**
 * Formats a selected RDA deadline into an ISO timestamp string or `"Sin límite"`.
 *
 * @param {Date | undefined} selected_date - Chosen calendar date.
 * @param {boolean} is_no_limit - True when admin explicitly clears time bounds.
 * @returns {string} ISO string or `"Sin límite"` value.
 */
export function format_rda_deadline_value(
  selected_date: Date | undefined,
  is_no_limit: boolean,
): string {
  if (is_no_limit) {
    return "Sin límite";
  }
  if (is_valid_date(selected_date)) {
    return selected_date.toISOString();
  }
  return "";
}

/**
 * Computes active PDCA/RDA counts and open action totals for the signed-in user.
 *
 * @param {Pdca[]} pdca_list - Visible PDCA records.
 * @param {Rda[]} rda_list - Visible RDA records.
 * @returns {UserWorkloadStats} Active project and pending action totals.
 */
export function compute_user_workload_stats(pdca_list: Pdca[], rda_list: Rda[]): UserWorkloadStats {
  const active_pdcas = pdca_list.filter((pdca_entry) => pdca_entry.fase !== "Act").length;
  const active_rdas = rda_list.filter(
    (rda_entry) => rda_entry.status !== "Cerrado" && rda_entry.status !== "Evaluado",
  ).length;
  const pending_pdca_actions = pdca_list
    .flatMap((pdca_entry) => pdca_entry.acciones || [])
    .filter((action_entry) => !action_entry.done && action_entry.status !== "Completada").length;
  const pending_rda_actions = rda_list
    .flatMap((rda_entry) => rda_entry.pda || [])
    .filter((action_entry) => !action_entry.done && action_entry.status !== "Completada").length;

  return {
    activePdcas: active_pdcas,
    activeRdas: active_rdas,
    pendingActions: pending_pdca_actions + pending_rda_actions,
  };
}
