/**
 * @fileoverview Single tabular row for an RDA record in `/rda`.
 */

import { Lock, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Rda } from "@/domain/models/rda";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import {
  type AccessRequestTarget,
  build_rda_access_target,
  can_user_access_rda,
  can_user_delete_rda,
  can_user_edit_rda,
} from "@/shared/components/access_request";
import { ResponsibleAvatarStack, type ResponsibleInput } from "@/shared/components/responsible_profile";
import { Button } from "@/shared/ui/button";
import { TableCell, TableRow } from "@/shared/ui/table";
import { get_rda_display_name } from "../utils/rda_name";
import { get_rda_status } from "../utils/rda_status";
import { get_rda_responsibles_list } from "./rda_bank_helpers";

interface RdaTableRowProps {
  rda_record: Rda;
  current_user: UserProfile | null;
  permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_edit_rda: (rda_record: Rda) => void;
  on_request_access: (target: AccessRequestTarget) => void;
  on_request_delete: (rda_record: Rda) => void;
  on_toggle_responsible: (rda_record: Rda, person_name: string) => Promise<void>;
}

const RDA_STATUS_BADGE_MAP: Record<"Abierto" | "Cerrado" | "Evaluado", string> = {
  Evaluado:
    "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  Cerrado:
    "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  Abierto:
    "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
};

function format_locale_date(raw_date?: string): string {
  if (!raw_date) return "-";
  const parsed_date = new Date(raw_date);
  if (Number.isNaN(parsed_date.getTime())) return raw_date;
  return parsed_date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Renders one row in the RDA bank table with inline assignee controls and access prompts. */
export function RdaTableRow({
  rda_record,
  current_user,
  permissions,
  available_users,
  resolve_user,
  on_edit_rda,
  on_request_access,
  on_request_delete,
  on_toggle_responsible,
}: RdaTableRowProps) {
  const { t } = useTranslation();
  const has_access = can_user_access_rda(rda_record, current_user, permissions);
  const rda_status = get_rda_status(rda_record);
  const allow_assign =
    permissions.canManageAssignment &&
    has_access &&
    can_user_edit_rda(rda_record, current_user, permissions);

  const status_label =
    rda_status === "Evaluado"
      ? t("evaluatedStatus", "Evaluado")
      : rda_status === "Cerrado"
        ? t("closedStatus", "Cerrado")
        : t("openStatus", "Abierto");

  return (
    <TableRow
      className={`cursor-pointer transition-colors hover:bg-secondary/30 text-sm ${
        !has_access ? "opacity-90" : ""
      }`}
      onClick={() => on_edit_rda(rda_record)}
    >
      <TableCell className="font-semibold">
        <span className="inline-flex items-center gap-1.5">
          {!has_access && (
            <Lock
              className="size-3.5 text-amber-500 shrink-0"
              aria-label="Sin permiso directo — clic para solicitar acceso"
            />
          )}
          {rda_record.context?.folio || "-"}
        </span>
      </TableCell>
      <TableCell className="font-medium">{get_rda_display_name(rda_record)}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${RDA_STATUS_BADGE_MAP[rda_status]}`}
        >
          {status_label}
        </span>
      </TableCell>
      <TableCell>{rda_record.context.planta}</TableCell>
      <TableCell onClick={(click_event) => click_event.stopPropagation()}>
        <ResponsibleAvatarStack
          size="md"
          maxVisible={5}
          assignedUsers={get_rda_responsibles_list(rda_record).map((person) =>
            resolve_user(person),
          )}
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
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium uppercase text-foreground">
            {rda_record.portada?.autorOriginal || "-"}
          </span>
          {rda_record.portada?.autorEmail && (
            <span className="text-[11px] text-muted-foreground">
              {rda_record.portada.autorEmail}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{format_locale_date(rda_record.portada?.fechaLimite)}</TableCell>
      <TableCell>{format_locale_date(rda_record.updatedAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {has_access ? (
            <Button
              variant="link"
              className="text-primary h-8 px-2 font-semibold"
              onClick={(click_event) => {
                click_event.stopPropagation();
                on_edit_rda(rda_record);
              }}
            >
              {t("rdaTable.openAction")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
              onClick={(click_event) => {
                click_event.stopPropagation();
                on_request_access(build_rda_access_target(rda_record));
              }}
            >
              <Lock className="size-3" />
              Solicitar permiso
            </Button>
          )}
          {can_user_delete_rda(rda_record, current_user) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(click_event) => {
                click_event.stopPropagation();
                on_request_delete(rda_record);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
