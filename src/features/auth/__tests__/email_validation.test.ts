/**
 * @fileoverview Unit tests for corporate domain whitelist validation and verification email dispatch fallback.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import {
  CORPORATE_EMAIL_ERROR,
  is_corporate_email,
  send_verification_email_safely,
  validate_corporate_email,
} from "../email_validation";

const mock_send_email_verification = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    sendEmailVerification: (...args: unknown[]) => mock_send_email_verification(...args),
  };
});

describe("Validación de correo corporativo (@ab-inbev.com / @gmodelo.com.mx)", () => {
  it("acepta correos válidos con terminación @ab-inbev.com y @gmodelo.com.mx", () => {
    expect(validate_corporate_email("Juan.Perez@ab-inbev.com")).toEqual({
      valid: true,
      normalized: "juan.perez@ab-inbev.com",
    });
    expect(validate_corporate_email("  ana.lopez@GMODELO.COM.MX  ")).toEqual({
      valid: true,
      normalized: "ana.lopez@gmodelo.com.mx",
    });
    expect(is_corporate_email("colaborador@ab-inbev.com")).toBe(true);
    expect(is_corporate_email("colaborador@gmodelo.com.mx")).toBe(true);
  });

  it("rechaza correos personales o de otros dominios/subdominios", () => {
    const invalid_emails = [
      "usuario@gmail.com",
      "usuario@outlook.com",
      "usuario@ab-inbev.com.mx",
      "usuario@gmodelo.com",
      "usuario@sub.ab-inbev.com",
      "usuario@fakegmodelo.com.mx",
      "usuario@ab-inbev.com.evil.com",
    ];
    for (const invalid_email of invalid_emails) {
      const validation_result = validate_corporate_email(invalid_email);
      expect(validation_result.valid).toBe(false);
      expect(validation_result.error).toBe(CORPORATE_EMAIL_ERROR);
    }
  });

  it("rechaza formatos de correo inválidos", () => {
    expect(validate_corporate_email("").valid).toBe(false);
    expect(validate_corporate_email("sin-arroba").valid).toBe(false);
    expect(validate_corporate_email("a b@gmodelo.com.mx").valid).toBe(false);
  });
});

describe("send_verification_email_safely", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía el correo con actionCodeSettings cuando el dominio está autorizado", async () => {
    mock_send_email_verification.mockResolvedValueOnce(undefined);
    const fake_firebase_user = { uid: "u1" } as unknown as User;

    await send_verification_email_safely(fake_firebase_user);

    expect(mock_send_email_verification).toHaveBeenCalledTimes(1);
    expect(mock_send_email_verification).toHaveBeenCalledWith(fake_firebase_user, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  });

  it("reintenta sin actionCodeSettings cuando Firebase devuelve auth/unauthorized-continue-uri", async () => {
    mock_send_email_verification
      .mockRejectedValueOnce({ code: "auth/unauthorized-continue-uri" })
      .mockResolvedValueOnce(undefined);
    const fake_firebase_user = { uid: "u2" } as unknown as User;

    await send_verification_email_safely(fake_firebase_user);

    expect(mock_send_email_verification).toHaveBeenCalledTimes(2);
    expect(mock_send_email_verification).toHaveBeenNthCalledWith(1, fake_firebase_user, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
    expect(mock_send_email_verification).toHaveBeenNthCalledWith(2, fake_firebase_user);
  });
});
