/**
 * @fileoverview Pure filtering, optimistic override merging, and area extraction helpers for admin users.
 */

import type { UserPermissions, UserProfile, UserRole } from "@/features/auth/auth_context";

/** Merges optimistic role, permission, and approval overrides onto raw user directory entries. */
export function merge_admin_user_overrides(
  users_list: UserProfile[],
  role_overrides: Record<string, UserRole>,
  perm_overrides: Record<string, Partial<UserPermissions>>,
  approved_overrides: Record<string, boolean>,
): UserProfile[] {
  return users_list.map((user_entry) => {
    const overridden_role = role_overrides[user_entry.uid];
    const overridden_perms = perm_overrides[user_entry.uid];
    const overridden_approved = approved_overrides[user_entry.uid];
    return {
      ...user_entry,
      role: overridden_role ?? user_entry.role ?? "user",
      permissions: overridden_perms ?? user_entry.permissions,
      ...(typeof overridden_approved === "boolean"
        ? { approved: overridden_approved, verifiedByAdmin: overridden_approved }
        : {}),
    };
  });
}

/** Counts registered users grouped by system role plus `"all"`. */
export function count_users_by_role(merged_users: UserProfile[]): Record<"all" | UserRole, number> {
  const role_counts: Record<"all" | UserRole, number> = {
    all: merged_users.length,
    admin: 0,
    area_lead: 0,
    user: 0,
    intern: 0,
    viewer: 0,
  };
  for (const user_entry of merged_users) {
    role_counts[user_entry.role] = (role_counts[user_entry.role] || 0) + 1;
  }
  return role_counts;
}

/** Extracts sorted unique department names present across registered users. */
export function extract_available_areas(merged_users: UserProfile[]): string[] {
  const unique_areas = new Set<string>();
  for (const user_entry of merged_users) {
    if (user_entry.area && user_entry.area.trim()) {
      unique_areas.add(user_entry.area.trim());
    }
  }
  return Array.from(unique_areas).sort((left_area, right_area) =>
    left_area.localeCompare(right_area, "es", { sensitivity: "base" }),
  );
}

/** Filters users by search query, department, and role tab selection. */
export function filter_admin_users(
  merged_users: UserProfile[],
  search_query: string,
  area_filter: string,
  role_filter: "all" | UserRole,
): UserProfile[] {
  const normalized_query = search_query.trim().toLowerCase();
  return merged_users.filter((user_entry) => {
    const matches_query =
      !normalized_query ||
      user_entry.name.toLowerCase().includes(normalized_query) ||
      user_entry.email.toLowerCase().includes(normalized_query) ||
      (user_entry.area || "").toLowerCase().includes(normalized_query) ||
      (user_entry.position || "").toLowerCase().includes(normalized_query);
    const matches_area =
      area_filter === "all" ||
      (user_entry.area || "").trim().toLowerCase() === area_filter.toLowerCase();
    const matches_role = role_filter === "all" || user_entry.role === role_filter;
    return matches_query && matches_area && matches_role;
  });
}
