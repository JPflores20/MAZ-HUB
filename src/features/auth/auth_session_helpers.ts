/**
 * @fileoverview Extracted Firebase authentication and role-scoped subscription helpers for `AuthProvider`.
 */

import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import type { UserProfile } from "./auth_types";
import {
  CORPORATE_EMAIL_ERROR,
  is_account_expired,
  is_corporate_email,
  is_temporary_intern_account,
  send_verification_email_safely,
  validate_general_email,
} from "./email_validation";
import { normalize_user_role } from "./role_normalization";
import { map_directory_entry, subscribe_to_role_directory } from "./user_directory_service";
import { user_service } from "./user_service";

export { map_directory_entry, subscribe_to_role_directory };

/** Ensures a verified corporate or temporary intern user has a synced Firestore profile. */
async function resolve_or_sync_verified_profile(firebase_user: User): Promise<UserProfile | null> {
  let user_profile = await user_service.get_user(firebase_user.uid);
  if (!user_profile || user_profile.approved !== true) {
    try {
      await user_service.sync_verified_profile();
      if (typeof firebase_user.getIdToken === "function") {
        await firebase_user.getIdToken(true);
      }
      user_profile = await user_service.get_user(firebase_user.uid);
    } catch (sync_error) {
      console.error("Error sincronizando perfil verificado:", sync_error);
    }
  }
  return user_profile;
}

/** Resolves a verified, approved `UserProfile` from a Firebase Auth user snapshot, or returns null. */
export async function resolve_verified_approved_profile(
  firebase_user: User,
): Promise<UserProfile | null> {
  const email_lower = (firebase_user.email || "").trim().toLowerCase();
  if (!firebase_user.emailVerified || !validate_general_email(email_lower).valid) {
    return null;
  }

  const user_profile = await resolve_or_sync_verified_profile(firebase_user);
  const is_allowed = is_corporate_email(email_lower) || is_temporary_intern_account(user_profile);
  if (
    !user_profile ||
    !is_allowed ||
    user_profile.approved !== true ||
    is_account_expired(user_profile)
  ) {
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

/** Authenticates with Firebase Auth and grants access for verified corporate users or active temporary interns. */
export async function sign_in_corporate_user(
  raw_email: string,
  raw_password: string,
): Promise<UserProfile> {
  const email_validation = validate_general_email(raw_email);
  if (!email_validation.valid) {
    throw new Error(email_validation.error || "Ingresa un correo electrónico válido.");
  }
  const email_lower = email_validation.normalized;

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

  const user_profile = await resolve_or_sync_verified_profile(firebase_user);
  const is_allowed_identity =
    is_corporate_email(email_lower) || is_temporary_intern_account(user_profile);
  if (!is_allowed_identity) {
    await signOut(primary_auth).catch(() => {});
    throw new Error(CORPORATE_EMAIL_ERROR);
  }
  if (is_account_expired(user_profile)) {
    await signOut(primary_auth).catch(() => {});
    throw new Error("Tu acceso temporal como becario ha expirado. Contacta al administrador.");
  }
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
  const email_validation = validate_general_email(raw_email);
  if (!email_validation.normalized || !raw_password) {
    throw new Error(
      "Ingresa tu correo electrónico y contraseña para reenviar el enlace de verificación.",
    );
  }
  if (!email_validation.valid) {
    throw new Error(email_validation.error || "Ingresa un correo electrónico válido.");
  }
  const email_lower = email_validation.normalized;

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
