/**
 * @fileoverview Virtualized table row for a single PDCA project with inline deadline and permission controls.
 */

import type React from "react";
import { Lock, Trash2 } from "lucide-react";
import { PhaseBadge } from "@/features/pdca/components/pdca_badge";
import type { Pdca } from "@/domain/pdca";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import {
  can_user_access_pdca,
  can_user_delete_pdca,
  can_user_edit_pdca,
} from "@/shared/components/access_request";
import { ResponsibleAvatarStack, type ResponsibleInput } from "@/shared/components/responsible_profile";
import { Button } from "@/shared/ui/button";
import { TableCell, TableRow } from "@/shared/ui/table";
import { PdcaDeadlineCell } from "./pdca_deadline_cell";
import { get_computed_pdca_progress } from "./pdca_progress_helpers";
import { build_assignee_handlers, type TogglePdcaUserHandler } from "./pdca_table_actions";

interface PdcaVirtualTableRowProps {
  pdca_entry: Pdca;
  virtual_index: number;
  measure_element: (node: HTMLTableRowElement | null) => void;
  current_user: UserProfile | null;
  user_permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  is_deadline_picker_open: boolean;
  on_deadline_picker_open_change: (is_open: boolean) => void;
  on_select_pdca: (id: string) => void;
  on_request_delete: (click_event: React.MouseEvent, id: string) => void;
  on_deadline_change: (
    pdca_id: string,
    selected_date: Date | undefined,
    is_no_limit?: boolean,
  ) => Promise<void> | void;
  on_remove_deadline: (click_event: React.MouseEvent, pdca_id: string) => void;
  on_toggle_pdca_user: TogglePdcaUserHandler;
}

/** Renders a measured PDCA table row supporting inline assignees, deadlines, and access prompts. */
export function PdcaVirtualTableRow({
  pdca_entry,
  virtual_index,
  measure_element,
  current_user,
  user_permissions,
  available_users,
  resolve_user,
  is_deadline_picker_open,
  on_deadline_picker_open_change,
  on_select_pdca,
  on_request_delete,
  on_deadline_change,
  on_remove_deadline,
  on_toggle_pdca_user,
}: PdcaVirtualTableRowProps) {
  const has_access = can_user_access_pdca(pdca_entry, current_user, user_permissions);
  const can_edit = can_user_edit_pdca(pdca_entry, current_user, user_permissions);
  const allow_assign = user_permissions.canManageAssignment && has_access && can_edit;
  const progress_pct = get_computed_pdca_progress(pdca_entry);
  const assignee_handlers = build_assignee_handlers(pdca_entry, allow_assign, on_toggle_pdca_user);

  return (
    <TableRow
      ref={measure_element}
      data-index={virtual_index}
      className="cursor-pointer transition-colors hover:bg-secondary/30"
      onClick={() => on_select_pdca(pdca_entry.id)}
    >
      <TableCell>
        <span className="flex items-center gap-1.5 font-semibold">
          {!has_access && (
            <span title="Sin acceso directo: haz clic para solicitar permiso">
              <Lock className="size-3.5 text-amber-500 shrink-0" />
            </span>
          )}
          <span>{pdca_entry.titulo}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {pdca_entry.id}
          <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-secondary sm:block">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${progress_pct}%` }}
            />
          </span>
          <span className="hidden sm:inline">{progress_pct}%</span>
        </span>
      </TableCell>
      <TableCell onClick={(click_event) => click_event.stopPropagation()}>
        <ResponsibleAvatarStack
          size="md"
          maxVisible={5}
          assignedUsers={(pdca_entry.asignados || []).map((person) => resolve_user(person))}
          availableUsers={available_users}
          resolveUser={resolve_user}
          {...assignee_handlers}
        />
      </TableCell>
      <TableCell className="hidden sm:table-cell text-xs">
        <span className="font-medium text-foreground block">{pdca_entry.autor || "Sin autor"}</span>
        {pdca_entry.autorEmail && (
          <span className="text-[11px] text-muted-foreground block">{pdca_entry.autorEmail}</span>
        )}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
        {pdca_entry.area}
      </TableCell>
      <TableCell>
        <PhaseBadge phase={pdca_entry.fase} />
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
        <PdcaDeadlineCell
          pdca_entry={pdca_entry}
          can_edit_deadline={allow_assign}
          is_picker_open={is_deadline_picker_open}
          on_picker_open_change={on_deadline_picker_open_change}
          on_select_deadline={async (selected_date, is_no_limit) => {
            await on_deadline_change(pdca_entry.id, selected_date, is_no_limit);
            on_deadline_picker_open_change(false);
          }}
          on_remove_deadline={(click_event) => on_remove_deadline(click_event, pdca_entry.id)}
        />
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
        <span className="inline-flex items-center gap-1.5 text-xs">{pdca_entry.actualizado}</span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center gap-1">
          {has_access ? (
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              Abrir
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-semibold gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Lock className="size-3" /> Solicitar permiso
            </Button>
          )}
          {can_user_delete_pdca(pdca_entry, current_user) && has_access && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              onClick={(click_event) => on_request_delete(click_event, pdca_entry.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
