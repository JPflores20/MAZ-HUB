/**
 * @fileoverview Custom hook managing self-registration validation, isolated sign-up, and verification dispatch.
 */

import type React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { primary_auth } from "@/core/config/firebase";
import { can_select_elaboracion_area, DEFAULT_PLANT } from "@/domain/constants/plant_catalog";
import type { RegisterSuccessOptions } from "./auth_types";
import { get_auth_error_info, send_verification_email_safely } from "./email_validation";
import {
  build_register_profile_payload,
  map_registration_error,
  validate_register_input,
} from "./register_form_helpers";
import { user_service } from "./user_service";

/** Encapsulates collaborator self-registration state and Zero Trust sign-up workflow. */
export function useRegisterForm(
  on_success: (email: string, password?: string, options?: RegisterSuccessOptions) => void,
) {
  const [nombre, set_nombre] = useState("");
  const [paterno, set_paterno] = useState("");
  const [materno, set_materno] = useState("");
  const [reg_email, set_reg_email] = useState("");
  const [position, set_position] = useState("");
  const [area, set_area] = useState("");
  const [plant, set_plant] = useState(DEFAULT_PLANT);
  const [phone, set_phone] = useState("");
  const [reg_password, set_reg_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [reg_loading, set_reg_loading] = useState(false);
  const [reg_error, set_reg_error] = useState<string | null>(null);
  const [show_reg_password, set_show_reg_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);

  const full_name_preview = [nombre.trim(), paterno.trim(), materno.trim()]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  const can_select_elaboracion = can_select_elaboracion_area(full_name_preview, reg_email);

  const handle_register = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    set_reg_error(null);

    const validation = validate_register_input({
      nombre,
      paterno,
      area,
      reg_email,
      reg_password,
      confirm_password,
    });
    if (!validation.valid) {
      set_reg_error(validation.error);
      return;
    }

    set_reg_loading(true);
    let created_auth_user = false;

    try {
      const email_lower = validation.normalized_email;
      const now_iso = new Date().toISOString();

      primary_auth.languageCode = "es";
      const credential = await createUserWithEmailAndPassword(
        primary_auth,
        email_lower,
        reg_password,
      );
      created_auth_user = true;
      const firebase_user = credential.user;

      await updateProfile(firebase_user, { displayName: full_name_preview }).catch(() => {});

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

      const profile_payload = build_register_profile_payload({
        full_name: full_name_preview,
        nombre,
        paterno,
        materno,
        email_lower,
        area,
        position,
        plant,
        phone,
        verification_sent,
        now_iso,
      });

      try {
        await user_service.create_user(firebase_user.uid, profile_payload);
      } catch (first_profile_error) {
        console.warn(
          "Reintentando guardar perfil en Firestore durante el registro:",
          first_profile_error,
        );
        try {
          await new Promise((resolve) => setTimeout(resolve, 350));
          await user_service.create_user(firebase_user.uid, profile_payload);
        } catch (profile_error) {
          console.error("Error al guardar perfil en Firestore durante el registro:", profile_error);
        }
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
    position,
    set_position,
    area,
    set_area,
    plant,
    set_plant,
    phone,
    set_phone,
    can_select_elaboracion,
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
