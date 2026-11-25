/**
 * @fileoverview Lightweight role identifier normalizer and empty fallback permissions bitmap for unauthenticated renders.
 */

import type { UserPermissions, UserRole } from "./auth_types";

/** Display labels corresponding to each `UserRole`. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  area_lead: "Líder de Área",
  user: "Usuario General",
  intern: "Becario / Practicante",
  viewer: "Auditor / Visor",
};

/** Default locked-down permissions object used before an authenticated session resolves. */
export const EMPTY_PERMISSIONS: UserPermissions = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canManageAssignment: false,
  canViewArea: false,
  canViewAll: false,
  canManageUsers: false,
};

/**
 * Validates and normalizes an untrusted role string to a known `UserRole`, defaulting to `"user"`.
 *
 * @param {string | null | undefined} raw_role - Stored or input role identifier.
 * @returns {UserRole} Validated role union value.
 */
export function normalize_user_role(raw_role?: string | null): UserRole {
  if (
    raw_role === "admin" ||
    raw_role === "area_lead" ||
    raw_role === "user" ||
    raw_role === "intern" ||
    raw_role === "viewer"
  ) {
    return raw_role;
  }
  return "user";
}
