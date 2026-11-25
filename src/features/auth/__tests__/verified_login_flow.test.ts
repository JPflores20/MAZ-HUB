/**
 * @fileoverview Unit tests verifying automatic access grant upon corporate email verification and missing-profile recovery.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { CORPORATE_EMAIL_ERROR } from "../email_validation";
import { resolve_verified_approved_profile, sign_in_corporate_user } from "../auth_session_helpers";

const mock_sign_in = vi.fn();
const mock_sign_out = vi.fn();
const mock_get_user = vi.fn();
const mock_sync_verified_profile = vi.fn();
const mock_mark_user_verified = vi.fn();

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
      mark_user_verified: (...args: unknown[]) => mock_mark_user_verified(...args),
    },
  };
});

describe("Login y reconciliación automática tras verificación de correo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock_sign_out.mockResolvedValue(undefined);
    mock_sync_verified_profile.mockResolvedValue({
      uid: "uid-1",
      role: "user",
      approved: true,
      emailVerified: true,
    });
    mock_mark_user_verified.mockResolvedValue(undefined);
  });

  it("permite acceso sin aprobación admin cuando el correo ya fue verificado aunque Firestore tuviera approved: false", async () => {
    const mock_get_id_token = vi.fn().mockResolvedValue("fresh-token");
    const fake_user = {
      uid: "uid-sherlyn",
      email: "sherlyn.garcia.p@ab-inbev.com",
      emailVerified: true,
      getIdToken: mock_get_id_token,
    } as unknown as User;

    mock_sign_in.mockResolvedValueOnce({ user: fake_user });
    mock_get_user
      .mockResolvedValueOnce({
        uid: "uid-sherlyn",
        name: "SHERLYN GARCIA",
        email: "sherlyn.garcia.p@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: false,
        emailVerified: false,
      })
      .mockResolvedValueOnce({
        uid: "uid-sherlyn",
        name: "SHERLYN GARCIA",
        email: "sherlyn.garcia.p@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: true,
        emailVerified: true,
      });

    const profile = await sign_in_corporate_user("sherlyn.garcia.p@ab-inbev.com", "Modelo2026!");

    expect(mock_sync_verified_profile).toHaveBeenCalledTimes(1);
    expect(mock_get_id_token).toHaveBeenCalledWith(true);
    expect(profile.approved).toBe(true);
    expect(profile.emailVerified).toBe(true);
    expect(mock_sign_out).not.toHaveBeenCalled();
  });

  it("recupera perfil faltante cuando el usuario verificó su correo pero no existía documento /users/{uid}", async () => {
    const mock_get_id_token = vi.fn().mockResolvedValue("fresh-token");
    const fake_user = {
      uid: "uid-missing",
      email: "sherlyn.garcia.p@ab-inbev.com",
      emailVerified: true,
      displayName: "SHERLYN GARCIA",
      getIdToken: mock_get_id_token,
    } as unknown as User;

    mock_get_user.mockResolvedValueOnce(null).mockResolvedValueOnce({
      uid: "uid-missing",
      name: "SHERLYN GARCIA",
      email: "sherlyn.garcia.p@ab-inbev.com",
      role: "user",
      area: "Usuario",
      approved: true,
      emailVerified: true,
    });

    const profile = await resolve_verified_approved_profile(fake_user);

    expect(mock_sync_verified_profile).toHaveBeenCalledTimes(1);
    expect(mock_get_id_token).toHaveBeenCalledWith(true);
    expect(profile?.uid).toBe("uid-missing");
    expect(profile?.approved).toBe(true);
  });

  it("no invoca sync_verified_profile si el perfil ya está aprobado en Firestore", async () => {
    const fake_user = {
      uid: "uid-ok",
      email: "ana.lopez@gmodelo.com.mx",
      emailVerified: true,
    } as unknown as User;

    mock_sign_in.mockResolvedValueOnce({ user: fake_user });
    mock_get_user.mockResolvedValueOnce({
      uid: "uid-ok",
      name: "ANA LOPEZ",
      email: "ana.lopez@gmodelo.com.mx",
      role: "user",
      area: "Envase",
      approved: true,
      emailVerified: true,
    });

    const profile = await sign_in_corporate_user("ana.lopez@gmodelo.com.mx", "Modelo2026!");

    expect(mock_sync_verified_profile).not.toHaveBeenCalled();
    expect(profile.approved).toBe(true);
  });

  it("bloquea usuarios con correo aún sin verificar y rechaza dominios externos", async () => {
    const unverified_user = {
      uid: "uid-unverified",
      email: "nuevo@ab-inbev.com",
      emailVerified: false,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as User;

    mock_sign_in.mockResolvedValueOnce({ user: unverified_user });

    await expect(sign_in_corporate_user("nuevo@ab-inbev.com", "Modelo2026!")).rejects.toThrow(
      /verifica tu correo/i,
    );
    expect(mock_sign_out).toHaveBeenCalledTimes(1);
    expect(mock_sync_verified_profile).not.toHaveBeenCalled();

    mock_sign_in.mockResolvedValueOnce({
      user: {
        uid: "uid-ext",
        email: "externo@gmail.com",
        emailVerified: true,
      } as unknown as User,
    });
    mock_get_user.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mock_sync_verified_profile.mockRejectedValueOnce(new Error("not corporate"));

    await expect(sign_in_corporate_user("externo@gmail.com", "Modelo2026!")).rejects.toThrow(
      CORPORATE_EMAIL_ERROR,
    );
    expect(mock_sign_out).toHaveBeenCalledTimes(2);
  });
});
