/**
 * @fileoverview Single RDA project card rendered inside a Kanban status column.
 */

import { CalendarClock, Lock } from "lucide-react";
import type { Rda } from "@/domain/models/rda";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import { can_user_access_rda, can_user_edit_rda } from "@/shared/components/access_request";
import { ResponsibleAvatarStack, type ResponsibleInput } from "@/shared/components/responsible_profile";
import { get_rda_display_name } from "../utils/rda_name";
import { get_rda_responsibles_list } from "./rda_bank_helpers";

interface RdaKanbanCardProps {
  rda_record: Rda;
  current_user: UserProfile | null;
  permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_edit_rda: (rda_record: Rda) => void;
  on_toggle_responsible: (rda_record: Rda, person_name: string) => Promise<void>;
}

/** Displays folio, area, display title, action completion progress, assignees, and deadline. */
export function RdaKanbanCard({
  rda_record,
  current_user,
  permissions,
  available_users,
  resolve_user,
  on_edit_rda,
  on_toggle_responsible,
}: RdaKanbanCardProps) {
  const has_access = can_user_access_rda(rda_record, current_user, permissions);
  const assigned_list = get_rda_responsibles_list(rda_record);
  const raw_deadline = rda_record.portada?.fechaLimite;
  let formatted_deadline = "";
  if (raw_deadline) {
    const parsed_date = new Date(raw_deadline);
    formatted_deadline = Number.isNaN(parsed_date.getTime())
      ? raw_deadline
      : parsed_date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  const total_actions =
    (rda_record.validationActions?.length || 0) + (rda_record.pda?.length || 0);
  const completed_actions =
    (rda_record.validationActions?.filter((item) => item.estatus === "Completa").length || 0) +
    (rda_record.pda?.filter((item) => item.status === "Completada").length || 0);

  const allow_assign =
    permissions.canManageAssignment &&
    has_access &&
    can_user_edit_rda(rda_record, current_user, permissions);

  return (
    <div
      onClick={() => on_edit_rda(rda_record)}
      className={`group cursor-pointer rounded-lg border bg-card p-3.5 shadow-xs transition-all hover:shadow-md ${
        has_access
          ? "border-border hover:border-primary/50"
          : "border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
          {!has_access && <Lock className="size-3 text-amber-500" />}
          {rda_record.context?.folio || `#${rda_record.id.slice(-5)}`}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[140px]">
          {rda_record.context?.area ||
            rda_record.portada?.area ||
            rda_record.context?.planta ||
            "General"}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {get_rda_display_name(rda_record)}
      </p>

      {!has_access ? (
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
            <Lock className="size-2.5" />
            Solicitar permiso
          </span>
        </div>
      ) : (
        total_actions > 0 && (
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Acciones (Validación + PDA)</span>
              <span className="font-bold text-foreground">
                {completed_actions}/{total_actions}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round((completed_actions / total_actions) * 100)}%` }}
              />
            </div>
          </div>
        )
      )}

      <div
        className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2"
        onClick={(click_event) => click_event.stopPropagation()}
      >
        <ResponsibleAvatarStack
          size="sm"
          maxVisible={4}
          assignedUsers={assigned_list.map((person_name) => resolve_user(person_name))}
          availableUsers={available_users}
          resolveUser={resolve_user}
          onToggleUser={
            allow_assign
              ? (target_user) => void on_toggle_responsible(rda_record, target_user.name)
              : undefined
          }
          onRemoveUser={
            allow_assign
              ? (target_user) => void on_toggle_responsible(rda_record, target_user.name)
              : undefined
          }
          onAddCustomName={
            allow_assign
              ? (custom_name) => void on_toggle_responsible(rda_record, custom_name)
              : undefined
          }
        />

        {formatted_deadline && (
          <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
            <CalendarClock className="size-2.5" />
            {formatted_deadline}
          </span>
        )}
      </div>
    </div>
  );
}
