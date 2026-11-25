/**
 * @fileoverview Snapshot mapper and realtime directory subscription for `/user_directory`.
 */

import { collection, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type {
  DirectoryUser,
  DirectoryUserProjection,
  UserPermissions,
  UserProfile,
} from "./auth_types";
import { normalize_user_role } from "./role_normalization";
import { subscribe_to_all_users } from "./user_admin_service";

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
    temporaryAccount:
      typeof raw_fields["temporaryAccount"] === "boolean"
        ? raw_fields["temporaryAccount"]
        : undefined,
    activeDays: typeof raw_fields["activeDays"] === "number" ? raw_fields["activeDays"] : undefined,
    expiresAt: (raw_fields["expiresAt"] as string) || undefined,
    expiresAtMs:
      typeof raw_fields["expiresAtMs"] === "number" ? raw_fields["expiresAtMs"] : undefined,
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

/** Maps either a private `/users` profile or public `/user_directory` record into `DirectoryUser`. */
export function map_directory_entry(
  source_user: UserProfile | DirectoryUserProjection,
): DirectoryUser {
  return {
    uid: source_user.uid,
    name: source_user.name,
    email: source_user.email,
    area: source_user.area,
    position: source_user.position,
    plant: source_user.plant,
    avatarUrl: source_user.avatarUrl,
    role: source_user.role,
    approved: source_user.approved,
    ...("permissions" in source_user && source_user.permissions
      ? { permissions: source_user.permissions }
      : {}),
    ...("emailVerified" in source_user && typeof source_user.emailVerified === "boolean"
      ? { emailVerified: source_user.emailVerified }
      : {}),
    ...("verifiedByAdmin" in source_user && typeof source_user.verifiedByAdmin === "boolean"
      ? { verifiedByAdmin: source_user.verifiedByAdmin }
      : {}),
    ...("temporaryAccount" in source_user && typeof source_user.temporaryAccount === "boolean"
      ? { temporaryAccount: source_user.temporaryAccount }
      : {}),
    ...("activeDays" in source_user && typeof source_user.activeDays === "number"
      ? { activeDays: source_user.activeDays }
      : {}),
    ...("expiresAt" in source_user && source_user.expiresAt
      ? { expiresAt: source_user.expiresAt }
      : {}),
    ...("expiresAtMs" in source_user && typeof source_user.expiresAtMs === "number"
      ? { expiresAtMs: source_user.expiresAtMs }
      : {}),
    ...("lastVerificationSentAt" in source_user && source_user.lastVerificationSentAt
      ? { lastVerificationSentAt: source_user.lastVerificationSentAt }
      : {}),
    ...("createdAt" in source_user && source_user.createdAt
      ? { createdAt: source_user.createdAt }
      : {}),
  };
}

/** Attaches either full `/users` stream (admins) or `/user_directory` stream (standard users). */
export function subscribe_to_role_directory(
  user_role: string,
  on_entries: (entries: DirectoryUser[]) => void,
): Unsubscribe {
  if (user_role === "admin") {
    return subscribe_to_all_users(
      (admin_users) => on_entries(admin_users.map(map_directory_entry)),
      (directory_error) => {
        console.error("Error fetching users snapshot:", directory_error);
        on_entries([]);
      },
    );
  }
  return subscribe_to_user_directory(
    (directory_users) => on_entries(directory_users.map(map_directory_entry)),
    (directory_error) => {
      console.error("Error fetching user directory snapshot:", directory_error);
      on_entries([]);
    },
  );
}
