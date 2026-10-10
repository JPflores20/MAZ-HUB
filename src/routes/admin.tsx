import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { userService } from "@/services/user-service";
import { Shield } from "lucide-react";
import type { UserProfile } from "@/context/auth-context";
import { RegistrationForm } from "@/components/admin/registration-form";
import { UserList } from "@/components/admin/user-list";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { currentUser, mockUsers } = useAuth();
  const [users_list, set_users_list] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsub = userService.subscribeToUsers(
      (users) => {
        set_users_list(users);
      },
      (err) => {
        console.error("Error en onSnapshot de usuarios:", err);
      },
    );

    return () => unsub();
  }, []);

  if (currentUser?.role !== "admin") {
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
        <h1 className="mt-1 text-3xl font-bold uppercase">Gestión de Usuarios y Permisos</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario de registro */}
        <RegistrationForm />

        {/* Lista de Usuarios */}
        <UserList users_list={users_list} mock_users={mockUsers} set_users_list={set_users_list} />
      </div>
    </div>
  );
}
