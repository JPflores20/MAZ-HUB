/**
 * forgot-password.tsx
 * Ruta para solicitar el restablecimiento de contraseña mediante correo electrónico con Firebase Auth.
 */
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  component: lazyRouteComponent(
    () => import("@/features/auth/forgot_password_view"),
    "ForgotPasswordView",
  ),
});
