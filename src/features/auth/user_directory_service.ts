/**
 * @fileoverview Snapshot mapper and realtime directory subscription for `/user_directory`.
 */

import { collection, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type { DirectoryUserProjection, UserPermissions, UserProfile } from "./auth_types";
import { normalize_user_role } from "./role_permissions";

const USER_DIRECTORY_COLLECTION = "user_directory";

/** Maps a raw Firestore document record to a strictly typed `UserProfile`. */
export function map_user_snapshot(
  user_uid: string,
  raw_fields: Record<string, unknown>,
): UserProfile {
  return {
    uid: user_uid,
    name: (raw_fields["name"] as string) || "Usuario",
    firstName: (raw_fields["firstName"] as string) || "",
    paternalLastName: (raw_fields["paternalLastName"] as string) || "",
    maternalLastName: (raw_fields["maternalLastName"] as string) || "",
    email: ((raw_fields["email"] as string) || "").trim().toLowerCase(),
    role: normalize_user_role(raw_fields["role"] as string),
    permissions: (raw_fields["permissions"] as Partial<UserPermissions>) || undefined,
    area: (raw_fields["area"] as string) || "Usuario",
    position: (raw_fields["position"] as string) || "",
    plant: (raw_fields["plant"] as string) || "",
    phone: (raw_fields["phone"] as string) || "",
    avatarUrl: (raw_fields["avatarUrl"] as string) || "",
    bio: (raw_fields["bio"] as string) || "",
    approved: typeof raw_fields["approved"] === "boolean" ? raw_fields["approved"] : undefined,
    emailVerified:
      typeof raw_fields["emailVerified"] === "boolean" ? raw_fields["emailVerified"] : undefined,
    verifiedByAdmin:
      typeof raw_fields["verifiedByAdmin"] === "boolean"
        ? raw_fields["verifiedByAdmin"]
        : undefined,
    lastVerificationSentAt: (raw_fields["lastVerificationSentAt"] as string) || undefined,
    createdAt: raw_fields["createdAt"] as string,
    updatedAt: raw_fields["updatedAt"] as string,
  };
}

/** Subscribes to approved collaborator projections from `/user_directory`. */
export function subscribe_to_user_directory(
  on_directory: (users: DirectoryUserProjection[]) => void,
  on_error: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, USER_DIRECTORY_COLLECTION),
    (snapshot) => {
      const directory_list: DirectoryUserProjection[] = [];
      snapshot.forEach((doc_snapshot) => {
        const raw_fields = doc_snapshot.data() as Record<string, unknown>;
        if (raw_fields["approved"] !== true) return;
        directory_list.push({
          uid: doc_snapshot.id,
          name: (raw_fields["name"] as string) || "Usuario",
          email: ((raw_fields["email"] as string) || "").trim().toLowerCase(),
          area: (raw_fields["area"] as string) || "Usuario",
          ...(raw_fields["position"] ? { position: String(raw_fields["position"]) } : {}),
          ...(raw_fields["plant"] ? { plant: String(raw_fields["plant"]) } : {}),
          role: normalize_user_role(raw_fields["role"] as string),
          ...(raw_fields["avatarUrl"] ? { avatarUrl: String(raw_fields["avatarUrl"]) } : {}),
          approved: true,
        });
      });
      directory_list.sort((left_user, right_user) =>
        (left_user.name || "").localeCompare(right_user.name || "", "es", { sensitivity: "base" }),
      );
      on_directory(directory_list);
    },
    (snapshot_error) => on_error(snapshot_error),
  );
}
