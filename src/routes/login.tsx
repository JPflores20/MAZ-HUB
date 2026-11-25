/**
 * login.tsx
 * Ruta de inicio de sesión y registro de usuarios de la plataforma MAZ HUB.
 */
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Iniciar Sesión · MAZ HUB" }],
  }),
  component: lazyRouteComponent(() => import("@/features/auth/auth_page"), "AuthPage"),
});
