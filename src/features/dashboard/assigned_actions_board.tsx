/**
 * @fileoverview Unified PDCA + RDA actions table with 1-click navigation and urgency filters.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import { AssignedActionsFilters } from "./assigned_actions_filters";
import { collect_unified_actions, type UnifiedActionItem } from "./assigned_actions_helpers";
import { AssignedActionsRow } from "./assigned_actions_row";

export type { UnifiedActionItem };

interface AssignedActionsBoardProps {
  pdcas: Pdca[];
  rdas: Rda[];
  currentUserName?: string | undefined;
  currentUserEmail?: string | undefined;
}

/** Consolidates pending and completed actions across PDCA and RDA tools on `/dashboard`. */
export function AssignedActionsBoard({
  pdcas,
  rdas,
  currentUserName = "",
  currentUserEmail = "",
}: AssignedActionsBoardProps) {
  const navigate = useNavigate();
  const [scope_filter, set_scope_filter] = useState<"mine" | "all">("all");
  const [module_filter, set_module_filter] = useState<"ALL" | "PDCA" | "RDA">("ALL");
  const [status_filter, set_status_filter] = useState<
    "pending" | "overdue" | "soon" | "completed"
  >("pending");

  const all_actions = useMemo(() => collect_unified_actions(pdcas, rdas), [pdcas, rdas]);

  const user_lower = currentUserName.trim().toLowerCase();
  const email_lower = currentUserEmail.trim().toLowerCase();

  const is_owned_by_current_user = (owner_label: string) => {
    const normalized_owner = owner_label.toLowerCase();
    return (
      (Boolean(user_lower) && normalized_owner.includes(user_lower)) ||
      (Boolean(email_lower) && normalized_owner.includes(email_lower))
    );
  };

  const filtered_actions = useMemo(
    () =>
      all_actions.filter((action_item) => {
        if (scope_filter === "mine" && !is_owned_by_current_user(action_item.owner)) return false;
        if (module_filter !== "ALL" && action_item.module !== module_filter) return false;
        if (status_filter === "pending" && action_item.done) return false;
        if (status_filter === "overdue" && action_item.urgency !== "overdue") return false;
        if (status_filter === "soon" && action_item.urgency !== "soon") return false;
        if (status_filter === "completed" && !action_item.done) return false;
        return true;
      }),
    [all_actions, scope_filter, module_filter, status_filter, user_lower, email_lower],
  );

  const counts = useMemo(() => {
    const scoped_list =
      scope_filter === "mine"
        ? all_actions.filter((entry) => is_owned_by_current_user(entry.owner))
        : all_actions;
    return {
      overdue: scoped_list.filter((entry) => entry.urgency === "overdue").length,
      soon: scoped_list.filter((entry) => entry.urgency === "soon").length,
      pending: scoped_list.filter((entry) => !entry.done).length,
      completed: scoped_list.filter((entry) => entry.done).length,
    };
  }, [all_actions, scope_filter, user_lower, email_lower]);

  const handle_open_project = (action_item: UnifiedActionItem) => {
    try {
      if (action_item.module === "RDA") {
        sessionStorage.setItem("maz_hub_open_rda_id", action_item.projectId);
        void navigate({ to: "/rda" });
      } else {
        sessionStorage.setItem("maz_hub_open_pdca_id", action_item.projectId);
        void navigate({ to: "/" });
      }
    } catch {
      // Ignore storage restrictions
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <AssignedActionsFilters
        scope_filter={scope_filter}
        set_scope_filter={set_scope_filter}
        module_filter={module_filter}
        set_module_filter={set_module_filter}
        status_filter={status_filter}
        set_status_filter={set_status_filter}
        counts={counts}
      />

      <div className="mt-4 overflow-x-auto">
        {filtered_actions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            No se encontraron acciones con los filtros seleccionados.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Módulo / Origen</th>
                <th className="py-2.5 px-3">Proyecto</th>
                <th className="py-2.5 px-3">Acción / Compromiso</th>
                <th className="py-2.5 px-3">Responsable</th>
                <th className="py-2.5 px-3">Fecha Límite</th>
                <th className="py-2.5 px-3">Semáforo</th>
                <th className="py-2.5 px-3 text-right">Ir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered_actions.slice(0, 12).map((action_item) => (
                <AssignedActionsRow
                  key={action_item.id}
                  action_item={action_item}
                  on_open_project={handle_open_project}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
