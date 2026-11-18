/**
 * @fileoverview Shared TypeScript model for realtime user and access-request notifications.
 */

/** Represents a Firestore notification document displayed inside `NotificationBell`. */
export interface AppNotification {
  id: string;
  relatedDocIds?: string[] | undefined;
  senderUid?: string | undefined;
  userId: string;
  recipientUid?: string | undefined;
  recipientEmail?: string | undefined;
  recipientRole?: string | undefined;
  forAdmins?: boolean | undefined;
  creatorName?: string | undefined;
  creatorEmail?: string | undefined;
  responsibleNames?: string[] | undefined;
  responsibleEmails?: string[] | undefined;
  type?: string | undefined;
  module?: "PDCA" | "RDA" | undefined;
  folioOrCode?: string | undefined;
  pdcaId?: string | undefined;
  rdaId?: string | undefined;
  pdcaTitle: string;
  actionId: string;
  requesterUid?: string | undefined;
  requesterName?: string | undefined;
  requesterEmail?: string | undefined;
  customNote?: string | undefined;
  approved?: boolean | undefined;
  rejected?: boolean | undefined;
  message: string;
  read: boolean;
  createdAt: string;
}
