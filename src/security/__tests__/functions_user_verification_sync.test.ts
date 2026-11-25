/**
 * @fileoverview Unit tests for server-side corporate verification sync and custom claims helpers.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock_doc_get = vi.fn();
const mock_doc_set = vi.fn();

vi.mock("../../../functions/src/core/firebase_admin", () => ({
  firestore_db: {
    collection: () => ({
      doc: () => ({
        get: (...args: unknown[]) => mock_doc_get(...args),
        set: (...args: unknown[]) => mock_doc_set(...args),
      }),
    }),
  },
  firebase_auth: {},
  firestore_field_value: {},
  enforce_app_check: false,
}));

import {
  build_custom_claims,
  ensure_verified_corporate_profile,
} from "../../../functions/src/users/user_verification_sync";

describe("Functions — Reconciliación automática de usuarios verificados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock_doc_get.mockResolvedValue({ exists: false });
    mock_doc_set.mockResolvedValue(undefined);
  });

  it("aprueba automáticamente un perfil corporativo existente cuando emailVerified es true preservando su rol y área", async () => {
    mock_doc_get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        role: "area_lead",
        area: "Cocimientos",
        approved: false,
        emailVerified: false,
      }),
    });

    const resultado = await ensure_verified_corporate_profile({
      uid: "uid-lead",
      email: "lead@gmodelo.com.mx",
      emailVerified: true,
    });

    expect(resultado).toEqual({
      exists: true,
      created: false,
      updatedApproval: true,
      role: "area_lead",
      area: "Cocimientos",
      approved: true,
      emailVerified: true,
      temporaryAccount: false,
      expired: false,
    });
    expect(mock_doc_set).toHaveBeenCalledWith(
      expect.objectContaining({
        approved: true,
        emailVerified: true,
      }),
      { merge: true },
    );
  });

  it("crea perfil aprobado si faltaba en Firestore y el usuario ya verificó su correo corporativo", async () => {
    mock_doc_get.mockResolvedValueOnce({ exists: false });

    const resultado = await ensure_verified_corporate_profile({
      uid: "uid-sherlyn",
      email: "Sherlyn.Garcia.P@ab-inbev.com",
      displayName: "Sherlyn Garcia",
      emailVerified: true,
    });

    expect(resultado.created).toBe(true);
    expect(resultado.approved).toBe(true);
    expect(mock_doc_set).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "uid-sherlyn",
        name: "SHERLYN GARCIA",
        email: "sherlyn.garcia.p@ab-inbev.com",
        role: "user",
        approved: true,
        emailVerified: true,
      }),
    );
  });

  it("no crea documento prematuro si emailVerified es false y createIfMissingUnverified es false", async () => {
    mock_doc_get.mockResolvedValueOnce({ exists: false });

    const resultado = await ensure_verified_corporate_profile({
      uid: "uid-new",
      email: "nuevo@ab-inbev.com",
      emailVerified: false,
      createIfMissingUnverified: false,
    });

    expect(resultado.exists).toBe(false);
    expect(resultado.approved).toBe(false);
    expect(mock_doc_set).not.toHaveBeenCalled();
  });

  it("rechaza correos externos sin perfil temporal de becario y construye custom claims consistentes", async () => {
    mock_doc_get.mockResolvedValueOnce({ exists: false });
    const resultado = await ensure_verified_corporate_profile({
      uid: "uid-ext",
      email: "usuario@gmail.com",
      emailVerified: true,
    });
    expect(resultado.exists).toBe(false);
    expect(resultado.approved).toBe(false);
    expect(mock_doc_get).toHaveBeenCalledTimes(1);
    expect(mock_doc_set).not.toHaveBeenCalled();

    mock_doc_get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "user", temporaryAccount: false, approved: true }),
    });
    const resultado_no_becario = await ensure_verified_corporate_profile({
      uid: "uid-ext-user",
      email: "intruso@gmail.com",
      emailVerified: true,
    });
    expect(resultado_no_becario.exists).toBe(false);
    expect(resultado_no_becario.approved).toBe(false);

    expect(build_custom_claims({ role: "admin", area: "Dirección", approved: true })).toEqual({
      role: "admin",
      area: "Dirección",
      approved: true,
      admin: true,
    });
    expect(build_custom_claims({ role: "admin", area: "Dirección", approved: false })).toEqual({
      role: "admin",
      area: "Dirección",
      approved: false,
      admin: false,
    });
  });
});
