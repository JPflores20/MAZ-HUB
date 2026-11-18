/**
 * @fileoverview Identity matching and ownership helpers for PDCA and RDA access control policies.
 * Normalizes emails, display names, and assigned UID/email arrays safely on the client mirror.
 */

import type { Pdca } from "@/domain/pdca";
import type { Rda } from "@/domain/models/rda";
import type { UserProfile } from "@/features/auth/auth_context";

/**
 * Normalizes a string by removing diacritics, trimming whitespace, and lowercasing.
 *
 * @param {string | undefined} raw_value - Raw identifier text such as email, area, or display name.
 * @returns {string} Accent-free lowercase value ready for identity comparisons.
 */
export function normalize_identity_string(raw_value?: string): string {
  return (raw_value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Extracts clean responsible person names from an RDA record's context or cover fields.
 *
 * @param {Rda} rda_record - Target RDA record.
 * @returns {string[]} Non-empty responsible names associated with the RDA.
 */
export function extract_rda_responsible_names(rda_record: Rda): string[] {
  const names_from_context = (rda_record.context?.responsable || "")
    .split(",")
    .map((entry_text) => entry_text.trim())
    .filter(Boolean);
  if (names_from_context.length > 0) {
    return names_from_context;
  }
  return (rda_record.portada?.usuariosAsignados || [])
    .map((entry_text) => entry_text.trim())
    .filter(Boolean);
}

/**
 * Checks whether a user UID or email appears inside optional denormalized assignment arrays.
 *
 * @param {{ assignedUids?: string[]; assignedEmails?: string[] }} record_fields - Access fields on a record.
 * @param {UserProfile} current_user - Signed-in user profile.
 * @returns {boolean} True if either UID or email is explicitly listed.
 */
function matches_denormalized_assignment(
  record_fields: { assignedUids?: string[]; assignedEmails?: string[] },
  current_user: UserProfile,
): boolean {
  if (
    Array.isArray(record_fields.assignedUids) &&
    record_fields.assignedUids.includes(current_user.uid)
  ) {
    return true;
  }
  const normalized_email = normalize_identity_string(current_user.email);
  return Boolean(
    normalized_email &&
      Array.isArray(record_fields.assignedEmails) &&
      record_fields.assignedEmails.some(
        (candidate_email) => normalize_identity_string(candidate_email) === normalized_email,
      ),
  );
}

/**
 * Determines whether the signed-in user is the creator/owner of a PDCA project.
 *
 * @param {Pdca} pdca_record - PDCA project document.
 * @param {UserProfile} current_user - Signed-in user profile.
 * @returns {boolean} True when UID, author email, or author name matches.
 */
export function is_pdca_owner(pdca_record: Pdca, current_user: UserProfile): boolean {
  const normalized_email = normalize_identity_string(current_user.email);
  const normalized_name = normalize_identity_string(current_user.name);
  const owner_uid = (pdca_record as { ownerUid?: string }).ownerUid;
  if (owner_uid && owner_uid === current_user.uid) {
    return true;
  }
  if (normalized_email && normalize_identity_string(pdca_record.autorEmail) === normalized_email) {
    return true;
  }
  return Boolean(
    normalized_name && normalize_identity_string(pdca_record.autor) === normalized_name,
  );
}

/**
 * Determines whether the signed-in user is assigned or part of a PDCA team.
 *
 * @param {Pdca} pdca_record - PDCA project document.
 * @param {UserProfile} current_user - Signed-in user profile.
 * @returns {boolean} True if user appears in assigned UIDs/emails, asignados, or equipo.
 */
export function is_pdca_assigned(pdca_record: Pdca, current_user: UserProfile): boolean {
  if (
    matches_denormalized_assignment(
      pdca_record as { assignedUids?: string[]; assignedEmails?: string[] },
      current_user,
    )
  ) {
    return true;
  }
  const normalized_email = normalize_identity_string(current_user.email);
  const normalized_name = normalize_identity_string(current_user.name);
  const in_assigned_list = (pdca_record.asignados || []).some(
    (assignee_entry) =>
      (normalized_email && normalize_identity_string(assignee_entry.email) === normalized_email) ||
      (normalized_name && normalize_identity_string(assignee_entry.name) === normalized_name),
  );
  if (in_assigned_list) {
    return true;
  }
  return (pdca_record.equipo || []).some(
    (team_member) => normalized_name && normalize_identity_string(team_member) === normalized_name,
  );
}

/**
 * Determines whether the signed-in user is the creator/owner of an RDA record.
 *
 * @param {Rda} rda_record - RDA document.
 * @param {UserProfile} current_user - Signed-in user profile.
 * @returns {boolean} True when ownerUid, portada author fields, or iniciadoPor match.
 */
export function is_rda_owner(rda_record: Rda, current_user: UserProfile): boolean {
  const normalized_email = normalize_identity_string(current_user.email);
  const normalized_name = normalize_identity_string(current_user.name);
  const owner_uid = (rda_record as { ownerUid?: string }).ownerUid;
  if (owner_uid && owner_uid === current_user.uid) {
    return true;
  }
  if (
    normalized_email &&
    normalize_identity_string(rda_record.portada?.autorEmail) === normalized_email
  ) {
    return true;
  }
  if (
    normalized_name &&
    normalize_identity_string(rda_record.portada?.autorOriginal) === normalized_name
  ) {
    return true;
  }
  return Boolean(
    normalized_name &&
      normalize_identity_string(rda_record.context?.iniciadoPor) === normalized_name,
  );
}

/**
 * Determines whether the signed-in user is assigned as a responsible person on an RDA record.
 *
 * @param {Rda} rda_record - RDA document.
 * @param {UserProfile} current_user - Signed-in user profile.
 * @returns {boolean} True when explicitly assigned via UID/email or listed as responsible.
 */
export function is_rda_assigned(rda_record: Rda, current_user: UserProfile): boolean {
  if (
    matches_denormalized_assignment(
      rda_record as { assignedUids?: string[]; assignedEmails?: string[] },
      current_user,
    )
  ) {
    return true;
  }
  const normalized_email = normalize_identity_string(current_user.email);
  const normalized_name = normalize_identity_string(current_user.name);
  const responsible_names = extract_rda_responsible_names(rda_record);
  return responsible_names.some(
    (responsible_person) =>
      (normalized_name && normalize_identity_string(responsible_person) === normalized_name) ||
      (normalized_email && normalize_identity_string(responsible_person) === normalized_email),
  );
}
