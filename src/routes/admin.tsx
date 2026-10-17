/**
 * admin.tsx
 * Ruta del panel de administración para gestión de usuarios, roles, permisos granulares y carga de trabajo.
 * Reutiliza la suscripción global de `useAuth()` para evitar lecturas duplicadas a Firestore.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { Shield } from "lucide-react";
import { RegistrationForm } from "@/components/admin/registration-form";
import { UserList } from "@/components/admin/user-list";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { currentUser, permissions, usersList, mockUsers } = useAuth();

  const normalizedUsers = usersList.map((u) => ({
    uid: u.uid || u.email,
    name: u.name,
    email: u.email,
    role: u.role || "user",
    permissions: u.permissions,
    area: u.area || "",
    ...(u.position ? { position: u.position } : {}),
    ...(u.avatarUrl ? { avatarUrl: u.avatarUrl } : {}),
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
          Separa a tu equipo por rol (Administradores, Líderes de Área, Usuarios Generales, Becarios y Visores) y personaliza los permisos individuales de cada colaborador.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario de registro */}
        <RegistrationForm />

        {/* Lista de Usuarios con filtros por rol/área, permisos personalizables y carga de trabajo */}
        <UserList users_list={normalizedUsers} mock_users={mockUsers} />
      </div>
    </div>
  );
}
