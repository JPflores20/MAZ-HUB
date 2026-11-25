/**
 * @fileoverview Role-based and ownership UI authorization guards for PDCA and RDA documents.
 * Mirrors backend Firestore rules to gate viewing, editing, and deletion cleanly in UI flows.
 */

import type { Pdca } from "@/domain/pdca";
import { does_area_belong_to_parent_or_match } from "@/domain/pdca";
import type { Rda } from "@/domain/models/rda";
import type { UserProfile } from "@/features/auth/auth_context";
import { get_effective_permissions } from "@/features/auth/role_permissions";
import type { UserPermissions } from "@/features/auth/user_service";
import {
  is_pdca_assigned,
  is_pdca_owner,
  is_rda_assigned,
  is_rda_owner,
} from "./access_identity_helpers";

/** Evaluates read access across PDCA and RDA records using role, ownership, assignment, and area scope. */
function evaluate_read_access(
  current_user: UserProfile | null,
  explicit_permissions: UserPermissions | undefined,
  is_owner_or_assigned: boolean,
  record_area: string,
): boolean {
  if (!current_user) {
    return false;
  }
  if (current_user.role === "admin") {
    return true;
  }
  const effective_permissions = explicit_permissions ?? get_effective_permissions(current_user);
  if (effective_permissions.canViewAll || is_owner_or_assigned) {
    return true;
  }
  return Boolean(
    effective_permissions.canViewArea &&
      does_area_belong_to_parent_or_match(record_area, current_user.area),
  );
}

/** Evaluates edit/create authorization while explicitly denying `viewer` and `intern` roles. */
function evaluate_edit_access(
  current_user: UserProfile | null,
  explicit_permissions: UserPermissions | undefined,
  is_owner_or_assigned: boolean,
  record_area: string,
): boolean {
  if (!current_user) {
    return false;
  }
  if (current_user.role === "viewer" || current_user.role === "intern") {
    return false;
  }
  const effective_permissions = explicit_permissions ?? get_effective_permissions(current_user);
  if (!effective_permissions.canEdit) {
    return false;
  }
  if (current_user.role === "admin") {
    return true;
  }
  if (
    current_user.role === "area_lead" &&
    does_area_belong_to_parent_or_match(record_area, current_user.area)
  ) {
    return true;
  }
  return is_owner_or_assigned;
}

/** Evaluates strict delete authorization restricted to document owners and admins. */
function evaluate_delete_access(
  current_user: UserProfile | null,
  is_document_owner: boolean,
): boolean {
  if (!current_user || current_user.role === "viewer" || current_user.role === "intern") {
    return false;
  }
  if (current_user.role === "admin") {
    return true;
  }
  return is_document_owner;
}

/**
 * Determines whether the signed-in user may open and read a PDCA project.
 *
 * @param {Pdca} pdca_record - Target PDCA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @param {UserPermissions | undefined} permissions - Optional precomputed permissions.
 * @returns {boolean} True if permitted to view the PDCA.
 */
export function can_user_access_pdca(
  pdca_record: Pdca,
  current_user: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  const is_member = Boolean(
    current_user &&
      (is_pdca_owner(pdca_record, current_user) || is_pdca_assigned(pdca_record, current_user)),
  );
  return evaluate_read_access(current_user, permissions, is_member, pdca_record.area);
}

/**
 * Determines whether the signed-in user may open and read an RDA record.
 *
 * @param {Rda} rda_record - Target RDA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @param {UserPermissions | undefined} permissions - Optional precomputed permissions.
 * @returns {boolean} True if permitted to view the RDA.
 */
export function can_user_access_rda(
  rda_record: Rda,
  current_user: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  const is_member = Boolean(
    current_user &&
      (is_rda_owner(rda_record, current_user) || is_rda_assigned(rda_record, current_user)),
  );
  const rda_area = rda_record.context?.area || rda_record.portada?.area || "";
  return evaluate_read_access(current_user, permissions, is_member, rda_area);
}

/**
 * Determines whether the signed-in user may create or edit a PDCA project (blocks `viewer`/`intern`).
 *
 * @param {Pdca} pdca_record - Target PDCA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @param {UserPermissions | undefined} permissions - Optional precomputed permissions.
 * @returns {boolean} True if user is authorized to edit the PDCA.
 */
export function can_user_edit_pdca(
  pdca_record: Pdca,
  current_user: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  const is_member = Boolean(
    current_user &&
      (is_pdca_owner(pdca_record, current_user) || is_pdca_assigned(pdca_record, current_user)),
  );
  return evaluate_edit_access(current_user, permissions, is_member, pdca_record.area);
}

/**
 * Determines whether the signed-in user may edit an RDA record (blocks `viewer`/`intern`).
 *
 * @param {Rda} rda_record - Target RDA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @param {UserPermissions | undefined} permissions - Optional precomputed permissions.
 * @returns {boolean} True if user is authorized to edit the RDA.
 */
export function can_user_edit_rda(
  rda_record: Rda,
  current_user: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  const is_member = Boolean(
    current_user &&
      (is_rda_owner(rda_record, current_user) || is_rda_assigned(rda_record, current_user)),
  );
  const rda_area = rda_record.context?.area || rda_record.portada?.area || "";
  return evaluate_edit_access(current_user, permissions, is_member, rda_area);
}

/**
 * Restricts PDCA deletion strictly to the document creator/owner or an administrator.
 *
 * @param {Pdca} pdca_record - Target PDCA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @returns {boolean} True if deletion is permitted.
 */
export function can_user_delete_pdca(pdca_record: Pdca, current_user: UserProfile | null): boolean {
  return evaluate_delete_access(
    current_user,
    Boolean(current_user && is_pdca_owner(pdca_record, current_user)),
  );
}

/**
 * Restricts RDA deletion strictly to the document creator/owner or an administrator.
 *
 * @param {Rda} rda_record - Target RDA document.
 * @param {UserProfile | null} current_user - Signed-in user or null.
 * @returns {boolean} True if deletion is permitted.
 */
export function can_user_delete_rda(rda_record: Rda, current_user: UserProfile | null): boolean {
  return evaluate_delete_access(
    current_user,
    Boolean(current_user && is_rda_owner(rda_record, current_user)),
  );
}
