/**
 * @fileoverview Corporate email domain whitelist validation (`@ab-inbev.com`, `@gmodelo.com.mx`)
 * and resilient verification email dispatch with Firebase Auth continue-URI fallback.
 */

import { sendEmailVerification, type User } from "firebase/auth";
import type { AuthErrorLike, CorporateEmailValidationResult } from "./auth_types";

export const ALLOWED_CORPORATE_DOMAINS = ["ab-inbev.com", "gmodelo.com.mx"] as const;

export const CORPORATE_EMAIL_ERROR =
  "Solo se permiten correos corporativos con terminación @ab-inbev.com o @gmodelo.com.mx.";

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an email address and validates its domain against the allowed corporate whitelist.
 *
 * @param {string} raw_email - Candidate email entered by a user or administrator.
 * @returns {CorporateEmailValidationResult} Validation flag, normalized lowercase address, and optional error text.
 */
export function validate_corporate_email(raw_email: string): CorporateEmailValidationResult {
  const normalized_email = raw_email.trim().toLowerCase();
  if (!normalized_email || !BASIC_EMAIL_REGEX.test(normalized_email)) {
    return {
      valid: false,
      normalized: normalized_email,
      error: "Ingresa un correo electrónico válido.",
    };
  }

  const email_parts = normalized_email.split("@");
  const email_domain = email_parts[1];
  if (email_parts.length !== 2 || !email_domain) {
    return {
      valid: false,
      normalized: normalized_email,
      error: "Ingresa un correo electrónico válido.",
    };
  }

  if (!(ALLOWED_CORPORATE_DOMAINS as readonly string[]).includes(email_domain)) {
    return {
      valid: false,
      normalized: normalized_email,
      error: CORPORATE_EMAIL_ERROR,
    };
  }

  return { valid: true, normalized: normalized_email };
}

/**
 * Convenience predicate checking whether an email belongs to an authorized corporate domain.
 *
 * @param {string} raw_email - Email address to inspect.
 * @returns {boolean} True when format and corporate domain are valid.
 */
export function is_corporate_email(raw_email: string): boolean {
  return validate_corporate_email(raw_email).valid;
}

/**
 * Safely extracts `code` and `message` strings from an unknown thrown error object.
 *
 * @param {unknown} caught_error - Unknown error value caught during Firebase calls.
 * @returns {AuthErrorLike} Normalized code/message container.
 */
export function get_auth_error_info(caught_error: unknown): AuthErrorLike {
  if (typeof caught_error === "object" && caught_error !== null) {
    const candidate_record = caught_error as { code?: unknown; message?: unknown };
    return {
      ...(typeof candidate_record.code === "string" ? { code: candidate_record.code } : {}),
      ...(typeof candidate_record.message === "string"
        ? { message: candidate_record.message }
        : {}),
    };
  }
  if (caught_error instanceof Error) {
    return { message: caught_error.message };
  }
  return {};
}

/**
 * Sends a Firebase email verification link with fallback if the current origin is not allowlisted.
 *
 * @param {User} firebase_user - Newly created or unverified Firebase Auth user instance.
 * @returns {Promise<void>} Resolves once Firebase dispatches the verification email.
 */
export async function send_verification_email_safely(firebase_user: User): Promise<void> {
  const current_origin = typeof window !== "undefined" ? window.location.origin : "";
  if (current_origin.startsWith("http://") || current_origin.startsWith("https://")) {
    try {
      await sendEmailVerification(firebase_user, {
        url: `${current_origin}/login`,
        handleCodeInApp: false,
      });
      return;
    } catch (verification_error: unknown) {
      const { code } = get_auth_error_info(verification_error);
      if (code !== "auth/unauthorized-continue-uri" && code !== "auth/invalid-continue-uri") {
        throw verification_error;
      }
    }
  }
  await sendEmailVerification(firebase_user);
}
