/**
 * @fileoverview Admin user creation form delegating isolated provisioning to `adminCreateUser`.
 */

import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { AdminInternDurationField } from "./admin_intern_duration_field";
import { AdminPermissionsMatrix } from "./admin_permissions_matrix";
import { AdminRegistrationFields } from "./admin_registration_fields";
import type { UserRole } from "./auth_types";
import { ROLE_LABELS } from "./role_permissions";
import { useAdminRegistration } from "./use_admin_registration";

/**
 * Administrative panel card for onboarding new corporate accounts with role/permission assignment.
 */
export function RegistrationForm() {
  const {
    user_name,
    set_user_name,
    user_email,
    set_user_email,
    user_password,
    set_user_password,
    show_password,
    set_show_password,
    user_role,
    handle_role_select,
    active_days,
    set_active_days,
    user_area,
    set_user_area,
    user_position,
    set_user_position,
    custom_permissions,
    show_custom_perms,
    set_show_custom_perms,
    is_loading,
    error_message,
    success_message,
    handle_toggle_permission,
    handle_reset_permissions,
    handle_submit,
  } = useAdminRegistration();

  return (
    <div className="lg:col-span-1 space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] h-fit">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Registrar Usuario</h2>
          <p className="text-xs text-muted-foreground">Alta de cuenta y asignación de permisos</p>
        </div>
      </div>

      <form
        onSubmit={(submit_event) => void handle_submit(submit_event)}
        className="space-y-4"
        noValidate
      >
        {error_message && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{error_message}</p>
          </div>
        )}
        {success_message && (
          <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
            <p>{success_message}</p>
          </div>
        )}

        <AdminRegistrationFields
          user_name={user_name}
          set_user_name={set_user_name}
          user_email={user_email}
          set_user_email={set_user_email}
          user_password={user_password}
          set_user_password={set_user_password}
          show_password={show_password}
          on_toggle_password={() => set_show_password((visible) => !visible)}
          user_role={user_role}
          user_area={user_area}
          set_user_area={set_user_area}
          user_position={user_position}
          set_user_position={set_user_position}
        />

        <div className="space-y-2">
          <Label className="text-xs font-semibold">ROL DEL SISTEMA</Label>
          <Select
            value={user_role}
            onValueChange={(selected) => handle_role_select(selected as UserRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["admin", "area_lead", "user", "intern", "viewer"] as const).map((role_option) => (
                <SelectItem key={role_option} value={role_option}>
                  {ROLE_LABELS[role_option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user_role === "intern" && (
            <AdminInternDurationField active_days={active_days} set_active_days={set_active_days} />
          )}

          <AdminPermissionsMatrix
            user_role={user_role}
            custom_permissions={custom_permissions}
            show_custom_perms={show_custom_perms}
            on_toggle_custom_panel={() => set_show_custom_perms((visible) => !visible)}
            on_reset_permissions={handle_reset_permissions}
            on_toggle_permission={handle_toggle_permission}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-brand-dark mt-2"
          disabled={is_loading}
        >
          {is_loading ? "Registrando..." : "Crear Cuenta"}
        </Button>
      </form>
    </div>
  );
}
