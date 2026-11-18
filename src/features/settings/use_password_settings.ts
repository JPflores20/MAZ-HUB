/**
 * @fileoverview Custom hook managing Firebase Auth password update and reset email dispatch.
 */

import type React from "react";
import { useMemo, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { primary_auth } from "@/core/config/firebase";
import { useAuth, type UserProfile } from "@/features/auth/auth_context";
import { get_auth_error_info } from "@/features/auth/email_validation";
import { evaluate_password_strength, STRONG_PASSWORD_REGEX } from "./settings_utils";

/** Manages local password change fields, complexity rating, and reset dispatch. */
export function usePasswordSettings(
  target_user: UserProfile | null,
  is_editing_other_user: boolean,
) {
  const { changePassword, sendPasswordReset } = useAuth();

  const [current_password, set_current_password] = useState("");
  const [new_password, set_new_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [show_current_password, set_show_current_password] = useState(false);
  const [show_new_password, set_show_new_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);
  const [is_changing_password, set_is_changing_password] = useState(false);
  const [is_sending_reset, set_is_sending_reset] = useState(false);

  const password_strength = useMemo(
    () => evaluate_password_strength(new_password),
    [new_password],
  );

  const handle_change_password = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    if (!current_password) {
      toast.error("Ingresa tu contraseña actual para confirmar tu identidad.");
      return;
    }
    if (!STRONG_PASSWORD_REGEX.test(new_password)) {
      toast.error(
        "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
      );
      return;
    }
    if (new_password !== confirm_password) {
      toast.error("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    set_is_changing_password(true);
    try {
      await changePassword(current_password, new_password);
      set_current_password("");
      set_new_password("");
      set_confirm_password("");
      toast.success("¡Contraseña actualizada exitosamente!");
    } catch (caught_error: unknown) {
      console.error("Error al cambiar contraseña:", caught_error);
      const { code } = get_auth_error_info(caught_error);
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("La contraseña actual que ingresaste es incorrecta.");
      } else if (code === "auth/weak-password") {
        toast.error("La nueva contraseña es demasiado débil (mínimo 8 caracteres).");
      } else if (code === "auth/requires-recent-login") {
        toast.error("Por seguridad, cierra sesión y vuelve a entrar antes de cambiar tu contraseña.");
      } else {
        toast.error("No se pudo actualizar la contraseña en Firebase Auth.");
      }
    } finally {
      set_is_changing_password(false);
    }
  };

  const handle_send_reset_email = async () => {
    if (!target_user) return;
    set_is_sending_reset(true);
    try {
      if (is_editing_other_user) {
        await sendPasswordResetEmail(primary_auth, target_user.email);
      } else {
        await sendPasswordReset();
      }
      toast.success(`Se envió un enlace de restablecimiento a ${target_user.email}`);
    } catch (caught_error: unknown) {
      const { message } = get_auth_error_info(caught_error);
      toast.error(message || "No se pudo enviar el correo de restablecimiento.");
    } finally {
      set_is_sending_reset(false);
    }
  };

  return {
    current_password,
    set_current_password,
    new_password,
    set_new_password,
    confirm_password,
    set_confirm_password,
    show_current_password,
    set_show_current_password,
    show_new_password,
    set_show_new_password,
    show_confirm_password,
    set_show_confirm_password,
    is_changing_password,
    is_sending_reset,
    password_strength,
    handle_change_password,
    handle_send_reset_email,
  };
}
