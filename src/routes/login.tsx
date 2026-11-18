/**
 * login.tsx
 * Ruta de inicio de sesión y registro de usuarios de la plataforma MAZ HUB.
 */
import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/features/auth/auth_page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Iniciar Sesión · MAZ HUB" }],
  }),
  component: AuthPage,
});
