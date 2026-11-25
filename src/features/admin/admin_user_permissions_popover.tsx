/**
 * @fileoverview Inline role select and granular permission customization popover for a directory user row.
 */

import {
  Briefcase,
  Eye,
  GraduationCap,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import type { UserPermissions, UserProfile, UserRole } from "@/features/auth/auth_context";
import {
  get_effective_permissions,
  has_custom_permissions,
  PERMISSION_METADATA,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/features/auth/role_permissions";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface AdminUserPermissionsPopoverProps {
  user_profile: UserProfile;
  role_locked?: boolean;
  on_role_change: (uid: string, next_role: UserRole) => Promise<void>;
  on_permission_toggle: (
    user_profile: UserProfile,
    permission_key: keyof Omit<UserPermissions, "canManageUsers">,
    is_checked: boolean,
  ) => Promise<void>;
  on_reset_permissions: (user_profile: UserProfile) => Promise<void>;
}

/**
 * Renders the role dropdown paired with the fine-grained permission override popover.
 */
export function AdminUserPermissionsPopover({
  user_profile,
  role_locked = false,
  on_role_change,
  on_permission_toggle,
  on_reset_permissions,
}: AdminUserPermissionsPopoverProps) {
  const effective_perms = get_effective_permissions(user_profile);
  const is_customized = has_custom_permissions(user_profile);

  return (
    <div className="flex items-center gap-1.5">
      <Select
        disabled={role_locked}
        value={user_profile.role}
        onValueChange={(next_value) =>
          void on_role_change(user_profile.uid, next_value as UserRole)
        }
      >
        <SelectTrigger className="h-8 w-44 text-xs font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <Shield className="size-3.5" /> Admin
            </span>
          </SelectItem>
          <SelectItem value="area_lead">
            <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
              <Briefcase className="size-3.5" /> Líder de Área
            </span>
          </SelectItem>
          <SelectItem value="user">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-primary" /> Usuario General
            </span>
          </SelectItem>
          <SelectItem value="intern">
            <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <GraduationCap className="size-3.5" /> Becario
            </span>
          </SelectItem>
          <SelectItem value="viewer">
            <span className="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
              <Eye className="size-3.5" /> Visor (Lectura)
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={is_customized ? "default" : "outline"}
            size="icon"
            title={
              is_customized
                ? "Permisos personalizados activos (clic para configurar)"
                : "Personalizar permisos individuales"
            }
            className={`h-8 w-8 shrink-0 ${
              is_customized
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-3" align="end">
          <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
            <div>
              <p className="text-xs font-bold uppercase text-foreground">{user_profile.name}</p>
              <p className="text-[11px] font-semibold text-primary">
                Rol: {ROLE_LABELS[user_profile.role]}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {ROLE_DESCRIPTIONS[user_profile.role]}
              </p>
            </div>
            {is_customized && (
              <button
                type="button"
                onClick={() => void on_reset_permissions(user_profile)}
                title="Restablecer a los permisos por defecto del rol"
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shrink-0"
              >
                <RotateCcw className="size-2.5" />
                Restablecer
              </button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Permisos Granulares Activos
            </p>
            {PERMISSION_METADATA.map((permission_meta) => (
              <label
                key={permission_meta.key}
                className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-secondary/20 p-2 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <Checkbox
                  checked={Boolean(effective_perms[permission_meta.key])}
                  onCheckedChange={(checked_state) =>
                    void on_permission_toggle(
                      user_profile,
                      permission_meta.key,
                      Boolean(checked_state),
                    )
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
