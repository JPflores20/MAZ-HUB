/**
 * @fileoverview Unit tests verifying login, email-verification, and expiration enforcement for temporary intern accounts.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { CORPORATE_EMAIL_ERROR } from "../email_validation";
import { sign_in_corporate_user } from "../auth_session_helpers";

const mock_sign_in = vi.fn();
const mock_sign_out = vi.fn();
const mock_get_user = vi.fn();
const mock_sync_verified_profile = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    signInWithEmailAndPassword: (...args: unknown[]) => mock_sign_in(...args),
    signOut: (...args: unknown[]) => mock_sign_out(...args),
  };
});

vi.mock("@/core/config/firebase", () => ({
  primary_auth: { languageCode: "es" },
  db: {},
  storage: {},
  functions: {},
  isFirebaseConfigured: true,
}));

vi.mock("../user_service", async () => {
  const actual = await vi.importActual<typeof import("../user_service")>("../user_service");
  return {
    ...actual,
    user_service: {
      ...actual.user_service,
      get_user: (...args: unknown[]) => mock_get_user(...args),
      sync_verified_profile: (...args: unknown[]) => mock_sync_verified_profile(...args),
    },
  };
});

describe("Login de becarios temporales con correo externo (Gmail)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock_sign_out.mockResolvedValue(undefined);
    mock_sync_verified_profile.mockRejectedValue(new Error("not corporate"));
  });

  it("permite acceso a becarios temporales con Gmail verificados y vigentes", async () => {
    const valid_intern = {
      uid: "uid-intern-ok",
      email: "becario@gmail.com",
      emailVerified: true,
    } as unknown as User;

    mock_sign_in.mockResolvedValueOnce({ user: valid_intern });
    mock_get_user.mockResolvedValueOnce({
      uid: "uid-intern-ok",
      name: "BECARIO OK",
      email: "becario@gmail.com",
      role: "intern",
      area: "ENVASE",
      approved: true,
      verifiedByAdmin: true,
      temporaryAccount: true,
      emailVerified: true,
      expiresAtMs: Date.now() + 86_400_000,
    });

    const profile = await sign_in_corporate_user("becario@gmail.com", "Modelo2026!");
    expect(profile.role).toBe("intern");
    expect(profile.temporaryAccount).toBe(true);
    expect(mock_sign_out).not.toHaveBeenCalled();
  });

  it("exige verificación de correo incluso para becarios temporales creados por administrador", async () => {
    const unverified_intern = {
      uid: "uid-intern-unverified",
      email: "becario.nuevo@gmail.com",
      emailVerified: false,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as User;

    mock_sign_in.mockResolvedValueOnce({ user: unverified_intern });

    await expect(sign_in_corporate_user("becario.nuevo@gmail.com", "Modelo2026!")).rejects.toThrow(
      /verifica tu correo/i,
    );
    expect(mock_sign_out).toHaveBeenCalledTimes(1);
  });

  it("bloquea becarios temporales expirados y cuentas Gmail no provisionadas por admin", async () => {
    const expired_intern = {
      uid: "uid-intern-exp",
      email: "expirado@gmail.com",
      emailVerified: true,
    } as unknown as User;
    mock_sign_in.mockResolvedValueOnce({ user: expired_intern });
    mock_get_user.mockResolvedValueOnce({
      uid: "uid-intern-exp",
      name: "BECARIO EXPIRADO",
      email: "expirado@gmail.com",
      role: "intern",
      area: "ENVASE",
      approved: true,
      verifiedByAdmin: true,
      temporaryAccount: true,
      emailVerified: true,
      expiresAtMs: Date.now() - 1000,
    });

    await expect(sign_in_corporate_user("expirado@gmail.com", "Modelo2026!")).rejects.toThrow(
      /ha expirado/i,
    );
    expect(mock_sign_out).toHaveBeenCalledTimes(1);

    const rogue_gmail = {
      uid: "uid-rogue",
      email: "intruso@gmail.com",
      emailVerified: true,
    } as unknown as User;
    mock_sign_in.mockResolvedValueOnce({ user: rogue_gmail });
    mock_get_user.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(sign_in_corporate_user("intruso@gmail.com", "Modelo2026!")).rejects.toThrow(
      CORPORATE_EMAIL_ERROR,
    );
  });
});
