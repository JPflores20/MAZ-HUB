/**
 * @fileoverview Firestore notification stream subscriptions and batch read-status mutations.
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type { UserProfile } from "@/features/auth/auth_context";
import type { AppNotification } from "./notification_types";

/** Collects deduplicated Firestore notification IDs belonging to a grouped notification item. */
export function collect_related_notification_ids(notification: AppNotification): string[] {
  return notification.relatedDocIds && notification.relatedDocIds.length > 0
    ? notification.relatedDocIds
    : [notification.id];
}

/** Subscribes in real time to notifications scoped by admin role or user UID/email queries. */
export function subscribe_to_notifications(
  current_user: UserProfile,
  on_notifications: (items: AppNotification[]) => void,
): Unsubscribe {
  const handle_snapshot_error = (stream_error: unknown) => {
    console.error("Error escuchando notificaciones en tiempo real:", stream_error);
  };

  if (current_user.role === "admin") {
    return onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const collected: AppNotification[] = [];
        snapshot.forEach((doc_snapshot) => {
          collected.push({ id: doc_snapshot.id, ...doc_snapshot.data() } as AppNotification);
        });
        on_notifications(collected);
      },
      handle_snapshot_error,
    );
  }

  const email_lower = (current_user.email || "").trim().toLowerCase();
  const bucket_map = new Map<string, AppNotification[]>();
  const sync_merged = () => {
    const merged_by_id = new Map<string, AppNotification>();
    bucket_map.forEach((bucket_docs) => {
      bucket_docs.forEach((doc_item) => merged_by_id.set(doc_item.id, doc_item));
    });
    on_notifications(Array.from(merged_by_id.values()));
  };

  const user_queries = [
    {
      key: "recipientUid",
      q: query(collection(db, "notifications"), where("recipientUid", "==", current_user.uid)),
    },
    {
      key: "requesterUid",
      q: query(collection(db, "notifications"), where("requesterUid", "==", current_user.uid)),
    },
    ...(email_lower
      ? [
          {
            key: "recipientEmail",
            q: query(collection(db, "notifications"), where("recipientEmail", "==", email_lower)),
          },
          {
            key: "creatorEmail",
            q: query(collection(db, "notifications"), where("creatorEmail", "==", email_lower)),
          },
        ]
      : []),
  ];

  const unsubscribers = user_queries.map(({ key, q }) =>
    onSnapshot(
      q,
      (snapshot) => {
        bucket_map.set(
          key,
          snapshot.docs.map((doc_snapshot) => ({
            id: doc_snapshot.id,
            ...(doc_snapshot.data() as Omit<AppNotification, "id">),
          })),
        );
        sync_merged();
      },
      handle_snapshot_error,
    ),
  );

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

/** Batch-marks one notification or a list of unread notifications as `read: true`. */
export async function mark_notifications_read(targets: AppNotification[]): Promise<void> {
  if (targets.length === 0) return;
  try {
    const batch = writeBatch(db);
    targets.forEach((notification) => {
      collect_related_notification_ids(notification).forEach((doc_id) => {
        batch.update(doc(db, "notifications", doc_id), { read: true });
      });
    });
    await batch.commit();
  } catch (update_error) {
    console.error("Error marking notifications as read:", update_error);
  }
}
