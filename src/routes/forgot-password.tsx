/**
 * forgot-password.tsx
 * Ruta para solicitar el restablecimiento de contraseña mediante correo electrónico con Firebase Auth.
 */
import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordView } from "@/features/auth/forgot_password_view";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordView,
});
