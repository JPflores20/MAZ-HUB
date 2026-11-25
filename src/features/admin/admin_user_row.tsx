/**
 * @fileoverview Table row displaying a single user's verification status, workload, role/permissions, and admin actions.
 */

import { CalendarClock, CheckCircle2, Clock, ShieldAlert, ZoomIn } from "lucide-react";
import type { UserPermissions, UserProfile, UserRole } from "@/features/auth/auth_context";
import {
  is_account_expired,
  is_corporate_email,
  is_temporary_intern_account,
} from "@/features/auth/email_validation";
import { TableCell, TableRow } from "@/shared/ui/table";
import { AdminUserPermissionsPopover } from "./admin_user_permissions_popover";
import { AdminUserRowActions } from "./admin_user_row_actions";
import { AdminUserWorkloadBadges } from "./admin_user_workload_badges";
import type { UserWorkloadSummary } from "./user_workload_helpers";

interface AdminUserRowProps {
  user_profile: UserProfile;
  workload: UserWorkloadSummary;
  is_sending_link: boolean;
  is_approving: boolean;
  on_open_photo: (user_profile: UserProfile) => void;
  on_role_change: (uid: string, next_role: UserRole) => Promise<void>;
  on_permission_toggle: (
    user_profile: UserProfile,
    permission_key: keyof Omit<UserPermissions, "canManageUsers">,
    is_checked: boolean,
  ) => Promise<void>;
  on_reset_permissions: (user_profile: UserProfile) => Promise<void>;
  on_send_verification_link: (user_profile: UserProfile) => Promise<void>;
  on_approve_user: (user_profile: UserProfile) => Promise<void>;
  on_extend_intern_days: (user_profile: UserProfile, active_days: number) => Promise<void>;
  on_edit_user: (uid: string) => void;
  on_delete_user: (uid: string, name: string) => Promise<void>;
}

function format_temp_expiry_label(user_profile: UserProfile): string | null {
  const exp_ms =
    typeof user_profile.expiresAtMs === "number"
      ? user_profile.expiresAtMs
      : user_profile.expiresAt
        ? Date.parse(user_profile.expiresAt)
        : NaN;
  if (!Number.isFinite(exp_ms)) return null;
  const formatted_date = new Date(exp_ms).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const remaining_days = Math.max(0, Math.ceil((exp_ms - Date.now()) / 86_400_000));
  return is_account_expired(user_profile)
    ? `Temporal expirado (${formatted_date})`
    : `Temporal · ${remaining_days}d restantes (vence ${formatted_date})`;
}

/** Renders one row in the administrative user directory table. */
export function AdminUserRow({
  user_profile,
  workload,
  is_sending_link,
  is_approving,
  on_open_photo,
  on_role_change,
  on_permission_toggle,
  on_reset_permissions,
  on_send_verification_link,
  on_approve_user,
  on_extend_intern_days,
  on_edit_user,
  on_delete_user,
}: AdminUserRowProps) {
  const is_corporate_account = is_corporate_email(user_profile.email);
  const is_temp_intern = is_temporary_intern_account(user_profile);
  const is_expired = is_account_expired(user_profile);
  const temp_expiry_label = is_temp_intern ? format_temp_expiry_label(user_profile) : null;
  const is_email_pending = user_profile.emailVerified !== true;
  const is_approval_pending = user_profile.approved !== true;
  const needs_admin_verification =
    is_corporate_account && (is_approval_pending || is_email_pending);

  return (
    <TableRow className="transition-colors hover:bg-secondary/30">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            title="Haz clic para expandir la foto"
            onClick={() => on_open_photo(user_profile)}
            className="group relative size-8 rounded-full overflow-hidden border border-primary/25 bg-primary/15 text-xs font-bold text-primary shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          >
            {user_profile.avatarUrl ? (
              <img
                src={user_profile.avatarUrl}
                alt={user_profile.name}
                className="size-full object-cover"
              />
            ) : (
              <span>{user_profile.name.charAt(0).toUpperCase()}</span>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="size-3" />
            </span>
          </button>
          <div className="min-w-0">
            <span className="block uppercase font-semibold text-xs truncate">
              {user_profile.name}
            </span>
            <span className="block text-[11px] text-muted-foreground truncate">
              {user_profile.email}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {is_email_pending ? (
                <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  <Clock className="size-2.5" /> Correo sin verificar
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-2.5" /> Correo verificado
                </span>
              )}
              {is_approval_pending ? (
                <span className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                  <Clock className="size-2.5" /> Pendiente aprobación
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-2.5" /> Aprobado
                </span>
              )}
              {!is_corporate_account && !is_temp_intern && (
                <span className="inline-flex items-center gap-1 rounded border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                  <ShieldAlert className="size-2.5" /> Dominio externo bloqueado
                </span>
              )}
              {is_temp_intern && temp_expiry_label && (
                <span
                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                    is_expired
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  }`}
                >
                  <CalendarClock className="size-2.5" /> {temp_expiry_label}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-muted-foreground">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground/90">{user_profile.area}</span>
          {user_profile.position && (
            <span className="text-[10px] text-muted-foreground uppercase">
              {user_profile.position}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <AdminUserWorkloadBadges workload={workload} />
      </TableCell>

      <TableCell>
        <AdminUserPermissionsPopover
          user_profile={user_profile}
          role_locked={!is_corporate_account && is_temp_intern}
          on_role_change={on_role_change}
          on_permission_toggle={on_permission_toggle}
          on_reset_permissions={on_reset_permissions}
        />
      </TableCell>

      <TableCell className="text-center">
        <AdminUserRowActions
          user_profile={user_profile}
          is_sending_link={is_sending_link}
          is_approving={is_approving}
          can_receive_link={is_corporate_account || is_temp_intern}
          needs_admin_verification={needs_admin_verification}
          can_extend_intern={user_profile.role === "intern"}
          on_send_verification_link={on_send_verification_link}
          on_approve_user={on_approve_user}
          on_extend_intern_days={on_extend_intern_days}
          on_edit_user={on_edit_user}
          on_delete_user={on_delete_user}
        />
      </TableCell>
    </TableRow>
  );
}
