/**
 * @fileoverview Custom hook managing self-registration validation, isolated sign-up, and verification dispatch.
 */

import { useState } from "react";
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import type { RegisterSuccessOptions } from "./auth_types";
import {
  CORPORATE_EMAIL_ERROR,
  get_auth_error_info,
  send_verification_email_safely,
  validate_corporate_email,
} from "./email_validation";
import { user_service } from "./user_service";

const PASSWORD_STRENGTH_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/** Maps Firebase Auth registration errors to anti-enumeration Spanish error messages. */
function map_registration_error(caught_error: unknown): string {
  const { code } = get_auth_error_info(caught_error);
  if (code === "auth/invalid-email") {
    return "El correo electrónico no es válido.";
  }
  if (code === "auth/weak-password") {
    return "La contraseña es demasiado débil. Usa al menos 8 caracteres.";
  }
  if (code === "auth/too-many-requests") {
    return "Demasiados intentos. Espera unos minutos antes de volver a intentar.";
  }
  if (code === "auth/email-already-in-use") {
    return "No se pudo completar el registro con este correo. Si ya cuentas con acceso, inicia sesión o recupera tu contraseña.";
  }
  return "No se pudo completar el registro. Verifica tus datos e intenta de nuevo.";
}

/** Encapsulates collaborator self-registration state and Zero Trust sign-up workflow. */
export function useRegisterForm(
  on_success: (email: string, password?: string, options?: RegisterSuccessOptions) => void,
) {
  const [nombre, set_nombre] = useState("");
  const [paterno, set_paterno] = useState("");
  const [materno, set_materno] = useState("");
  const [reg_email, set_reg_email] = useState("");
  const [reg_password, set_reg_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [reg_loading, set_reg_loading] = useState(false);
  const [reg_error, set_reg_error] = useState<string | null>(null);
  const [show_reg_password, set_show_reg_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);

  const handle_register = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    set_reg_error(null);

    if (
      !nombre.trim() ||
      !paterno.trim() ||
      !reg_email.trim() ||
      !reg_password ||
      !confirm_password
    ) {
      set_reg_error("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const email_validation = validate_corporate_email(reg_email);
    if (!email_validation.valid) {
      set_reg_error(email_validation.error || CORPORATE_EMAIL_ERROR);
      return;
    }

    if (reg_password !== confirm_password) {
      set_reg_error("Las contraseñas no coinciden.");
      return;
    }

    if (!PASSWORD_STRENGTH_REGEX.test(reg_password)) {
      set_reg_error(
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
      );
      return;
    }

    set_reg_loading(true);
    let created_auth_user = false;

    try {
      const full_name = [nombre.trim(), paterno.trim(), materno.trim()]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();
      const email_lower = email_validation.normalized;
      const now_iso = new Date().toISOString();

      primary_auth.languageCode = "es";
      const credential = await createUserWithEmailAndPassword(
        primary_auth,
        email_lower,
        reg_password,
      );
      created_auth_user = true;
      const firebase_user = credential.user;

      await updateProfile(firebase_user, { displayName: full_name }).catch(() => {});

      let verification_sent = false;
      let verification_error: string | undefined;
      try {
        await send_verification_email_safely(firebase_user);
        verification_sent = true;
      } catch (verification_caught_error: unknown) {
        console.error("Error al enviar correo de verificación:", verification_caught_error);
        const { code } = get_auth_error_info(verification_caught_error);
        verification_error =
          code === "auth/too-many-requests"
            ? "Se alcanzó temporalmente el límite de envíos. Espera un minuto e intenta reenviar desde Iniciar Sesión."
            : "Tu cuenta se creó, pero ocurrió un error al enviar el correo de verificación. Podrás reintentar desde Iniciar Sesión.";
      }

      try {
        await user_service.create_user(firebase_user.uid, {
          name: full_name,
          firstName: nombre.trim().toUpperCase(),
          paternalLastName: paterno.trim().toUpperCase(),
          maternalLastName: materno.trim().toUpperCase(),
          email: email_lower,
          role: "user",
          area: "Usuario",
          approved: false,
          verifiedByAdmin: false,
          emailVerified: false,
          ...(verification_sent ? { lastVerificationSentAt: now_iso } : {}),
          createdAt: now_iso,
        });
      } catch (profile_error) {
        console.error("Error al guardar perfil en Firestore durante el registro:", profile_error);
      }

      await signOut(primary_auth).catch(() => {});
      created_auth_user = false;

      on_success(email_lower, undefined, {
        verificationSent: verification_sent,
        ...(verification_error ? { verificationError: verification_error } : {}),
      });
    } catch (caught_error: unknown) {
      set_reg_error(map_registration_error(caught_error));
    } finally {
      if (created_auth_user) {
        await signOut(primary_auth).catch(() => {});
      }
      set_reg_loading(false);
    }
  };

  return {
    nombre,
    set_nombre,
    paterno,
    set_paterno,
    materno,
    set_materno,
    reg_email,
    set_reg_email,
    reg_password,
    set_reg_password,
    confirm_password,
    set_confirm_password,
    reg_loading,
    reg_error,
    show_reg_password,
    set_show_reg_password,
    show_confirm_password,
    set_show_confirm_password,
    handle_register,
  };
}
