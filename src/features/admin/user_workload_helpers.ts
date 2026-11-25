/**
 * @fileoverview Pure workload calculation helpers and role filter tab definitions for user administration.
 */

import { get_rda_status } from "@/features/rda/utils/rda_status";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import type { UserProfile, UserRole } from "@/features/auth/auth_context";

/** Per-user count of active projects and open assigned actions. */
export interface UserWorkloadSummary {
  activePdcas: number;
  activeRdas: number;
  pendingActions: number;
}

/** Category tabs displayed above the registered users table. */
export const ROLE_FILTER_TABS: {
  id: "all" | UserRole;
  label: string;
  badgeClass: string;
}[] = [
  {
    id: "all",
    label: "Todos",
    badgeClass: "border-border bg-secondary/60 text-foreground",
  },
  {
    id: "admin",
    label: "Administradores",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "area_lead",
    label: "Líderes de Área",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    id: "user",
    label: "Usuarios Generales",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    id: "intern",
    label: "Becarios / Practicantes",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    id: "viewer",
    label: "Auditores / Visores",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
];

/** Matches a user profile against legacy free-text assignee/author identifiers or emails. */
export function user_matches_identifier(
  user_profile: UserProfile,
  candidate_name?: string,
  candidate_email?: string,
): boolean {
  const user_name = (user_profile.name || "").trim().toLowerCase();
  const user_email = (user_profile.email || "").trim().toLowerCase();
  const target_name = (candidate_name || "").trim().toLowerCase();
  const target_email = (candidate_email || "").trim().toLowerCase();

  if (user_email && target_email && user_email === target_email) {
    return true;
  }
  if (!user_name || !target_name) {
    return false;
  }
  if (user_name === target_name) {
    return true;
  }

  const name_tokens = target_name
    .split(/[,;/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  return name_tokens.some(
    (token) => token === user_name || user_name.includes(token) || token.includes(user_name),
  );
}

/** Aggregates active PDCAs, open RDAs, and pending action counts across all directory users in memory. */
export function compute_workload_by_uid(
  merged_users: UserProfile[],
  all_pdcas: Pdca[],
  all_rdas: Rda[],
): Record<string, UserWorkloadSummary> {
  const workload_map: Record<string, UserWorkloadSummary> = {};

  for (const user_profile of merged_users) {
    let active_pdcas = 0;
    let active_rdas = 0;
    let pending_actions = 0;

    for (const pdca_entry of all_pdcas) {
      const is_closed = pdca_entry.fase === "Act" && pdca_entry.progreso === 100;
      const is_member =
        user_matches_identifier(user_profile, pdca_entry.autor, pdca_entry.autorEmail) ||
        (pdca_entry.asignados || []).some((assignee) =>
          user_matches_identifier(user_profile, assignee.name, assignee.email),
        );

      if (!is_closed && is_member) {
        active_pdcas += 1;
      }

      for (const action_entry of pdca_entry.acciones || []) {
        if (
          action_entry.status !== "Completada" &&
          user_matches_identifier(user_profile, action_entry.who || action_entry.responsable)
        ) {
          pending_actions += 1;
        }
      }
    }

    for (const rda_entry of all_rdas) {
      const rda_status = get_rda_status(rda_entry);
      const is_member =
        user_matches_identifier(
          user_profile,
          rda_entry.portada?.autorOriginal,
          rda_entry.portada?.autorEmail,
        ) ||
        user_matches_identifier(user_profile, rda_entry.context?.responsable) ||
        (rda_entry.portada?.usuariosAsignados || []).some((member_name) =>
          user_matches_identifier(user_profile, member_name),
        );

      if (rda_status === "Abierto" && is_member) {
        active_rdas += 1;
      }

      for (const validation_action of rda_entry.validationActions || []) {
        if (
          validation_action.estatus !== "Completa" &&
          user_matches_identifier(user_profile, validation_action.responsable)
        ) {
          pending_actions += 1;
        }
      }
      for (const pda_action of rda_entry.pda || []) {
        if (
          pda_action.status !== "Completada" &&
          user_matches_identifier(user_profile, pda_action.who || pda_action.responsable)
        ) {
          pending_actions += 1;
        }
      }
    }

    workload_map[user_profile.uid] = {
      activePdcas: active_pdcas,
      activeRdas: active_rdas,
      pendingActions: pending_actions,
    };
  }

  return workload_map;
}
