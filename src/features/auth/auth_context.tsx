/**
 * @fileoverview Global Zero Trust authentication context provider and `useAuth` consumer hook.
 * Enforces verified corporate Firebase Auth sessions paired with Firestore `approved === true`.
 */

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import {
  dispatch_corporate_password_reset,
  persist_profile_changes,
  reauthenticate_and_change_password,
} from "./auth_profile_operations";
import {
  resend_verification_link_for_user,
  resolve_verified_approved_profile,
  sign_in_corporate_user,
  subscribe_to_role_directory,
} from "./auth_session_helpers";
import type { AuthContextType, DirectoryUser, UserPermissions, UserProfile, UserRole } from "./auth_types";
import { is_corporate_email } from "./email_validation";
import {
  get_effective_permissions,
  has_custom_permissions,
  normalize_user_role,
  PERMISSION_METADATA,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "./role_permissions";
import { user_service } from "./user_service";

export type { DirectoryUser, UserPermissions, UserProfile, UserRole };
export {
  get_effective_permissions,
  has_custom_permissions,
  normalize_user_role,
  PERMISSION_METADATA,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Provides synchronized Firebase session state, RBAC permissions, and user directory streams. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [current_user, set_current_user] = useState<UserProfile | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [users_list, set_users_list] = useState<DirectoryUser[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.removeItem("pdca_auth_user");
    const unsubscribe_auth = onAuthStateChanged(primary_auth, async (firebase_user) => {
      if (!firebase_user) {
        set_current_user(null);
        set_is_loading(false);
        return;
      }
      try {
        set_current_user(await resolve_verified_approved_profile(firebase_user));
      } catch (sync_error) {
        console.error("Error al sincronizar usuario autenticado:", sync_error);
        set_current_user(null);
      } finally {
        set_is_loading(false);
      }
    });
    return () => unsubscribe_auth();
  }, []);

  useEffect(() => {
    if (!current_user?.uid) {
      set_users_list([]);
      return undefined;
    }
    const unsubscribe_self = user_service.subscribe_to_own_user(
      current_user.uid,
      (updated_profile) => {
        if (!updated_profile || updated_profile.approved !== true) {
          set_current_user(null);
          void signOut(primary_auth).catch(() => {});
          return;
        }
        set_current_user((prev) =>
          prev
            ? {
                ...prev,
                ...updated_profile,
                uid: prev.uid,
                role: normalize_user_role(updated_profile.role),
                approved: true,
                emailVerified: true,
              }
            : prev,
        );
      },
      (listener_error) => console.error("Error escuchando perfil propio:", listener_error),
    );
    const unsubscribe_directory = subscribe_to_role_directory(current_user.role, set_users_list);
    return () => {
      unsubscribe_self();
      unsubscribe_directory();
    };
  }, [current_user?.uid, current_user?.role]);

  const login = async (raw_email: string, raw_password: string) => {
    set_current_user(await sign_in_corporate_user(raw_email, raw_password));
  };

  const logout = async () => {
    try {
      await signOut(primary_auth);
    } catch (signout_error) {
      console.error("Firebase signout error:", signout_error);
    } finally {
      set_current_user(null);
      if (typeof window !== "undefined") localStorage.removeItem("pdca_auth_user");
    }
  };

  const update_user_profile = async (
    updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => {
    if (!current_user) throw new Error("No hay sesión activa.");
    await persist_profile_changes(current_user.uid, updates);
    set_current_user((prev) =>
      prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev,
    );
  };

  const send_password_reset = async () => {
    await dispatch_corporate_password_reset(primary_auth.currentUser?.email || current_user?.email);
  };

  const send_admin_verification_link = async (target: {
    uid?: string | undefined;
    email: string;
  }): Promise<"verification_email" | "activation_reset_email"> => {
    if (current_user?.role !== "admin") {
      throw new Error("Solo los administradores pueden enviar enlaces de activación.");
    }
    const email_lower = target.email.trim().toLowerCase();
    if (!email_lower || !is_corporate_email(email_lower)) {
      throw new Error("El usuario no tiene un correo corporativo válido.");
    }
    await dispatch_corporate_password_reset(email_lower);
    return "activation_reset_email";
  };

  const approve_user_verification = async (target_uid: string) => {
    if (current_user?.role !== "admin") {
      throw new Error("Solo los administradores pueden aprobar cuentas.");
    }
    if (!target_uid || target_uid.includes("@")) {
      throw new Error("No se encontró el identificador del usuario en Firestore.");
    }
    await user_service.mark_user_verified(target_uid, true);
  };

  const context_value: AuthContextType = {
    currentUser: current_user,
    permissions: get_effective_permissions(current_user),
    loading: is_loading,
    login,
    logout,
    resendVerificationEmail: resend_verification_link_for_user,
    sendAdminVerificationLink: send_admin_verification_link,
    approveUserVerification: approve_user_verification,
    updateUserProfile: update_user_profile,
    changePassword: reauthenticate_and_change_password,
    sendPasswordReset: send_password_reset,
    usersList: users_list,
  };

  return <AuthContext.Provider value={context_value}>{!is_loading && children}</AuthContext.Provider>;
}

/** Retrieves the authenticated session context, enforcing usage inside `AuthProvider`. */
export function useAuth(): AuthContextType {
  const auth_context = useContext(AuthContext);
  if (auth_context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return auth_context;
}
