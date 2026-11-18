/**
 * @fileoverview Profile update, credential reauthentication, and password reset operations.
 */

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile as update_firebase_auth_profile,
} from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import type { UserProfile } from "./auth_types";
import { is_corporate_email } from "./email_validation";
import { user_service } from "./user_service";

/** Updates allowed profile fields in Firestore and mirrors display name changes to Firebase Auth. */
export async function persist_profile_changes(
  user_uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
): Promise<void> {
  await user_service.update_user_profile(user_uid, updates, false);

  if (updates.name && primary_auth.currentUser) {
    try {
      await update_firebase_auth_profile(primary_auth.currentUser, {
        displayName: updates.name,
      });
    } catch (auth_update_error) {
      console.warn("No se pudo actualizar displayName en Firebase Auth:", auth_update_error);
    }
  }
}

/** Reauthenticates the active Firebase user and updates their password securely. */
export async function reauthenticate_and_change_password(
  current_password: string,
  next_password: string,
): Promise<void> {
  const active_firebase_user = primary_auth.currentUser;
  if (!active_firebase_user || !active_firebase_user.email) {
    throw new Error("Debes tener una sesión activa de Firebase para cambiar la contraseña.");
  }
  const credential = EmailAuthProvider.credential(active_firebase_user.email, current_password);
  await reauthenticateWithCredential(active_firebase_user, credential);
  await updatePassword(active_firebase_user, next_password);
}

/** Dispatches a Firebase password reset email for an explicit corporate address. */
export async function dispatch_corporate_password_reset(raw_email?: string | null): Promise<void> {
  const normalized_email = (raw_email || "").trim().toLowerCase();
  if (!normalized_email || !is_corporate_email(normalized_email)) {
    throw new Error("No se encontró un correo corporativo válido asociado a tu cuenta.");
  }
  primary_auth.languageCode = "es";
  await sendPasswordResetEmail(primary_auth, normalized_email);
}
