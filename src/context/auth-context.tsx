/**
 * auth-context.tsx
 * Contexto global de autenticación. Gestiona la sesión de Firebase Auth, perfil de usuario, rol (admin/user) y cierre por inactividad.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { primaryAuth, secondaryAuth } from "@/lib/firebase";
import {
  userService,
  UserRole,
  UserProfile,
  UserPermissions,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_METADATA,
  getEffectivePermissions,
  hasCustomPermissions,
  normalizeUserRole,
} from "@/services/user-service";

export type { UserRole, UserProfile, UserPermissions };
export {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_METADATA,
  getEffectivePermissions,
  hasCustomPermissions,
  normalizeUserRole,
};

export interface DirectoryUser {
  uid?: string | undefined;
  name: string;
  email: string;
  area?: string | undefined;
  position?: string | undefined;
  avatarUrl?: string | undefined;
  role?: UserRole | undefined;
  permissions?: Partial<UserPermissions> | undefined;
  password?: string | undefined;
  emailVerified?: boolean | undefined;
  verifiedByAdmin?: boolean | undefined;
  lastVerificationSentAt?: string | undefined;
  createdAt?: string | undefined;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  permissions: UserPermissions;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string, pass: string) => Promise<void>;
  sendAdminVerificationLink: (target: {
    uid?: string | undefined;
    email: string;
  }) => Promise<"verification_email" | "activation_reset_email">;
  approveUserVerification: (uid: string) => Promise<void>;
  updateUserProfile: (
    updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  syncCurrentPassword: (passwordToVerify: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  // For the admin panel to add users to state
  setMockUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  mockUsers: UserProfile[];
  addMockUser: (user: UserProfile & { pass: string }) => void;
  // Cached users list for user directory & assignment
  usersList: DirectoryUser[];
}

// Fallback users for when Firebase is down or not configured
const INITIAL_MOCK_USERS: (UserProfile & { pass: string })[] = [
  {
    uid: "mock-admin-123",
    name: "Administrador Global",
    email: "admin@gmodelo.com.mx",
    pass: "admin123",
    password: "admin123",
    role: "admin",
    area: "COCIMIENTOS",
    position: "GERENTE",
  },
  {
    uid: "mock-user-456",
    name: "Ana López",
    email: "ana.lopez@gmodelo.com.mx",
    pass: "ana123",
    password: "ana123",
    role: "user",
    area: "BLOQUE FRIO",
    position: "SUPERVISOR",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAdminEmail = (email: string) => {
  const emailLower = email.trim().toLowerCase();
  return emailLower.includes("jose.floresc-ext");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<DirectoryUser[]>([]);

  // Local state for fallback users (allows Admin to add to it)
  const [mockUsers, setMockUsers] = useState<UserProfile[]>(
    INITIAL_MOCK_USERS.map(({ pass, ...rest }) => ({ ...rest, password: rest.password || pass })),
  );

  const [mockCredentials, setMockCredentials] = useState(INITIAL_MOCK_USERS);

  useEffect(() => {
    const unsub = onAuthStateChanged(primaryAuth, async (user) => {
      if (user) {
        const threshold = new Date("2026-09-01T21:00:00Z").getTime();
        const creationTime = new Date(user.metadata.creationTime || 0).getTime();
        const isLegacyUser = creationTime < threshold;

        try {
          const userProfile = await userService.getUser(user.uid);
          const isVerifiedByProfile = Boolean(
            userProfile?.emailVerified || userProfile?.verifiedByAdmin,
          );

          if (!user.emailVerified && !isLegacyUser && !isVerifiedByProfile) {
            setCurrentUser(null);
            localStorage.removeItem("pdca_auth_user");
            setLoading(false);
            return;
          }

          if (user.emailVerified && userProfile && userProfile.emailVerified !== true) {
            userService.markUserVerified(user.uid, false).catch(() => {});
          }

          let storedPassword: string | undefined;
          try {
            const rawStored = localStorage.getItem("pdca_auth_user");
            if (rawStored) {
              const parsedStored = JSON.parse(rawStored);
              if (parsedStored?.uid === user.uid && parsedStored?.password) {
                storedPassword = parsedStored.password;
              }
            }
          } catch {}

          const isAutoAdmin = isAdminEmail(user.email || "");
          if (userProfile) {
            const role: UserRole = isAutoAdmin ? "admin" : userProfile.role || "user";
            const effectivePassword = userProfile.password || storedPassword;
            if (!userProfile.password && storedPassword) {
              userService.updateUserProfile(user.uid, { password: storedPassword }).catch(() => {});
            }
            persistSession({
              ...userProfile,
              uid: user.uid,
              name: userProfile.name || user.displayName || "Usuario",
              email: user.email || "",
              role,
              area: userProfile.area || "Usuario",
              ...(effectivePassword ? { password: effectivePassword } : {}),
              emailVerified: true,
            });
          } else {
            const autoProfile: UserProfile = {
              uid: user.uid,
              name:
                user.displayName ||
                (user.email ? (user.email.split("@")[0] ?? "Usuario") : "Usuario"),
              email: user.email || "",
              role: isAutoAdmin ? "admin" : "user",
              area: "Usuario",
              ...(storedPassword ? { password: storedPassword } : {}),
              emailVerified: true,
            };
            persistSession(autoProfile);
          }
        } catch (e) {
          console.error("Error al sincronizar usuario de Firebase Auth:", e);
        }
      } else {
        const storedUser = localStorage.getItem("pdca_auth_user");
        if (storedUser) {
          try {
            const parsed: UserProfile = JSON.parse(storedUser);
            if (parsed && isAdminEmail(parsed.email)) {
              parsed.role = "admin";
            }
            setCurrentUser(parsed);
          } catch (e) {
            console.error("Error parsing stored auth user:", e);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (currentUser) {
      unsub = userService.subscribeToUsers(
        (users) => {
          setUsersList(
            users.map((u) => ({
              uid: u.uid,
              name: u.name,
              email: u.email,
              area: u.area,
              position: u.position,
              avatarUrl: u.avatarUrl,
              role: u.role,
              permissions: u.permissions,
              password: u.password,
              emailVerified: u.emailVerified,
              verifiedByAdmin: u.verifiedByAdmin,
              lastVerificationSentAt: u.lastVerificationSentAt,
              createdAt: u.createdAt,
            })),
          );
          const selfUpdated = users.find((u) => u.uid === currentUser.uid);
          if (selfUpdated) {
            const effectiveRole: UserRole = isAdminEmail(selfUpdated.email)
              ? "admin"
              : selfUpdated.role;
            setCurrentUser((prev) => {
              if (!prev) return prev;
              const next: UserProfile = {
                ...prev,
                role: effectiveRole,
                area: selfUpdated.area || prev.area,
                ...(selfUpdated.permissions ? { permissions: selfUpdated.permissions } : {}),
                ...(selfUpdated.position || prev.position
                  ? { position: selfUpdated.position || prev.position }
                  : {}),
                ...(selfUpdated.password || prev.password
                  ? { password: selfUpdated.password || prev.password }
                  : {}),
              };
              localStorage.setItem("pdca_auth_user", JSON.stringify(next));
              return next;
            });
          }
        },
        (error) => {
          console.error("Error fetching users snapshot:", error);
          setUsersList([]);
        },
      );
    } else {
      setUsersList([]);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [currentUser?.uid]);

  const persistSession = (user: UserProfile | null) => {
    if (user && isAdminEmail(user.email)) {
      user.role = "admin";
    }
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("pdca_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pdca_auth_user");
    }
  };

  const login = async (email: string, pass: string) => {
    const emailLower = email.trim().toLowerCase();
    const isAutoAdmin = isAdminEmail(emailLower);

    // Autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(primaryAuth, emailLower, pass);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    const threshold = new Date("2026-09-01T21:00:00Z").getTime();
    const creationTime = new Date(firebaseUser.metadata.creationTime || 0).getTime();
    const isLegacyUser = creationTime < threshold;

    // Obtener perfil de Firestore para verificar si fue aprobado o verificado previamente
    const userProfile = await userService.getUser(uid);
    const isVerifiedByProfile = Boolean(
      userProfile?.emailVerified || userProfile?.verifiedByAdmin,
    );

    if (!firebaseUser.emailVerified && !isLegacyUser && !isVerifiedByProfile) {
      await signOut(primaryAuth);
      throw new Error(
        "Por favor, verifica tu correo electrónico usando el enlace que te enviamos antes de iniciar sesión.",
      );
    }

    if (firebaseUser.emailVerified && userProfile && userProfile.emailVerified !== true) {
      userService.markUserVerified(uid, false).catch(() => {});
    }

    if (userProfile) {
      const role: UserRole = isAutoAdmin ? "admin" : userProfile.role || "user";
      if (isAutoAdmin && userProfile.role !== "admin") {
        await userService.updateUserRole(uid, "admin");
      }
      if (userProfile.password !== pass) {
        userService.updateUserProfile(uid, { password: pass }).catch(() => {});
      }
      persistSession({
        ...userProfile,
        role,
        email: emailLower,
        password: pass,
        emailVerified: true,
      });
    } else {
      // El perfil no existía en Firestore (posible fallo durante registro).
      // Lo creamos automáticamente con los datos disponibles.
      const autoProfile: UserProfile = {
        uid,
        name: firebaseUser.displayName || emailLower.split("@")[0] || "Usuario",
        email: emailLower,
        role: isAutoAdmin ? "admin" : "user",
        area: "Usuario",
        password: pass,
        emailVerified: true,
      };
      await userService.createUser(uid, {
        name: autoProfile.name,
        email: autoProfile.email,
        role: autoProfile.role,
        area: autoProfile.area,
        password: pass,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });
      persistSession(autoProfile);
    }
  };

  const logout = async () => {
    try {
      await signOut(primaryAuth);
    } catch (error) {
      console.error("Firebase signout error:", error);
    } finally {
      persistSession(null);
    }
  };

  const updateUserProfile = async (
    updates: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => {
    if (!currentUser) throw new Error("No hay sesión activa.");
    const nextProfile: UserProfile = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar en Firestore
    await userService.updateUserProfile(currentUser.uid, updates);

    // Sincronizar displayName en Firebase Auth si cambió el nombre
    if (updates.name && primaryAuth.currentUser) {
      try {
        await updateFirebaseAuthProfile(primaryAuth.currentUser, {
          displayName: updates.name,
        });
      } catch (err) {
        console.warn("No se pudo actualizar displayName en Firebase Auth:", err);
      }
    }

    // Actualizar estado local y localStorage inmediatamente
    persistSession(nextProfile);
    setMockUsers((prev) =>
      prev.map((u) => (u.uid === currentUser.uid ? { ...u, ...updates } : u)),
    );
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const fbUser = primaryAuth.currentUser;
    if (!fbUser || !fbUser.email) {
      throw new Error("Debes tener una sesión activa de Firebase para cambiar la contraseña.");
    }
    const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
    await reauthenticateWithCredential(fbUser, credential);
    await updatePassword(fbUser, newPassword);

    await userService.updateUserProfile(fbUser.uid, { password: newPassword }).catch(() => {});
    if (currentUser) {
      persistSession({
        ...currentUser,
        password: newPassword,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const syncCurrentPassword = async (passwordToVerify: string) => {
    const trimmed = passwordToVerify.trim();
    if (!trimmed) {
      throw new Error("Ingresa tu contraseña actual.");
    }
    const fbUser = primaryAuth.currentUser;
    if (fbUser && fbUser.email) {
      const credential = EmailAuthProvider.credential(fbUser.email, trimmed);
      await reauthenticateWithCredential(fbUser, credential);
    }
    if (currentUser) {
      await userService.updateUserProfile(currentUser.uid, { password: trimmed }).catch(() => {});
      persistSession({
        ...currentUser,
        password: trimmed,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const sendPasswordReset = async () => {
    const email = primaryAuth.currentUser?.email || currentUser?.email;
    if (!email) {
      throw new Error("No se encontró un correo electrónico asociado a tu cuenta.");
    }
    await sendPasswordResetEmail(primaryAuth, email);
  };

  const resendVerificationEmail = async (email: string, pass: string) => {
    const emailLower = email.trim().toLowerCase();
    if (!emailLower || !pass) {
      throw new Error("Ingresa tu correo electrónico y contraseña para reenviar el enlace de verificación.");
    }
    secondaryAuth.languageCode = "es";
    const cred = await signInWithEmailAndPassword(secondaryAuth, emailLower, pass);
    try {
      await sendEmailVerification(cred.user);
      await userService.recordVerificationSent(cred.user.uid, false).catch(() => {});
    } finally {
      await signOut(secondaryAuth).catch(() => {});
    }
  };

  const sendAdminVerificationLink = async (target: {
    uid?: string | undefined;
    email: string;
  }): Promise<"verification_email" | "activation_reset_email"> => {
    const emailLower = target.email.trim().toLowerCase();
    if (!emailLower) {
      throw new Error("El usuario no tiene un correo electrónico válido.");
    }
    secondaryAuth.languageCode = "es";

    const knownCred = mockCredentials.find(
      (c) => c.email.trim().toLowerCase() === emailLower && Boolean(c.pass),
    );
    const knownDirUser = usersList.find(
      (u) => u.email.trim().toLowerCase() === emailLower && Boolean(u.password),
    );
    const passToUse = knownCred?.pass || knownDirUser?.password;

    if (passToUse) {
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, emailLower, passToUse);
        await sendEmailVerification(cred.user);
        const uid = target.uid || cred.user.uid;
        if (uid) {
          await userService.recordVerificationSent(uid, false).catch(() => {});
        }
        await signOut(secondaryAuth).catch(() => {});
        return "verification_email";
      } catch {
        await signOut(secondaryAuth).catch(() => {});
      }
    }

    await sendPasswordResetEmail(secondaryAuth, emailLower);
    if (target.uid && !target.uid.includes("@")) {
      await userService.recordVerificationSent(target.uid, true).catch(() => {});
    }
    return "activation_reset_email";
  };

  const approveUserVerification = async (uid: string) => {
    if (!uid || uid.includes("@")) {
      throw new Error("No se encontró el identificador del usuario en Firestore.");
    }
    await userService.markUserVerified(uid, true);
  };

  // Exposed utility for admin to add mock users (in case Firebase is down)
  const addMockUser = (user: UserProfile & { pass: string }) => {
    setMockCredentials((prev) => [...prev, user]);
    setMockUsers((prev) => [...prev, { ...user, password: user.password || user.pass }]);
  };

  const permissions = getEffectivePermissions(currentUser);

  const value = {
    currentUser,
    permissions,
    loading,
    login,
    logout,
    resendVerificationEmail,
    sendAdminVerificationLink,
    approveUserVerification,
    updateUserProfile,
    changePassword,
    syncCurrentPassword,
    sendPasswordReset,
    mockUsers,
    setMockUsers: (action: any) => {
      // Simplified mock management for UI purposes
      setMockUsers(action);
    },
    addMockUser,
    usersList,
  };

  return <AuthContext.Provider value={value as any}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
