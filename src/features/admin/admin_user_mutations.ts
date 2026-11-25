/**
 * @fileoverview Cloud Function role, permission, and deletion mutation callers for admin user management.
 */

import { toast } from "sonner";
import type { UserPermissions, UserProfile, UserRole } from "@/features/auth/auth_context";
import { get_auth_error_info } from "@/features/auth/email_validation";
import {
  get_effective_permissions,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_LABELS,
} from "@/features/auth/role_permissions";
import { user_service } from "@/features/auth/user_service";

export {
  execute_approve_user,
  execute_bulk_approve_users,
  execute_extend_intern_days,
  execute_send_verification_link,
} from "./admin_approval_mutations";

/** Updates a user's system role on the server and resets permissions to role defaults. */
export async function execute_role_change(
  target_uid: string,
  next_role: UserRole,
): Promise<UserPermissions | null> {
  const next_default_perms = { ...ROLE_DEFAULT_PERMISSIONS[next_role] };
  try {
    await user_service.update_user_role(target_uid, next_role, next_default_perms);
    toast.success(`Rol cambiado a ${ROLE_LABELS[next_role]}.`);
    return next_default_perms;
  } catch (caught_error: unknown) {
    console.error("Error al actualizar rol:", caught_error);
    const { code, message } = get_auth_error_info(caught_error);
    if (code === "functions/failed-precondition") {
      toast.error(message || "Operación no permitida sobre tu propia cuenta.");
    } else {
      toast.error("No se pudo actualizar el rol en servidor. Verifica permisos de administrador.");
    }
    return null;
  }
}

/** Persists a single custom permission flag override on the server. */
export async function execute_permission_toggle(
  user_profile: UserProfile,
  permission_key: keyof Omit<UserPermissions, "canManageUsers">,
  is_checked: boolean,
): Promise<UserPermissions | null> {
  const current_effective = get_effective_permissions(user_profile);
  const next_permissions: UserPermissions = {
    ...current_effective,
    [permission_key]: is_checked,
    canManageUsers: user_profile.role === "admin",
  };
  try {
    await user_service.update_user_permissions(user_profile.uid, next_permissions);
    toast.success(`Permisos de ${user_profile.name} actualizados.`);
    return next_permissions;
  } catch (caught_error) {
    console.error("Error al actualizar permisos:", caught_error);
    toast.error("No se pudieron guardar los permisos personalizados en servidor.");
    return null;
  }
}

/** Restores default role permissions for the selected user via backend update. */
export async function execute_reset_permissions(
  user_profile: UserProfile,
): Promise<UserPermissions | null> {
  const default_permissions = { ...ROLE_DEFAULT_PERMISSIONS[user_profile.role] };
  try {
    await user_service.update_user_permissions(user_profile.uid, default_permissions);
    toast.success(
      `Permisos de ${user_profile.name} restablecidos a ${ROLE_LABELS[user_profile.role]}.`,
    );
    return default_permissions;
  } catch (caught_error) {
    console.error("Error al restablecer permisos:", caught_error);
    toast.error("No se pudieron restablecer los permisos en servidor.");
    return null;
  }
}

/** Permanently deletes a collaborator account via `adminDeleteUser` Cloud Function. */
export async function execute_delete_user(target_uid: string, user_name: string): Promise<void> {
  try {
    await user_service.delete_user(target_uid);
    toast.success(`El usuario ${user_name} ha sido eliminado de Auth y Firestore.`);
  } catch (caught_error: unknown) {
    console.error("Error al eliminar usuario:", caught_error);
    const { code, message } = get_auth_error_info(caught_error);
    if (code === "functions/failed-precondition") {
      toast.error(message || "No puedes eliminar tu propia cuenta.");
    } else {
      toast.error("No tienes permisos verificados para eliminar usuarios.");
    }
  }
}
