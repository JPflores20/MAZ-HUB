/**
 * @fileoverview Custom hook managing admin user filters, optimistic state overrides, and user mutations.
 */

import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useAuth,
  type UserPermissions,
  type UserProfile,
  type UserRole,
} from "@/features/auth/auth_context";
import { get_auth_error_info } from "@/features/auth/email_validation";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  count_users_by_role,
  extract_available_areas,
  filter_admin_users,
  merge_admin_user_overrides,
} from "./admin_user_filter_helpers";
import {
  execute_delete_user,
  execute_permission_toggle,
  execute_reset_permissions,
  execute_role_change,
} from "./admin_user_mutations";
import { compute_workload_by_uid } from "./user_workload_helpers";

/** Encapsulates filtering, active workload aggregation, and server actions for `UserList`. */
export function useAdminUserList(
  users_list: UserProfile[],
  set_users_list?: React.Dispatch<React.SetStateAction<UserProfile[]>>,
) {
  const navigate = useNavigate();
  const { sendAdminVerificationLink, approveUserVerification } = useAuth();
  const { allPdcas } = usePdcas();
  const { allRdas } = useRdas();

  const [role_overrides, set_role_overrides] = useState<Record<string, UserRole>>({});
  const [perm_overrides, set_perm_overrides] = useState<
    Record<string, Partial<UserPermissions>>
  >({});
  const [approved_overrides, set_approved_overrides] = useState<Record<string, boolean>>({});
  const [sending_uid, set_sending_uid] = useState<string | null>(null);
  const [selected_photo_user, set_selected_photo_user] = useState<UserProfile | null>(null);
  const [search_query, set_search_query] = useState("");
  const [area_filter, set_area_filter] = useState("all");
  const [role_filter, set_role_filter] = useState<"all" | UserRole>("all");

  const merged_users = useMemo(
    () =>
      merge_admin_user_overrides(users_list, role_overrides, perm_overrides, approved_overrides),
    [users_list, role_overrides, perm_overrides, approved_overrides],
  );
  const counts_by_role = useMemo(() => count_users_by_role(merged_users), [merged_users]);
  const available_areas = useMemo(() => extract_available_areas(merged_users), [merged_users]);
  const workload_by_uid = useMemo(
    () => compute_workload_by_uid(merged_users, allPdcas, allRdas),
    [merged_users, allPdcas, allRdas],
  );
  const filtered_users = useMemo(
    () => filter_admin_users(merged_users, search_query, area_filter, role_filter),
    [merged_users, search_query, area_filter, role_filter],
  );

  const handle_edit_user = (target_uid: string) => {
    void navigate({
      to: "/configuracion",
      search: { uid: target_uid } as Record<string, string> as never,
    });
  };

  const apply_permission_override = (target_uid: string, saved_perms: UserPermissions) => {
    set_perm_overrides((prev) => ({ ...prev, [target_uid]: saved_perms }));
    set_users_list?.((prev) =>
      prev.map((entry) =>
        entry.uid === target_uid ? { ...entry, permissions: saved_perms } : entry,
      ),
    );
  };

  const handle_role_change = async (target_uid: string, next_role: UserRole) => {
    const saved_perms = await execute_role_change(target_uid, next_role);
    if (!saved_perms) return;
    set_role_overrides((prev) => ({ ...prev, [target_uid]: next_role }));
    set_perm_overrides((prev) => ({ ...prev, [target_uid]: saved_perms }));
    set_users_list?.((prev) =>
      prev.map((entry) =>
        entry.uid === target_uid ? { ...entry, role: next_role, permissions: saved_perms } : entry,
      ),
    );
  };

  const handle_permission_toggle = async (
    user_profile: UserProfile,
    permission_key: keyof Omit<UserPermissions, "canManageUsers">,
    is_checked: boolean,
  ) => {
    const saved_perms = await execute_permission_toggle(user_profile, permission_key, is_checked);
    if (saved_perms) apply_permission_override(user_profile.uid, saved_perms);
  };

  const handle_reset_permissions = async (user_profile: UserProfile) => {
    const saved_perms = await execute_reset_permissions(user_profile);
    if (saved_perms) apply_permission_override(user_profile.uid, saved_perms);
  };

  const handle_send_verification_link = async (user_profile: UserProfile) => {
    if (!user_profile.email) {
      toast.error("Este usuario no tiene un correo electrónico válido.");
      return;
    }
    set_sending_uid(user_profile.uid);
    try {
      await sendAdminVerificationLink({ uid: user_profile.uid, email: user_profile.email });
      toast.success(
        `Se envió a ${user_profile.email} un enlace seguro de Firebase para restablecer contraseña y activar su acceso.`,
        { duration: 6000 },
      );
    } catch (caught_error: unknown) {
      console.error("Error al reenviar enlace:", caught_error);
      const { code, message } = get_auth_error_info(caught_error);
      toast.warning(
        code === "auth/too-many-requests"
          ? "Firebase envió un enlace recientemente a este correo. Espera unos minutos antes de reenviar otro."
          : message || "No se pudo enviar el enlace al correo del usuario.",
      );
    } finally {
      set_sending_uid(null);
    }
  };

  const handle_approve_user = async (user_profile: UserProfile) => {
    try {
      await approveUserVerification(user_profile.uid);
      set_approved_overrides((prev) => ({ ...prev, [user_profile.uid]: true }));
      toast.success(
        `La cuenta de ${user_profile.name} (${user_profile.email}) ha sido aprobada y habilitada en servidor.`,
      );
    } catch (caught_error: unknown) {
      console.error("Error al aprobar usuario:", caught_error);
      toast.error(
        get_auth_error_info(caught_error).message || "No se pudo aprobar la cuenta en el servidor.",
      );
    }
  };

  return {
    merged_users,
    filtered_users,
    counts_by_role,
    available_areas,
    workload_by_uid,
    sending_uid,
    selected_photo_user,
    set_selected_photo_user,
    search_query,
    set_search_query,
    area_filter,
    set_area_filter,
    role_filter,
    set_role_filter,
    handle_edit_user,
    handle_role_change,
    handle_permission_toggle,
    handle_reset_permissions,
    handle_delete_user: execute_delete_user,
    handle_send_verification_link,
    handle_approve_user,
  };
}
