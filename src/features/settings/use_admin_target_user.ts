/**
 * @fileoverview Custom hook managing admin subscription to all users and `?uid=` target selection.
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth, type UserProfile } from "@/features/auth/auth_context";
import { user_service } from "@/features/auth/user_service";

function read_uid_query_param(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return new URLSearchParams(window.location.search).get("uid");
}

/** Resolves the active target user for settings editing (self or admin-selected profile). */
export function useAdminTargetUser() {
  const { currentUser, updateUserProfile } = useAuth();
  const is_admin = currentUser?.role === "admin";

  const [users_list, set_users_list] = useState<UserProfile[]>([]);
  const [selected_uid, set_selected_uid] = useState<string>(
    () => read_uid_query_param() || currentUser?.uid || "",
  );

  useEffect(() => {
    if (!is_admin) {
      return undefined;
    }
    return user_service.subscribe_to_users(
      (fetched_users) => set_users_list(fetched_users),
      (err) => console.error("Error al obtener lista de usuarios en configuración:", err),
    );
  }, [is_admin]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const param_uid = read_uid_query_param();
    if (param_uid && is_admin) {
      set_selected_uid(param_uid);
      return;
    }
    if (!selected_uid || !is_admin) {
      set_selected_uid(currentUser.uid);
    }
  }, [currentUser, is_admin]);

  const available_users = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    const users_by_uid = new Map<string, UserProfile>();
    users_by_uid.set(currentUser.uid, currentUser);
    for (const user_entry of users_list) {
      users_by_uid.set(
        user_entry.uid,
        user_entry.uid === currentUser.uid ? { ...user_entry, ...currentUser } : user_entry,
      );
    }
    return Array.from(users_by_uid.values()).sort((left_user, right_user) =>
      (left_user.name || "").localeCompare(right_user.name || "", "es", { sensitivity: "base" }),
    );
  }, [currentUser, users_list]);

  const target_user = useMemo<UserProfile | null>(() => {
    if (!currentUser) {
      return null;
    }
    if (!is_admin || !selected_uid || selected_uid === currentUser.uid) {
      return currentUser;
    }
    return available_users.find((entry) => entry.uid === selected_uid) || currentUser;
  }, [currentUser, is_admin, selected_uid, available_users]);

  const is_editing_other_user = Boolean(
    is_admin && currentUser && target_user && target_user.uid !== currentUser.uid,
  );

  const save_target_user_data = async (
    updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => {
    if (!target_user) {
      return;
    }
    if (!is_editing_other_user) {
      await updateUserProfile(updates);
      return;
    }
    await user_service.update_user_profile(target_user.uid, updates, true);
    set_users_list((prev) =>
      prev.map((entry) => (entry.uid === target_user.uid ? { ...entry, ...updates } : entry)),
    );
  };

  return {
    current_user: currentUser,
    is_admin,
    available_users,
    target_user,
    is_editing_other_user,
    set_selected_uid,
    save_target_user_data,
  };
}
