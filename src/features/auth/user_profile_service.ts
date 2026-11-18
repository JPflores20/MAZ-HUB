/**
 * @fileoverview Firestore CRUD and own-profile subscription helpers for `/users/{uid}`.
 * Enforces Zero Trust defaults (`role: "user"`, `approved: false`) on client self-registration.
 */

import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type { UserProfile } from "./auth_types";
import { map_user_snapshot } from "./user_directory_service";

const USERS_COLLECTION = "users";

const SELF_EDITABLE_PROFILE_KEYS = new Set([
  "name",
  "firstName",
  "paternalLastName",
  "maternalLastName",
  "area",
  "position",
  "plant",
  "phone",
  "bio",
  "avatarUrl",
]);

/** Fetches a user's profile document from `/users/{uid}` or returns null when absent. */
export async function get_user_profile(user_uid: string): Promise<UserProfile | null> {
  const user_snapshot = await getDoc(doc(db, USERS_COLLECTION, user_uid));
  if (user_snapshot.exists()) {
    return map_user_snapshot(user_uid, user_snapshot.data() as Record<string, unknown>);
  }
  return null;
}

/** Subscribes in real time to changes on the authenticated user's own `/users/{uid}` document. */
export function subscribe_to_own_user_profile(
  user_uid: string,
  on_profile: (profile: UserProfile | null) => void,
  on_error: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, USERS_COLLECTION, user_uid),
    (doc_snapshot) => {
      if (!doc_snapshot.exists()) {
        on_profile(null);
        return;
      }
      on_profile(map_user_snapshot(doc_snapshot.id, doc_snapshot.data() as Record<string, unknown>));
    },
    (snapshot_error) => on_error(snapshot_error),
  );
}

/** Creates an unprivileged initial `/users/{uid}` profile awaiting admin approval. */
export async function create_user_profile(
  user_uid: string,
  profile_input: Omit<UserProfile, "uid">,
): Promise<void> {
  const clean_payload: Record<string, unknown> = {
    uid: user_uid,
    name: profile_input.name,
    email: profile_input.email.trim().toLowerCase(),
    role: "user",
    area: profile_input.area || "Usuario",
    approved: false,
    verifiedByAdmin: false,
    emailVerified: Boolean(profile_input.emailVerified),
    createdAt: profile_input.createdAt || new Date().toISOString(),
    updatedAt: profile_input.updatedAt || new Date().toISOString(),
  };
  if (profile_input.firstName) clean_payload["firstName"] = profile_input.firstName;
  if (profile_input.paternalLastName) {
    clean_payload["paternalLastName"] = profile_input.paternalLastName;
  }
  if (profile_input.maternalLastName) {
    clean_payload["maternalLastName"] = profile_input.maternalLastName;
  }
  if (profile_input.position) clean_payload["position"] = profile_input.position;
  if (profile_input.plant) clean_payload["plant"] = profile_input.plant;
  if (profile_input.lastVerificationSentAt) {
    clean_payload["lastVerificationSentAt"] = profile_input.lastVerificationSentAt;
  }

  await setDoc(doc(db, USERS_COLLECTION, user_uid), clean_payload);
}

/** Updates allowed profile fields using strict allowlists depending on admin vs self-edit mode. */
export async function update_user_profile_fields(
  user_uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  is_admin_editing = false,
): Promise<void> {
  const safe_updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  for (const [field_key, field_value] of Object.entries(updates)) {
    if (field_value === undefined) continue;
    if (is_admin_editing) {
      if (field_key !== "uid" && field_key !== "email" && field_key !== "password") {
        safe_updates[field_key] = field_value;
      }
    } else if (SELF_EDITABLE_PROFILE_KEYS.has(field_key)) {
      safe_updates[field_key] = field_value;
    }
  }
  await setDoc(doc(db, USERS_COLLECTION, user_uid), safe_updates, { merge: true });
}

/** Marks `emailVerified: true` on `/users/{uid}` when Auth confirms verification. */
export async function mark_user_email_verified(user_uid: string): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, user_uid),
    {
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Records the timestamp of the most recently dispatched verification email. */
export async function record_verification_sent_timestamp(user_uid: string): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, user_uid),
    {
      lastVerificationSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
