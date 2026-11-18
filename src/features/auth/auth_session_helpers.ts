/**
 * @fileoverview Extracted Firebase authentication and role-scoped subscription helpers for `AuthProvider`.
 */

import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";
import { primary_auth } from "@/core/config/firebase";
import type { DirectoryUser, DirectoryUserProjection, UserProfile } from "./auth_types";
import {
  CORPORATE_EMAIL_ERROR,
  is_corporate_email,
  send_verification_email_safely,
} from "./email_validation";
import { normalize_user_role } from "./role_permissions";
import { user_service } from "./user_service";

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
    ...("lastVerificationSentAt" in source_user && source_user.lastVerificationSentAt
      ? { lastVerificationSentAt: source_user.lastVerificationSentAt }
      : {}),
    ...("createdAt" in source_user && source_user.createdAt
      ? { createdAt: source_user.createdAt }
      : {}),
  };
}

/** Resolves a verified, approved `UserProfile` from a Firebase Auth user snapshot, or returns null. */
export async function resolve_verified_approved_profile(
  firebase_user: User,
): Promise<UserProfile | null> {
  const email_lower = (firebase_user.email || "").trim().toLowerCase();
  if (!firebase_user.emailVerified || !is_corporate_email(email_lower)) {
    return null;
  }

  const user_profile = await user_service.get_user(firebase_user.uid);
  if (!user_profile || user_profile.approved !== true) {
    return null;
  }

  if (user_profile.emailVerified !== true) {
    await user_service.mark_user_verified(firebase_user.uid, false).catch(() => {});
  }

  return {
    ...user_profile,
    uid: firebase_user.uid,
    name: user_profile.name || firebase_user.displayName || "Usuario",
    email: email_lower,
    role: normalize_user_role(user_profile.role),
    area: user_profile.area || "Usuario",
    approved: true,
    emailVerified: true,
  };
}

/** Authenticates with Firebase Auth and enforces corporate domain, email verification, and admin approval. */
export async function sign_in_corporate_user(
  raw_email: string,
  raw_password: string,
): Promise<UserProfile> {
  const email_lower = raw_email.trim().toLowerCase();
  if (!is_corporate_email(email_lower)) {
    throw new Error(CORPORATE_EMAIL_ERROR);
  }

  const user_credential = await signInWithEmailAndPassword(primary_auth, email_lower, raw_password);
  const firebase_user = user_credential.user;
  if (!firebase_user.emailVerified) {
    await firebase_user.reload().catch(() => {});
  }

  if (!firebase_user.emailVerified) {
    await signOut(primary_auth).catch(() => {});
    throw new Error(
      "Por favor, verifica tu correo electrónico usando el enlace que te enviamos antes de iniciar sesión.",
    );
  }

  const user_profile = await user_service.get_user(firebase_user.uid);
  if (!user_profile || user_profile.approved !== true) {
    await signOut(primary_auth).catch(() => {});
    throw new Error(
      "Tu cuenta está pendiente de aprobación por un administrador antes de poder acceder.",
    );
  }

  if (user_profile.emailVerified !== true) {
    await user_service.mark_user_verified(firebase_user.uid, false).catch(() => {});
  }

  return {
    ...user_profile,
    uid: firebase_user.uid,
    email: email_lower,
    role: normalize_user_role(user_profile.role),
    approved: true,
    emailVerified: true,
  };
}

/** Signs in temporarily inside a `finally`-guarded block to re-dispatch an email verification link. */
export async function resend_verification_link_for_user(
  raw_email: string,
  raw_password: string,
): Promise<void> {
  const email_lower = raw_email.trim().toLowerCase();
  if (!email_lower || !raw_password) {
    throw new Error(
      "Ingresa tu correo electrónico y contraseña para reenviar el enlace de verificación.",
    );
  }
  if (!is_corporate_email(email_lower)) {
    throw new Error(CORPORATE_EMAIL_ERROR);
  }

  primary_auth.languageCode = "es";
  const user_credential = await signInWithEmailAndPassword(primary_auth, email_lower, raw_password);
  try {
    await user_credential.user.reload().catch(() => {});
    if (user_credential.user.emailVerified) {
      throw new Error("Tu correo electrónico ya está verificado. Ya puedes iniciar sesión.");
    }
    await send_verification_email_safely(user_credential.user);
    await user_service.record_verification_sent(user_credential.user.uid).catch(() => {});
  } finally {
    await signOut(primary_auth).catch(() => {});
  }
}

/** Attaches either full `/users` stream (admins) or `/user_directory` stream (standard users). */
export function subscribe_to_role_directory(
  user_role: string,
  on_entries: (entries: DirectoryUser[]) => void,
): Unsubscribe {
  if (user_role === "admin") {
    return user_service.subscribe_to_users(
      (admin_users) => on_entries(admin_users.map(map_directory_entry)),
      (directory_error) => {
        console.error("Error fetching users snapshot:", directory_error);
        on_entries([]);
      },
    );
  }
  return user_service.subscribe_to_user_directory(
    (directory_users) => on_entries(directory_users.map(map_directory_entry)),
    (directory_error) => {
      console.error("Error fetching user directory snapshot:", directory_error);
      on_entries([]);
    },
  );
}
