/**
 * @fileoverview Pure authorization-aware notification filtering helpers matching owners, assignees, and requesters.
 */

import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import type { AppNotification } from "./notification_types";

/** Strips accents, trims whitespace, and lowercases strings for notification matching. */
export function normalize_notification_text(raw_value?: string | null): string {
  return (raw_value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function user_owns_or_handles_pdca(
  pdca_list: Pdca[],
  pdca_id: string,
  user_norm_email: string,
  user_norm_name: string,
): boolean {
  const pdca_record = pdca_list.find((entry) => entry.id === pdca_id);
  if (!pdca_record) return false;
  const is_owner =
    (Boolean(user_norm_email) &&
      normalize_notification_text(pdca_record.autorEmail) === user_norm_email) ||
    (Boolean(user_norm_name) &&
      normalize_notification_text(pdca_record.autor) === user_norm_name);
  const is_assigned =
    (pdca_record.asignados || []).some(
      (assignee) =>
        (Boolean(user_norm_email) &&
          normalize_notification_text(assignee.email) === user_norm_email) ||
        (Boolean(user_norm_name) &&
          normalize_notification_text(assignee.name) === user_norm_name),
    ) ||
    (pdca_record.equipo || []).some(
      (team_member) => normalize_notification_text(team_member) === user_norm_name,
    );
  return is_owner || is_assigned;
}

function user_owns_or_handles_rda(
  rda_list: Rda[],
  rda_id: string,
  user_norm_email: string,
  user_norm_name: string,
): boolean {
  const rda_record = rda_list.find((entry) => entry.id === rda_id);
  if (!rda_record) return false;
  const is_owner =
    (Boolean(user_norm_email) &&
      normalize_notification_text(rda_record.portada?.autorEmail) === user_norm_email) ||
    (Boolean(user_norm_name) &&
      normalize_notification_text(rda_record.portada?.autorOriginal) === user_norm_name) ||
    (Boolean(user_norm_name) &&
      normalize_notification_text(rda_record.context?.iniciadoPor) === user_norm_name);

  const responsible_tokens = [
    ...(rda_record.context?.responsable || "").split(",").map((segment) => segment.trim()),
    ...(rda_record.portada?.usuariosAsignados || []),
  ]
    .filter(Boolean)
    .map((segment) => normalize_notification_text(segment));

  const is_assigned = responsible_tokens.some(
    (person_token) =>
      (Boolean(user_norm_name) &&
        (person_token === user_norm_name || person_token.includes(user_norm_name))) ||
      (Boolean(user_norm_email) && person_token === user_norm_email),
  );
  return is_owner || is_assigned;
}

/** Determines whether a notification document belongs in the current user's notification feed. */
export function is_notification_relevant_to_user(
  notification: AppNotification,
  current_user: UserProfile,
  all_pdcas: Pdca[],
  all_rdas: Rda[],
): boolean {
  const user_norm_name = normalize_notification_text(current_user.name);
  const user_norm_email = normalize_notification_text(current_user.email);
  const target_norm_user = normalize_notification_text(notification.userId);
  const target_norm_email = normalize_notification_text(notification.recipientEmail);

  if (notification.recipientUid && notification.recipientUid === current_user.uid) return true;
  if (user_norm_name && target_norm_user === user_norm_name) return true;
  if (user_norm_email && target_norm_email && target_norm_email === user_norm_email) return true;

  if (notification.type === "access_approved" || notification.type === "access_rejected") {
    if (notification.requesterUid && notification.requesterUid === current_user.uid) return true;
    if (
      user_norm_email &&
      normalize_notification_text(notification.requesterEmail) === user_norm_email
    ) {
      return true;
    }
    if (
      user_norm_name &&
      normalize_notification_text(notification.requesterName) === user_norm_name
    ) {
      return true;
    }
  }

  if (notification.type !== "access_request") {
    return false;
  }

  const is_self_requester =
    (Boolean(notification.requesterUid) && notification.requesterUid === current_user.uid) ||
    (Boolean(user_norm_email) &&
      normalize_notification_text(notification.requesterEmail) === user_norm_email) ||
    (Boolean(user_norm_name) &&
      normalize_notification_text(notification.requesterName) === user_norm_name);

  if (is_self_requester) return false;
  if (current_user.role === "admin") return true;

  if (user_norm_name && normalize_notification_text(notification.creatorName) === user_norm_name) {
    return true;
  }
  if (
    user_norm_email &&
    normalize_notification_text(notification.creatorEmail) === user_norm_email
  ) {
    return true;
  }
  if (
    user_norm_name &&
    (notification.responsibleNames || []).some(
      (person_name) => normalize_notification_text(person_name) === user_norm_name,
    )
  ) {
    return true;
  }
  if (
    user_norm_email &&
    (notification.responsibleEmails || []).some(
      (person_email) => normalize_notification_text(person_email) === user_norm_email,
    )
  ) {
    return true;
  }
  if (
    notification.pdcaId &&
    user_owns_or_handles_pdca(all_pdcas, notification.pdcaId, user_norm_email, user_norm_name)
  ) {
    return true;
  }
  return Boolean(
    notification.rdaId &&
      user_owns_or_handles_rda(all_rdas, notification.rdaId, user_norm_email, user_norm_name),
  );
}
