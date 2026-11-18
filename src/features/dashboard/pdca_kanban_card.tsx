/**
 * @fileoverview Single PDCA card component rendered inside a Kanban phase column.
 */

import { CalendarClock, Lock } from "lucide-react";
import type { Pdca } from "@/domain/pdca";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import { can_user_access_pdca, can_user_edit_pdca } from "@/shared/components/access_request";
import { ResponsibleAvatarStack, type ResponsibleInput } from "@/shared/components/responsible_profile";
import {
  get_computed_pdca_progress,
  is_pdca_deadline_expired,
  parse_pdca_deadline,
} from "./pdca_progress_helpers";
import { build_assignee_handlers, type TogglePdcaUserHandler } from "./pdca_table_actions";

interface PdcaKanbanCardProps {
  pdca_entry: Pdca;
  current_user: UserProfile | null;
  user_permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_select_pdca: (id: string) => void;
  on_toggle_pdca_user: TogglePdcaUserHandler;
}

/** Displays a PDCA project card with methodological progress, assignees, and deadline status. */
export function PdcaKanbanCard({
  pdca_entry,
  current_user,
  user_permissions,
  available_users,
  resolve_user,
  on_select_pdca,
  on_toggle_pdca_user,
}: PdcaKanbanCardProps) {
  const has_access = can_user_access_pdca(pdca_entry, current_user, user_permissions);
  const can_edit = can_user_edit_pdca(pdca_entry, current_user, user_permissions);
  const progress_pct = get_computed_pdca_progress(pdca_entry);
  const { deadline_text, deadline_date } = parse_pdca_deadline(pdca_entry.fechaFinalizacion);
  const is_expired = is_pdca_deadline_expired(deadline_date, pdca_entry.fase, progress_pct);
  const allow_assign = user_permissions.canManageAssignment && has_access && can_edit;
  const assignee_handlers = build_assignee_handlers(pdca_entry, allow_assign, on_toggle_pdca_user);

  return (
    <div
      onClick={() => on_select_pdca(pdca_entry.id)}
      className="group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-muted-foreground">
          {!has_access && <Lock className="size-3 text-amber-500" />}
          {pdca_entry.id}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[130px]">
          {pdca_entry.area}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {pdca_entry.titulo}
      </p>

      {!has_access && (
        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
          <Lock className="size-2.5" /> Solicitar permiso
        </span>
      )}

      <div className="mt-2.5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Avance metodológico</span>
          <span className="font-bold text-foreground">{progress_pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress_pct}%` }}
          />
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2"
        onClick={(click_event) => click_event.stopPropagation()}
      >
        <ResponsibleAvatarStack
          size="sm"
          maxVisible={4}
          assignedUsers={(pdca_entry.asignados || []).map((person) => resolve_user(person))}
          availableUsers={available_users}
          resolveUser={resolve_user}
          {...assignee_handlers}
        />

        {deadline_text && (
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${
              is_expired
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <CalendarClock className="size-2.5" />
            {deadline_text}
          </span>
        )}
      </div>
    </div>
  );
}
