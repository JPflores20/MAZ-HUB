/**
 * @fileoverview Pure notification grouping, multi-recipient deduplication, and reverse-chronological sorting.
 */

import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import {
  is_notification_relevant_to_user,
  normalize_notification_text,
} from "./notification_matching";
import type { AppNotification } from "./notification_types";

const MAX_DISPLAYED_NOTIFICATIONS = 35;

/**
 * Deduplicates multi-recipient access requests, preserves merged related doc IDs,
 * sorts newest-first, and caps the displayed feed at 35 notifications.
 */
export function group_and_sort_notifications(
  raw_notifications: AppNotification[],
  current_user: UserProfile,
  all_pdcas: Pdca[],
  all_rdas: Rda[],
): AppNotification[] {
  const user_norm_name = normalize_notification_text(current_user.name);
  const relevant_items = raw_notifications.filter((notification) =>
    is_notification_relevant_to_user(notification, current_user, all_pdcas, all_rdas),
  );

  const grouped_by_key = new Map<string, AppNotification>();
  for (const notification of relevant_items) {
    const group_key =
      notification.type === "access_request"
        ? notification.actionId ||
          `access-req-${notification.pdcaId || notification.rdaId || ""}-${notification.requesterUid || normalize_notification_text(notification.requesterName)}`
        : notification.id;

    const existing = grouped_by_key.get(group_key);
    if (!existing) {
      grouped_by_key.set(group_key, { ...notification, relatedDocIds: [notification.id] });
      continue;
    }

    const merged_doc_ids = Array.from(
      new Set([...(existing.relatedDocIds || [existing.id]), notification.id]),
    );
    const preferred_record =
      normalize_notification_text(notification.userId) === user_norm_name ? notification : existing;
    const any_approved = Boolean(existing.approved || notification.approved);
    const any_rejected = Boolean(existing.rejected || notification.rejected);
    const all_read = Boolean((existing.read && notification.read) || any_approved || any_rejected);

    grouped_by_key.set(group_key, {
      ...preferred_record,
      relatedDocIds: merged_doc_ids,
      approved: any_approved,
      rejected: any_rejected,
      read: all_read,
    });
  }

  return Array.from(grouped_by_key.values())
    .sort(
      (left_item, right_item) =>
        new Date(right_item.createdAt).getTime() - new Date(left_item.createdAt).getTime(),
    )
    .slice(0, MAX_DISPLAYED_NOTIFICATIONS);
}
