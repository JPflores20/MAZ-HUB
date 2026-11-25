/**
 * @fileoverview Pure validation, error mapping, and profile payload builders for collaborator self-registration.
 */

import type { UserProfile } from "./auth_types";
import {
  CORPORATE_EMAIL_ERROR,
  get_auth_error_info,
  validate_corporate_email,
} from "./email_validation";

export const PASSWORD_STRENGTH_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export interface RegisterValidationInput {
  nombre: string;
  paterno: string;
  area: string;
  reg_email: string;
  reg_password: string;
  confirm_password: string;
}

/** Validates self-registration form inputs and returns normalized corporate email or error message. */
export function validate_register_input(
  input: RegisterValidationInput,
): { valid: true; normalized_email: string } | { valid: false; error: string } {
  if (
    !input.nombre.trim() ||
    !input.paterno.trim() ||
    !input.area.trim() ||
    !input.reg_email.trim() ||
    !input.reg_password ||
    !input.confirm_password
  ) {
    return { valid: false, error: "Por favor, completa todos los campos obligatorios." };
  }

  const email_validation = validate_corporate_email(input.reg_email);
  if (!email_validation.valid) {
    return { valid: false, error: email_validation.error || CORPORATE_EMAIL_ERROR };
  }

  if (input.reg_password !== input.confirm_password) {
    return { valid: false, error: "Las contraseñas no coinciden." };
  }

  if (!PASSWORD_STRENGTH_REGEX.test(input.reg_password)) {
    return {
      valid: false,
      error:
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
    };
  }

  return { valid: true, normalized_email: email_validation.normalized };
}

/** Maps Firebase Auth registration errors to anti-enumeration Spanish error messages. */
export function map_registration_error(caught_error: unknown): string {
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

/** Builds the Zero Trust initial `/users/{uid}` profile payload from registration form values. */
export function build_register_profile_payload(params: {
  full_name: string;
  nombre: string;
  paterno: string;
  materno: string;
  email_lower: string;
  area: string;
  position: string;
  plant: string;
  phone: string;
  verification_sent: boolean;
  now_iso: string;
}): Omit<UserProfile, "uid"> {
  const trimmed_position = params.position.trim().toUpperCase().slice(0, 80);
  const trimmed_plant = params.plant.trim().slice(0, 80);
  const trimmed_phone = params.phone.trim().slice(0, 40);

  return {
    name: params.full_name.slice(0, 120),
    firstName: params.nombre.trim().toUpperCase().slice(0, 80),
    paternalLastName: params.paterno.trim().toUpperCase().slice(0, 80),
    maternalLastName: params.materno.trim().toUpperCase().slice(0, 80),
    email: params.email_lower,
    role: "user",
    area: params.area.trim().toUpperCase().slice(0, 80),
    ...(trimmed_position ? { position: trimmed_position } : {}),
    ...(trimmed_plant ? { plant: trimmed_plant } : {}),
    ...(trimmed_phone ? { phone: trimmed_phone } : {}),
    approved: false,
    verifiedByAdmin: false,
    emailVerified: false,
    ...(params.verification_sent ? { lastVerificationSentAt: params.now_iso } : {}),
    createdAt: params.now_iso,
  };
}
