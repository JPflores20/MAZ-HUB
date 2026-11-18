/**
 * @fileoverview Custom hook managing corporate login credentials, error classification, and verification email resends.
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth_context";
import { get_auth_error_info } from "./email_validation";

/** Maps Firebase Auth login failure codes to user-safe Spanish feedback messages. */
function classify_login_error(caught_error: unknown): {
  error_message: string;
  needs_verification: boolean;
} {
  const { code, message } = get_auth_error_info(caught_error);
  let resolved_message =
    "No se pudo iniciar sesión. Verifica tus credenciales e intenta nuevamente.";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    resolved_message = "Correo o contraseña incorrectos.";
  } else if (code === "auth/invalid-email") {
    resolved_message = "El correo electrónico no es válido.";
  } else if (code === "auth/too-many-requests") {
    resolved_message =
      "Demasiados intentos fallidos. Espera unos minutos antes de volver a intentar.";
  } else if (code === "auth/user-disabled") {
    resolved_message = "Esta cuenta ha sido deshabilitada. Contacta al administrador.";
  } else if (
    message &&
    (message.toLowerCase().includes("verifica tu correo") ||
      message.toLowerCase().includes("pendiente de aprobación") ||
      message.toLowerCase().includes("correos corporativos"))
  ) {
    resolved_message = message;
  }

  return {
    error_message: resolved_message,
    needs_verification: resolved_message.toLowerCase().includes("verifica tu correo"),
  };
}

/** Encapsulates sign-in submission state and verification link resend handling. */
export function useLoginForm() {
  const navigate = useNavigate();
  const { login, resendVerificationEmail } = useAuth();

  const [login_email, set_login_email] = useState("");
  const [login_password, set_login_password] = useState("");
  const [login_loading, set_login_loading] = useState(false);
  const [login_error, set_login_error] = useState<string | null>(null);
  const [needs_verification, set_needs_verification] = useState(false);
  const [resend_loading, set_resend_loading] = useState(false);
  const [resend_success, set_resend_success] = useState<string | null>(null);
  const [show_login_password, set_show_login_password] = useState(false);

  const handle_login = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    set_login_loading(true);
    set_login_error(null);
    set_needs_verification(false);
    set_resend_success(null);

    if (!login_email || !login_password) {
      set_login_error("Por favor, completa todos los campos.");
      set_login_loading(false);
      return;
    }

    try {
      await login(login_email, login_password);
      void navigate({ to: "/dashboard" });
    } catch (caught_error: unknown) {
      const { error_message, needs_verification: should_resend } =
        classify_login_error(caught_error);
      set_login_error(error_message);
      set_needs_verification(should_resend);
    } finally {
      set_login_loading(false);
    }
  };

  const handle_resend_verification = async () => {
    set_resend_success(null);
    if (!login_email || !login_password) {
      set_login_error(
        "Ingresa tu correo electrónico y tu contraseña arriba para poder reenviarte el enlace de verificación.",
      );
      return;
    }

    set_resend_loading(true);
    try {
      await resendVerificationEmail(login_email, login_password);
      set_login_error(null);
      set_needs_verification(false);
      set_resend_success(
        `¡Enlace enviado a ${login_email.trim().toLowerCase()}! Revisa tu bandeja de entrada y también la carpeta de Correo no deseado (Spam).`,
      );
    } catch (caught_error: unknown) {
      const { code, message } = get_auth_error_info(caught_error);
      if (message?.toLowerCase().includes("ya está verificado")) {
        set_login_error(null);
        set_needs_verification(false);
        set_resend_success(message);
      } else if (code === "auth/too-many-requests") {
        set_login_error(
          "Ya se envió un enlace recientemente. Espera unos minutos antes de solicitar otro o revisa tu carpeta de Spam.",
        );
      } else if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        set_login_error(
          "Correo o contraseña incorrectos. Verifica tus datos para reenviar el correo de verificación.",
        );
      } else {
        set_login_error("No se pudo reenviar el correo de verificación en este momento.");
      }
    } finally {
      set_resend_loading(false);
    }
  };

  return {
    login_email,
    set_login_email,
    login_password,
    set_login_password,
    login_loading,
    login_error,
    needs_verification,
    resend_loading,
    resend_success,
    show_login_password,
    set_show_login_password,
    handle_login,
    handle_resend_verification,
  };
}
