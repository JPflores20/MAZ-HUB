/**
 * @fileoverview Interactive permission checkbox selector for customizable RBAC role presets.
 */

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import type { UserPermissions, UserRole } from "./auth_types";
import { PERMISSION_METADATA, ROLE_DESCRIPTIONS } from "./role_permissions";

interface AdminPermissionsMatrixProps {
  user_role: UserRole;
  custom_permissions: UserPermissions;
  show_custom_perms: boolean;
  on_toggle_custom_panel: () => void;
  on_reset_permissions: () => void;
  on_toggle_permission: (
    permission_key: keyof Omit<UserPermissions, "canManageUsers">,
    checked: boolean,
  ) => void;
}

/**
 * Renders the role summary card and optional granular permission checkboxes.
 */
export function AdminPermissionsMatrix({
  user_role,
  custom_permissions,
  show_custom_perms,
  on_toggle_custom_panel,
  on_reset_permissions,
  on_toggle_permission,
}: AdminPermissionsMatrixProps) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {ROLE_DESCRIPTIONS[user_role]}
      </p>

      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <button
          type="button"
          onClick={on_toggle_custom_panel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <SlidersHorizontal className="size-3.5" />
          {show_custom_perms ? "Ocultar casillas de permisos" : "Personalizar permisos"}
        </button>

        {show_custom_perms && (
          <button
            type="button"
            onClick={on_reset_permissions}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Restablecer
          </button>
        )}
      </div>

      {show_custom_perms && (
        <div className="space-y-2 pt-1.5">
          {PERMISSION_METADATA.map((permission_meta) => (
            <label
              key={permission_meta.key}
              className="flex items-start gap-2.5 rounded-md border border-border/60 bg-card p-2 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <Checkbox
                checked={Boolean(custom_permissions[permission_meta.key])}
                onCheckedChange={(checked_state) =>
                  on_toggle_permission(permission_meta.key, Boolean(checked_state))
                }
                className="mt-0.5"
              />
              <div className="leading-tight">
                <span className="block text-xs font-semibold text-foreground">
                  {permission_meta.label}
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  {permission_meta.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
