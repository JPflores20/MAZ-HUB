/**
 * pdca_context.test.ts
 * Pruebas unitarias para `pdca_context.tsx`.
 */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pdca } from "@/domain/pdca";
import * as auth_context from "@/features/auth/auth_context";
import * as pdca_queries from "@/shared/services/pdca/pdca_firestore_queries";
import { PdcaProvider, usePdcas } from "../pdca_context";

vi.mock("@/features/auth/auth_context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/shared/services/pdca/pdca_firestore_queries", () => ({
  fetch_pdcas_from_firestore: vi.fn(),
}));

function create_wrapper() {
  const query_client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: query_client },
      React.createElement(PdcaProvider, null, children),
    );
}

function mock_pdca(
  pdca_id: string,
  autor_email: string,
  asignados: NonNullable<Pdca["asignados"]> = [],
): Pdca {
  return {
    id: pdca_id,
    titulo: `Test ${pdca_id}`,
    area: "Test",
    fase: "Plan",
    actualizado: "",
    progreso: 0,
    problema: "",
    causaRaiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Test KPI", antes: 0, despues: 0, unidad: "%" },
    serie: [],
    autorEmail: autor_email,
    asignados,
  };
}

const mock_pdcas = [
  mock_pdca("1", "admin@test.com"),
  mock_pdca("2", "user@test.com"),
  mock_pdca("3", "other@test.com", [{ email: "user@test.com", name: "User" }]),
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(pdca_queries.fetch_pdcas_from_firestore).mockResolvedValue(mock_pdcas);
});

describe("PdcaProvider / usePdcas", () => {
  it("retorna valores por defecto seguros si se usa fuera del provider", () => {
    const { result: hook_result } = renderHook(() => usePdcas());
    expect(hook_result.current.pdcaList).toEqual([]);
    expect(hook_result.current.allPdcas).toEqual([]);
    expect(hook_result.current.loading).toBe(true);
  });

  it("retorna listas vacías y loading false si no hay usuario logueado", () => {
    vi.mocked(auth_context.useAuth).mockReturnValue({
      currentUser: null,
    } as ReturnType<typeof auth_context.useAuth>);

    const { result: hook_result } = renderHook(() => usePdcas(), { wrapper: create_wrapper() });

    expect(hook_result.current.loading).toBe(false);
    expect(hook_result.current.pdcaList).toEqual([]);
    expect(hook_result.current.allPdcas).toEqual([]);
  });

  it("retorna todos los PDCAs si el usuario es admin", async () => {
    vi.mocked(auth_context.useAuth).mockReturnValue({
      currentUser: { role: "admin", email: "admin@test.com", name: "Admin" },
    } as unknown as ReturnType<typeof auth_context.useAuth>);

    const { result: hook_result } = renderHook(() => usePdcas(), { wrapper: create_wrapper() });

    await waitFor(() => expect(hook_result.current.loading).toBe(false));
    expect(hook_result.current.pdcaList).toHaveLength(3);
    expect(hook_result.current.allPdcas).toHaveLength(3);
  });

  it("permite ver todos los PDCAs para usuarios normales autenticados", async () => {
    vi.mocked(auth_context.useAuth).mockReturnValue({
      currentUser: { role: "user", email: "user@test.com", name: "User" },
    } as unknown as ReturnType<typeof auth_context.useAuth>);

    const { result: hook_result } = renderHook(() => usePdcas(), { wrapper: create_wrapper() });

    await waitFor(() => expect(hook_result.current.loading).toBe(false));
    expect(hook_result.current.allPdcas).toHaveLength(3);
    expect(hook_result.current.pdcaList).toHaveLength(3);
    expect(hook_result.current.pdcaList.map((pdca_item) => pdca_item.id)).toEqual(["1", "2", "3"]);
  });

  it("mantiene las listas pdcaList y allPdcas sincronizadas", async () => {
    vi.mocked(auth_context.useAuth).mockReturnValue({
      currentUser: { role: "admin", email: "admin@test.com", name: "Admin" },
    } as unknown as ReturnType<typeof auth_context.useAuth>);

    const { result: hook_result } = renderHook(() => usePdcas(), { wrapper: create_wrapper() });

    await waitFor(() => expect(hook_result.current.loading).toBe(false));
    expect(hook_result.current.pdcaList).toEqual(hook_result.current.allPdcas);
  });
});
