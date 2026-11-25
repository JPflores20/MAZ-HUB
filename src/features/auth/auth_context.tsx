/**
 * @fileoverview Global Zero Trust authentication context provider and `useAuth` consumer hook.
 * Enforces verified corporate Firebase Auth sessions paired with Firestore `approved === true`.
 */

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import {
  dispatch_admin_activation_link,
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
import type {
  AdminVerificationTarget,
  AuthContextType,
  DirectoryUser,
  UserPermissions,
  UserProfile,
  UserRole,
} from "./auth_types";
import { is_account_expired, is_temporary_intern_account } from "./email_validation";
import { EMPTY_PERMISSIONS, normalize_user_role } from "./role_normalization";
import { user_service } from "./user_service";

export type { DirectoryUser, UserPermissions, UserProfile, UserRole };

type PermissionsResolver = (user: UserProfile | null) => UserPermissions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Provides synchronized Firebase session state, RBAC permissions, and user directory streams. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [current_user, set_current_user] = useState<UserProfile | null>(null);
  const [resolved_permissions, set_resolved_permissions] = useState(EMPTY_PERMISSIONS);
  const [is_loading, set_is_loading] = useState(true);
  const [users_list, set_users_list] = useState<DirectoryUser[]>([]);
  const resolver_ref = useRef<PermissionsResolver | null>(null);

  const compute_authenticated_permissions = useCallback(async (profile: UserProfile | null) => {
    if (!profile) {
      set_resolved_permissions(EMPTY_PERMISSIONS);
      return;
    }
    if (!resolver_ref.current) {
      const { get_effective_permissions } = await import("./role_permissions");
      resolver_ref.current = get_effective_permissions;
    }
    set_resolved_permissions(resolver_ref.current(profile));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.removeItem("pdca_auth_user");
    const unsubscribe_auth = onAuthStateChanged(primary_auth, async (firebase_user) => {
      if (!firebase_user) {
        set_current_user(null);
        set_resolved_permissions(EMPTY_PERMISSIONS);
        set_is_loading(false);
        return;
      }
      try {
        const profile = await resolve_verified_approved_profile(firebase_user);
        await compute_authenticated_permissions(profile);
        set_current_user(profile);
      } catch (sync_error) {
        console.error("Error al sincronizar usuario autenticado:", sync_error);
        set_current_user(null);
        set_resolved_permissions(EMPTY_PERMISSIONS);
      } finally {
        set_is_loading(false);
      }
    });
    return () => unsubscribe_auth();
  }, [compute_authenticated_permissions]);

  useEffect(() => {
    if (!current_user?.uid) {
      set_users_list([]);
      return undefined;
    }
    const unsubscribe_self = user_service.subscribe_to_own_user(
      current_user.uid,
      (updated_profile) => {
        if (
          !updated_profile ||
          updated_profile.approved !== true ||
          is_account_expired(updated_profile)
        ) {
          set_current_user(null);
          set_resolved_permissions(EMPTY_PERMISSIONS);
          void signOut(primary_auth).catch(() => {});
          return;
        }
        set_current_user((prev) => {
          if (!prev) return prev;
          const merged_profile: UserProfile = {
            ...prev,
            ...updated_profile,
            uid: prev.uid,
            role: normalize_user_role(updated_profile.role),
            approved: true,
            emailVerified: true,
          };
          void compute_authenticated_permissions(merged_profile);
          return merged_profile;
        });
      },
      (listener_error) => console.error("Error escuchando perfil propio:", listener_error),
    );
    const unsubscribe_directory = subscribe_to_role_directory(current_user.role, set_users_list);
    return () => {
      unsubscribe_self();
      unsubscribe_directory();
    };
  }, [current_user?.uid, current_user?.role, compute_authenticated_permissions]);

  const login = async (raw_email: string, raw_password: string) => {
    const profile = await sign_in_corporate_user(raw_email, raw_password);
    await compute_authenticated_permissions(profile);
    set_current_user(profile);
  };

  const logout = async () => {
    try {
      await signOut(primary_auth);
    } catch (signout_error) {
      console.error("Firebase signout error:", signout_error);
    } finally {
      set_current_user(null);
      set_resolved_permissions(EMPTY_PERMISSIONS);
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
    await dispatch_corporate_password_reset(
      primary_auth.currentUser?.email || current_user?.email,
      is_temporary_intern_account(current_user),
    );
  };

  const send_admin_verification_link = async (target: AdminVerificationTarget) =>
    dispatch_admin_activation_link(current_user?.role, target);

  const approve_user_verification = async (target_uid: string) => {
    if (current_user?.role !== "admin")
      throw new Error("Solo los administradores pueden aprobar cuentas.");
    if (!target_uid || target_uid.includes("@")) {
      throw new Error("No se encontró el identificador del usuario en Firestore.");
    }
    await user_service.mark_user_verified(target_uid, true);
  };

  const context_value: AuthContextType = {
    currentUser: current_user,
    permissions: resolved_permissions,
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

  return (
    <AuthContext.Provider value={context_value}>{!is_loading && children}</AuthContext.Provider>
  );
}

/** Retrieves the authenticated session context, enforcing usage inside `AuthProvider`. */
export function useAuth(): AuthContextType {
  const auth_context = useContext(AuthContext);
  if (auth_context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return auth_context;
}
