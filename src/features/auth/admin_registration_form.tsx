/**
 * @fileoverview Admin user creation form delegating isolated provisioning to `adminCreateUser`.
 */

import { AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { AdminPermissionsMatrix } from "./admin_permissions_matrix";
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

      <form onSubmit={(submit_event) => void handle_submit(submit_event)} className="space-y-4" noValidate>
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

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            NOMBRE COMPLETO *
          </Label>
          <Input
            id="name"
            required
            value={user_name}
            onChange={(change_event) => set_user_name(change_event.target.value)}
            placeholder="Ej. Roberto Torres"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            CORREO ELECTRÓNICO (OBLIGATORIO) *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={user_email}
            onChange={(change_event) => set_user_email(change_event.target.value)}
            placeholder="correo@gmodelo.com.mx o correo@ab-inbev.com"
          />
          <p className="text-[10px] text-muted-foreground">
            Debe terminar en <strong>@gmodelo.com.mx</strong> o <strong>@ab-inbev.com</strong>.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold">
            CONTRASEÑA TEMPORAL (OPCIONAL)
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={show_password ? "text" : "password"}
              value={user_password}
              onChange={(change_event) => set_user_password(change_event.target.value)}
              placeholder="Opcional: se enviará enlace para definir contraseña"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => set_show_password((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show_password ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-xs font-semibold">
              ÁREA / DEPARTAMENTO *
            </Label>
            <Input
              id="area"
              required
              value={user_area}
              onChange={(change_event) => set_user_area(change_event.target.value)}
              placeholder="Ej. COCIMIENTOS"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-xs font-semibold">
              PUESTO / CARGO
            </Label>
            <Input
              id="position"
              value={user_position}
              onChange={(change_event) => set_user_position(change_event.target.value)}
              placeholder="Ej. BECARIO / ESPECIALISTA"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">ROL DEL SISTEMA</Label>
          <Select value={user_role} onValueChange={(selected) => handle_role_select(selected as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
              <SelectItem value="area_lead">{ROLE_LABELS.area_lead}</SelectItem>
              <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
              <SelectItem value="intern">{ROLE_LABELS.intern}</SelectItem>
              <SelectItem value="viewer">{ROLE_LABELS.viewer}</SelectItem>
            </SelectContent>
          </Select>

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
