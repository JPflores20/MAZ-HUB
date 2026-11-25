/**
 * @fileoverview Role-gated administration dashboard orchestrating user onboarding and directory permissions.
 */

import { useEffect, useRef } from "react";
import { Shield } from "lucide-react";
import { RegistrationForm, useAuth, type UserProfile } from "@/features/auth";
import { user_service } from "@/features/auth/user_service";
import { UserList } from "./user_list";

/** Renders the `/admin` feature view for creating users and managing roles/permissions. */
export function AdminPanel() {
  const { currentUser, permissions, usersList } = useAuth();
  const synced_auth_ref = useRef(false);

  useEffect(() => {
    if (currentUser?.role !== "admin" || synced_auth_ref.current) {
      return;
    }
    synced_auth_ref.current = true;
    void user_service.admin_sync_auth_users().catch(() => {});
  }, [currentUser?.role]);

  const normalized_users: UserProfile[] = usersList.map((directory_entry) => ({
    uid: directory_entry.uid || directory_entry.email,
    name: directory_entry.name,
    email: directory_entry.email,
    role: directory_entry.role || "user",
    permissions: directory_entry.permissions,
    area: directory_entry.area || "",
    ...(directory_entry.position ? { position: directory_entry.position } : {}),
    ...(directory_entry.avatarUrl ? { avatarUrl: directory_entry.avatarUrl } : {}),
    ...(typeof directory_entry.approved === "boolean"
      ? { approved: directory_entry.approved }
      : {}),
    ...(typeof directory_entry.emailVerified === "boolean"
      ? { emailVerified: directory_entry.emailVerified }
      : {}),
    ...(typeof directory_entry.verifiedByAdmin === "boolean"
      ? { verifiedByAdmin: directory_entry.verifiedByAdmin }
      : {}),
    ...(typeof directory_entry.temporaryAccount === "boolean"
      ? { temporaryAccount: directory_entry.temporaryAccount }
      : {}),
    ...(typeof directory_entry.activeDays === "number"
      ? { activeDays: directory_entry.activeDays }
      : {}),
    ...(directory_entry.expiresAt ? { expiresAt: directory_entry.expiresAt } : {}),
    ...(typeof directory_entry.expiresAtMs === "number"
      ? { expiresAtMs: directory_entry.expiresAtMs }
      : {}),
    ...(directory_entry.lastVerificationSentAt
      ? { lastVerificationSentAt: directory_entry.lastVerificationSentAt }
      : {}),
    ...(directory_entry.createdAt ? { createdAt: directory_entry.createdAt } : {}),
  }));

  if (currentUser?.role !== "admin" && !permissions.canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="size-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acceso Denegado</h2>
        <p className="text-muted-foreground mt-2">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Panel de Administración
        </p>
        <h1 className="mt-1 text-3xl font-bold uppercase">Gestión de Usuarios, Roles y Permisos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Separa a tu equipo por rol (Administradores, Líderes de Área, Usuarios Generales, Becarios
          y Visores) y personaliza los permisos individuales de cada colaborador.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <RegistrationForm />
        <UserList users_list={normalized_users} />
      </div>
    </div>
  );
}
