/**
 * @fileoverview Shared TypeScript definitions for Zero Trust authentication, RBAC roles, and directory users.
 */

/** System role identifiers enforced in UI guards, Cloud Functions, and Firestore rules. */
export type UserRole = "admin" | "area_lead" | "user" | "intern" | "viewer";

/** Fine-grained permission flags derived from roles and optional custom overrides. */
export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageAssignment: boolean;
  canViewArea: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
}

/** Full authenticated user profile persisted under Firestore `/users/{uid}`. */
export interface UserProfile {
  uid: string;
  name: string;
  firstName?: string | undefined;
  paternalLastName?: string | undefined;
  maternalLastName?: string | undefined;
  email: string;
  role: UserRole;
  permissions?: Partial<UserPermissions> | undefined;
  area: string;
  position?: string | undefined;
  plant?: string | undefined;
  phone?: string | undefined;
  avatarUrl?: string | undefined;
  bio?: string | undefined;
  approved?: boolean | undefined;
  emailVerified?: boolean | undefined;
  verifiedByAdmin?: boolean | undefined;
  temporaryAccount?: boolean | undefined;
  activeDays?: number | undefined;
  expiresAt?: string | undefined;
  expiresAtMs?: number | undefined;
  lastVerificationSentAt?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

/** Non-sensitive directory projection exposed via `/user_directory/{uid}`. */
export interface DirectoryUserProjection {
  uid: string;
  name: string;
  email: string;
  area: string;
  position?: string | undefined;
  plant?: string | undefined;
  role: UserRole;
  avatarUrl?: string | undefined;
  approved?: boolean | undefined;
}

/** Unified collaborator record exposed across directory pickers and admin tables. */
export interface DirectoryUser {
  uid?: string | undefined;
  name: string;
  email: string;
  area?: string | undefined;
  position?: string | undefined;
  plant?: string | undefined;
  avatarUrl?: string | undefined;
  role?: UserRole | undefined;
  permissions?: Partial<UserPermissions> | undefined;
  approved?: boolean | undefined;
  emailVerified?: boolean | undefined;
  verifiedByAdmin?: boolean | undefined;
  temporaryAccount?: boolean | undefined;
  activeDays?: number | undefined;
  expiresAt?: string | undefined;
  expiresAtMs?: number | undefined;
  lastVerificationSentAt?: string | undefined;
  createdAt?: string | undefined;
}

/** Target descriptor for admin-triggered verification or activation emails. */
export interface AdminVerificationTarget {
  uid?: string | undefined;
  email: string;
  temporaryAccount?: boolean | undefined;
}

/** Public API exposed by the `useAuth()` React context hook. */
export interface AuthContextType {
  currentUser: UserProfile | null;
  permissions: UserPermissions;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string, pass: string) => Promise<void>;
  sendAdminVerificationLink: (
    target: AdminVerificationTarget,
  ) => Promise<"verification_email" | "activation_reset_email">;
  approveUserVerification: (uid: string) => Promise<void>;
  updateUserProfile: (
    updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  usersList: DirectoryUser[];
}

/** Result returned by corporate email validation helpers. */
export interface CorporateEmailValidationResult {
  valid: boolean;
  normalized: string;
  error?: string | undefined;
}

/** Normalized Firebase/runtime error payload fields. */
export interface AuthErrorLike {
  code?: string | undefined;
  message?: string | undefined;
}

/** Optional metadata communicated when self-registration completes. */
export interface RegisterSuccessOptions {
  verificationSent?: boolean | undefined;
  verificationError?: string | undefined;
}
