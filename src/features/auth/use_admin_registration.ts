/**
 * @fileoverview Custom hook managing isolated admin user provisioning via `adminCreateUser`.
 */

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import type { UserPermissions, UserRole } from "./auth_types";
import {
  CORPORATE_EMAIL_ERROR,
  get_auth_error_info,
  validate_corporate_email,
  validate_general_email,
} from "./email_validation";
import { ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS } from "./role_permissions";
import { user_service } from "./user_service";

const TEMP_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/** Encapsulates admin registration state, role/permission presets, and Cloud Function submission. */
export function useAdminRegistration() {
  const [user_name, set_user_name] = useState("");
  const [user_email, set_user_email] = useState("");
  const [user_password, set_user_password] = useState("");
  const [show_password, set_show_password] = useState(false);
  const [user_role, set_user_role] = useState<UserRole>("user");
  const [active_days, set_active_days] = useState("90");
  const [user_area, set_user_area] = useState("");
  const [user_position, set_user_position] = useState("");
  const [custom_permissions, set_custom_permissions] = useState<UserPermissions>(
    ROLE_DEFAULT_PERMISSIONS["user"],
  );
  const [show_custom_perms, set_show_custom_perms] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);

  const handle_role_select = (next_role: UserRole) => {
    set_user_role(next_role);
    set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS[next_role] });
    if (next_role === "intern" && !user_position.trim()) {
      set_user_position("BECARIO");
    }
  };

  const handle_toggle_permission = (
    permission_key: keyof Omit<UserPermissions, "canManageUsers">,
    is_checked: boolean,
  ) => {
    set_custom_permissions((previous_perms) => ({
      ...previous_perms,
      [permission_key]: is_checked,
    }));
  };

  const handle_reset_permissions = () => {
    set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS[user_role] });
  };

  const handle_submit = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    if (!user_name.trim() || !user_email.trim() || !user_area.trim()) {
      set_error_message("Por favor, completa nombre, correo electrónico y área.");
      return;
    }

    const is_intern_role = user_role === "intern";
    const email_validation = is_intern_role
      ? validate_general_email(user_email)
      : validate_corporate_email(user_email);
    if (!email_validation.valid) {
      set_error_message(
        email_validation.error ||
          (is_intern_role ? "Ingresa un correo electrónico válido." : CORPORATE_EMAIL_ERROR),
      );
      return;
    }

    const parsed_days = active_days.trim() ? Number(active_days.trim()) : NaN;
    if (
      is_intern_role &&
      (!Number.isInteger(parsed_days) || parsed_days < 1 || parsed_days > 730)
    ) {
      set_error_message(
        "Asigna un tiempo activo válido entre 1 y 730 días para el becario temporal.",
      );
      return;
    }

    const trimmed_password = user_password.trim();
    if (trimmed_password && !TEMP_PASSWORD_REGEX.test(trimmed_password)) {
      set_error_message(
        "Si especificas contraseña temporal, debe tener mínimo 8 caracteres, mayúscula, número y carácter especial.",
      );
      return;
    }

    set_is_loading(true);
    set_error_message(null);
    set_success_message(null);

    const email_lower = email_validation.normalized;
    const normalized_name = user_name.trim().toUpperCase();
    const normalized_area = user_area.trim().toUpperCase();
    const normalized_position = user_position.trim().toUpperCase();

    try {
      const final_permissions: UserPermissions = {
        ...custom_permissions,
        canManageUsers: user_role === "admin",
      };

      await user_service.admin_create_user({
        email: email_lower,
        name: normalized_name,
        area: normalized_area,
        ...(normalized_position ? { position: normalized_position } : {}),
        role: user_role,
        permissions: final_permissions,
        ...(is_intern_role ? { activeDays: parsed_days } : {}),
        ...(trimmed_password ? { password: trimmed_password } : {}),
      });

      let activation_sent = false;
      try {
        primary_auth.languageCode = "es";
        await sendPasswordResetEmail(primary_auth, email_lower);
        activation_sent = true;
      } catch (mail_error) {
        console.error("No se pudo enviar correo de activación inicial:", mail_error);
      }

      const duration_note = is_intern_role ? ` (vigencia: ${parsed_days} días)` : "";
      set_success_message(
        activation_sent
          ? `Usuario ${normalized_name} registrado como ${ROLE_LABELS[user_role]}${duration_note}. Se envió un correo para verificar su cuenta y establecer contraseña.`
          : `Usuario ${normalized_name} registrado como ${ROLE_LABELS[user_role]}${duration_note}. Envía el enlace de activación desde la lista de usuarios.`,
      );
      set_user_name("");
      set_user_email("");
      set_user_password("");
      set_user_area("");
      set_user_position("");
      set_user_role("user");
      set_active_days("90");
      set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS["user"] });
    } catch (caught_error: unknown) {
      const { code, message } = get_auth_error_info(caught_error);
      if (code === "functions/already-exists") {
        set_error_message("No se pudo registrar la cuenta con ese correo corporativo.");
      } else if (code === "functions/permission-denied") {
        set_error_message(
          "No cuentas con permisos administrativos verificados para crear usuarios.",
        );
      } else {
        set_error_message(message || "No se pudo registrar el usuario.");
      }
    } finally {
      set_is_loading(false);
    }
  };

  return {
    user_name,
    set_user_name,
    user_email,
    set_user_email,
    user_password,
    set_user_password,
    show_password,
    set_show_password,
    user_role,
    handle_role_select,
    active_days,
    set_active_days,
    user_area,
    set_user_area,
    user_position,
    set_user_position,
    custom_permissions,
    show_custom_perms,
    set_show_custom_perms,
    is_loading,
    error_message,
    success_message,
    handle_toggle_permission,
    handle_reset_permissions,
    handle_submit,
  };
}
