/**
 * @fileoverview Four-column PDCA Kanban board view grouped by Plan, Do, Check, and Act phases.
 */

import type { Pdca, Phase } from "@/domain/pdca";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { PdcaKanbanCard } from "./pdca_kanban_card";
import type { TogglePdcaUserHandler } from "./pdca_table_actions";

const KANBAN_PHASES: { phase: Phase; label: string; accent: string; badge_bg: string }[] = [
  {
    phase: "Plan",
    label: "Plan (Planificar)",
    accent: "border-t-blue-500",
    badge_bg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    phase: "Do",
    label: "Do (Hacer)",
    accent: "border-t-amber-500",
    badge_bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    phase: "Check",
    label: "Check (Verificar)",
    accent: "border-t-purple-500",
    badge_bg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    phase: "Act",
    label: "Act (Actuar)",
    accent: "border-t-emerald-500",
    badge_bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
];

interface PdcaKanbanBoardProps {
  rows: Pdca[];
  current_user: UserProfile | null;
  user_permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_select_pdca: (id: string) => void;
  on_toggle_pdca_user: TogglePdcaUserHandler;
}

/** Renders PDCA cards grouped into columns by current phase with inline responsible editing. */
export function PdcaKanbanBoard({
  rows,
  current_user,
  user_permissions,
  available_users,
  resolve_user,
  on_select_pdca,
  on_toggle_pdca_user,
}: PdcaKanbanBoardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pt-1">
      {KANBAN_PHASES.map((column) => {
        const column_items = rows.filter((pdca_entry) => pdca_entry.fase === column.phase);
        return (
          <div
            key={column.phase}
            className={`flex flex-col rounded-xl border border-border bg-secondary/20 border-t-4 ${column.accent} min-h-[380px] max-h-[650px]`}
          >
            <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-2.5 bg-card/60">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {column.label}
              </span>
              <span
                className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${column.badge_bg}`}
              >
                {column_items.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {column_items.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Sin PDCAs en fase {column.phase}
                </div>
              ) : (
                column_items.map((pdca_entry) => (
                  <PdcaKanbanCard
                    key={pdca_entry.id}
                    pdca_entry={pdca_entry}
                    current_user={current_user}
                    user_permissions={user_permissions}
                    available_users={available_users}
                    resolve_user={resolve_user}
                    on_select_pdca={on_select_pdca}
                    on_toggle_pdca_user={on_toggle_pdca_user}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
