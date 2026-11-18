/**
 * @fileoverview Three-column Kanban board grouping RDA records by Abierto, Cerrado, and Evaluado status.
 */

import type { Rda } from "@/domain/models/rda";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { get_rda_status } from "../utils/rda_status";
import { RDA_KANBAN_COLUMNS } from "./rda_bank_helpers";
import { RdaKanbanCard } from "./rda_kanban_card";

interface RdaKanbanBoardProps {
  filtered_rdas: Rda[];
  current_user: UserProfile | null;
  permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_edit_rda: (rda_record: Rda) => void;
  on_toggle_responsible: (rda_record: Rda, person_name: string) => Promise<void>;
}

/** Displays RDA cards grouped into scrollable phase columns. */
export function RdaKanbanBoard({
  filtered_rdas,
  current_user,
  permissions,
  available_users,
  resolve_user,
  on_edit_rda,
  on_toggle_responsible,
}: RdaKanbanBoardProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {RDA_KANBAN_COLUMNS.map((column) => {
        const column_items = filtered_rdas.filter(
          (rda_record) => get_rda_status(rda_record) === column.status,
        );
        return (
          <div
            key={column.status}
            className={`flex flex-col rounded-xl border border-border bg-card/60 border-t-4 ${column.accent} min-h-[420px] max-h-[680px] shadow-[var(--shadow-card)]`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/40">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {column.label}
              </span>
              <span
                className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${column.badge_bg}`}
              >
                {column_items.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {column_items.length === 0 ? (
                <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Sin RDAs en estatus {column.status}
                </div>
              ) : (
                column_items.map((rda_record) => (
                  <RdaKanbanCard
                    key={rda_record.id}
                    rda_record={rda_record}
                    current_user={current_user}
                    permissions={permissions}
                    available_users={available_users}
                    resolve_user={resolve_user}
                    on_edit_rda={on_edit_rda}
                    on_toggle_responsible={on_toggle_responsible}
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
