/**
 * @fileoverview Table row displaying a single user's verification status, workload, role/permissions, and admin actions.
 */

import { CheckCircle2, Clock, ZoomIn } from "lucide-react";
import type { UserPermissions, UserProfile, UserRole } from "@/features/auth/auth_context";
import { TableCell, TableRow } from "@/shared/ui/table";
import { AdminUserPermissionsPopover } from "./admin_user_permissions_popover";
import { AdminUserRowActions } from "./admin_user_row_actions";
import { AdminUserWorkloadBadges } from "./admin_user_workload_badges";
import type { UserWorkloadSummary } from "./user_workload_helpers";

interface AdminUserRowProps {
  user_profile: UserProfile;
  workload: UserWorkloadSummary;
  is_sending_link: boolean;
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
  on_edit_user: (uid: string) => void;
  on_delete_user: (uid: string, name: string) => Promise<void>;
}

/** Renders one row in the administrative user directory table. */
export function AdminUserRow({
  user_profile,
  workload,
  is_sending_link,
  on_open_photo,
  on_role_change,
  on_permission_toggle,
  on_reset_permissions,
  on_send_verification_link,
  on_approve_user,
  on_edit_user,
  on_delete_user,
}: AdminUserRowProps) {
  const is_email_pending = user_profile.emailVerified !== true;
  const is_approval_pending = user_profile.approved !== true;

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
          on_role_change={on_role_change}
          on_permission_toggle={on_permission_toggle}
          on_reset_permissions={on_reset_permissions}
        />
      </TableCell>

      <TableCell className="text-center">
        <AdminUserRowActions
          user_profile={user_profile}
          is_sending_link={is_sending_link}
          is_approval_pending={is_approval_pending}
          on_send_verification_link={on_send_verification_link}
          on_approve_user={on_approve_user}
          on_edit_user={on_edit_user}
          on_delete_user={on_delete_user}
        />
      </TableCell>
    </TableRow>
  );
}
