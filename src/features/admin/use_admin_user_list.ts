/**
 * @fileoverview Custom hook managing admin user filters, optimistic state overrides, and user mutations.
 */

import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useAuth,
  type UserPermissions,
  type UserProfile,
  type UserRole,
} from "@/features/auth/auth_context";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  count_users_by_role,
  extract_available_areas,
  filter_admin_users,
  get_pending_corporate_users,
  merge_admin_user_overrides,
} from "./admin_user_filter_helpers";
import {
  execute_approve_user,
  execute_bulk_approve_users,
  execute_delete_user,
  execute_extend_intern_days,
  execute_permission_toggle,
  execute_reset_permissions,
  execute_role_change,
  execute_send_verification_link,
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
  const [perm_overrides, set_perm_overrides] = useState<Record<string, Partial<UserPermissions>>>(
    {},
  );
  const [approved_overrides, set_approved_overrides] = useState<Record<string, boolean>>({});
  const [sending_uid, set_sending_uid] = useState<string | null>(null);
  const [approving_uid, set_approving_uid] = useState<string | null>(null);
  const [is_bulk_approving, set_is_bulk_approving] = useState(false);
  const [selected_photo_user, set_selected_photo_user] = useState<UserProfile | null>(null);
  const [search_query, set_search_query] = useState("");
  const [area_filter, set_area_filter] = useState("all");
  const [role_filter, set_role_filter] = useState<"all" | UserRole>("all");
  const [pending_only, set_pending_only] = useState(false);

  const merged_users = useMemo(
    () =>
      merge_admin_user_overrides(users_list, role_overrides, perm_overrides, approved_overrides),
    [users_list, role_overrides, perm_overrides, approved_overrides],
  );
  const counts_by_role = useMemo(() => count_users_by_role(merged_users), [merged_users]);
  const available_areas = useMemo(() => extract_available_areas(merged_users), [merged_users]);
  const pending_corporate_users = useMemo(
    () => get_pending_corporate_users(merged_users),
    [merged_users],
  );
  const workload_by_uid = useMemo(
    () => compute_workload_by_uid(merged_users, allPdcas, allRdas),
    [merged_users, allPdcas, allRdas],
  );
  const filtered_users = useMemo(
    () => filter_admin_users(merged_users, search_query, area_filter, role_filter, pending_only),
    [merged_users, search_query, area_filter, role_filter, pending_only],
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
    set_sending_uid(user_profile.uid);
    try {
      await execute_send_verification_link(user_profile, sendAdminVerificationLink);
    } finally {
      set_sending_uid(null);
    }
  };

  const mark_approved_locally = (approved_uids: string[]) => {
    set_approved_overrides((prev) => {
      const next_overrides = { ...prev };
      for (const approved_uid of approved_uids) next_overrides[approved_uid] = true;
      return next_overrides;
    });
  };

  const handle_approve_user = async (user_profile: UserProfile) => {
    set_approving_uid(user_profile.uid);
    try {
      const approved = await execute_approve_user(user_profile, approveUserVerification);
      if (approved) mark_approved_locally([user_profile.uid]);
    } finally {
      set_approving_uid(null);
    }
  };

  const handle_bulk_approve = async () => {
    set_is_bulk_approving(true);
    try {
      const approved_uids = await execute_bulk_approve_users(
        pending_corporate_users,
        approveUserVerification,
      );
      if (approved_uids.length > 0) mark_approved_locally(approved_uids);
    } finally {
      set_is_bulk_approving(false);
    }
  };

  const handle_extend_intern_days = async (user_profile: UserProfile, active_days: number) => {
    await execute_extend_intern_days(user_profile, active_days);
  };

  return {
    merged_users,
    filtered_users,
    counts_by_role,
    available_areas,
    pending_corporate_count: pending_corporate_users.length,
    workload_by_uid,
    sending_uid,
    approving_uid,
    is_bulk_approving,
    selected_photo_user,
    set_selected_photo_user,
    search_query,
    set_search_query,
    area_filter,
    set_area_filter,
    role_filter,
    set_role_filter,
    pending_only,
    set_pending_only,
    handle_edit_user,
    handle_role_change,
    handle_permission_toggle,
    handle_reset_permissions,
    handle_delete_user: execute_delete_user,
    handle_send_verification_link,
    handle_approve_user,
    handle_bulk_approve,
    handle_extend_intern_days,
  };
}
