/**
 * @fileoverview Privileged Cloud Function callables and full admin `/users` collection subscription.
 */

import { collection, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/core/config/firebase";
import type { UserPermissions, UserProfile, UserRole } from "./auth_types";
import { map_user_snapshot } from "./user_directory_service";

const USERS_COLLECTION = "users";

/** Creates a user via the isolated `adminCreateUser` Cloud Function without altering the active admin session. */
export async function admin_create_user(create_input: {
  email: string;
  name: string;
  area: string;
  position?: string;
  role: UserRole;
  permissions?: Partial<UserPermissions>;
  password?: string;
  activeDays?: number;
}): Promise<{
  uid: string;
  email: string;
  role: UserRole;
  approved: boolean;
  temporaryAccount?: boolean;
  activeDays?: number;
  expiresAt?: string;
  expiresAtMs?: number;
}> {
  const create_callable = httpsCallable<
    typeof create_input,
    {
      uid: string;
      email: string;
      role: UserRole;
      approved: boolean;
      temporaryAccount?: boolean;
      activeDays?: number;
      expiresAt?: string;
      expiresAtMs?: number;
    }
  >(functions, "adminCreateUser");
  const callable_response = await create_callable(create_input);
  return callable_response.data;
}

/** Updates role, granular permissions, approval status, area, or temporary duration through `adminUpdateUserAccess`. */
export async function admin_update_user_access(update_input: {
  uid: string;
  role?: UserRole;
  permissions?: Partial<UserPermissions>;
  approved?: boolean;
  verifiedByAdmin?: boolean;
  area?: string;
  activeDays?: number;
}): Promise<{ uid: string; role: UserRole; approved: boolean }> {
  const update_callable = httpsCallable<
    typeof update_input,
    { uid: string; role: UserRole; approved: boolean }
  >(functions, "adminUpdateUserAccess");
  const callable_response = await update_callable(update_input);
  return callable_response.data;
}

/** Updates a user's system role and default permission preset cleanly on the backend. */
export async function update_user_role_via_admin(
  target_uid: string,
  next_role: UserRole,
  explicit_permissions?: Partial<UserPermissions>,
): Promise<void> {
  let permissions_payload = explicit_permissions;
  if (!permissions_payload) {
    const { ROLE_DEFAULT_PERMISSIONS } = await import("./role_permissions");
    permissions_payload = ROLE_DEFAULT_PERMISSIONS[next_role];
  }
  await admin_update_user_access({
    uid: target_uid,
    role: next_role,
    permissions: permissions_payload,
  });
}

/** Deletes a user from both Firebase Auth and Firestore using `adminDeleteUser`. */
export async function admin_delete_user(target_uid: string): Promise<void> {
  const delete_callable = httpsCallable<{ uid: string }, { deletedUid: string }>(
    functions,
    "adminDeleteUser",
  );
  await delete_callable({ uid: target_uid });
}

/** Reconciles an already email-verified corporate user into an approved Firestore profile on the server. */
export async function sync_verified_profile(): Promise<{
  uid: string;
  role: UserRole;
  approved: boolean;
  emailVerified: boolean;
}> {
  const sync_callable = httpsCallable<
    Record<string, never>,
    { uid: string; role: UserRole; approved: boolean; emailVerified: boolean }
  >(functions, "syncVerifiedProfile");
  const callable_response = await sync_callable({});
  return callable_response.data;
}

/** Syncs missing corporate Firebase Auth accounts into Firestore `/users` for admin visibility. */
export async function admin_sync_auth_users(): Promise<{
  scannedCount: number;
  createdCount: number;
  approvedCount: number;
}> {
  const sync_callable = httpsCallable<
    Record<string, never>,
    { scannedCount: number; createdCount: number; approvedCount: number }
  >(functions, "adminSyncAuthUsers");
  const callable_response = await sync_callable({});
  return callable_response.data;
}

/** Grants read access to a PDCA/RDA and resolves associated notifications via `approveAccessRequest`. */
export async function approve_access_request_callable(
  notification_id: string,
  related_doc_ids: string[],
): Promise<{ approved: boolean; targetDocId: string; module: "PDCA" | "RDA" }> {
  const approve_callable = httpsCallable<
    { notificationId: string; relatedDocIds: string[] },
    { approved: boolean; targetDocId: string; module: "PDCA" | "RDA" }
  >(functions, "approveAccessRequest");
  const callable_response = await approve_callable({
    notificationId: notification_id,
    relatedDocIds: related_doc_ids,
  });
  return callable_response.data;
}

/** Rejects an access request and clears duplicate pending notifications via `rejectAccessRequest`. */
export async function reject_access_request_callable(
  notification_id: string,
  related_doc_ids: string[],
): Promise<{ rejected: boolean }> {
  const reject_callable = httpsCallable<
    { notificationId: string; relatedDocIds: string[] },
    { rejected: boolean }
  >(functions, "rejectAccessRequest");
  const callable_response = await reject_callable({
    notificationId: notification_id,
    relatedDocIds: related_doc_ids,
  });
  return callable_response.data;
}

/** Subscribes administrators in real time to the full `/users` collection sorted by display name. */
export function subscribe_to_all_users(
  on_users: (users: UserProfile[]) => void,
  on_error: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const user_profiles: UserProfile[] = [];
      snapshot.forEach((doc_snapshot) => {
        user_profiles.push(
          map_user_snapshot(doc_snapshot.id, doc_snapshot.data() as Record<string, unknown>),
        );
      });
      user_profiles.sort((left_user, right_user) =>
        (left_user.name || "").localeCompare(right_user.name || "", "es", { sensitivity: "base" }),
      );
      on_users(user_profiles);
    },
    (snapshot_error) => on_error(snapshot_error),
  );
}
