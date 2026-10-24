/**
 * forgot-password.tsx
 * Ruta para solicitar el restablecimiento de contraseña mediante correo electrónico con Firebase Auth.
 */
import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordView } from "@/auth/forgot-password-view";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordView,
});
