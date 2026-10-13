/**
 * Pruebas unitarias para `pdca-context.tsx`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PdcaProvider, usePdcas } from "../pdca-context";
import * as auth_context from "../auth-context";
import * as pdca_service from "@/services/pdca-service";
import type { Pdca } from "@/data/pdca";

vi.mock("../auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/pdca-service", () => ({
  fetchPdcasFromFirestore: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(PdcaProvider, null, children),
    );
}

function mock_pdca(id: string, autorEmail: string, asignados: any[] = []): Pdca {
  return {
    id,
    titulo: `Test ${id}`,
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
    autorEmail,
    asignados,
  };
}

const mock_data = [
  mock_pdca("1", "admin@test.com"),
  mock_pdca("2", "user@test.com"),
  mock_pdca("3", "other@test.com", [{ email: "user@test.com", name: "User" }]),
];

beforeEach(() => {
  vi.clearAllMocks();
  (pdca_service.fetchPdcasFromFirestore as any).mockResolvedValue(mock_data);
});

describe("PdcaProvider / usePdcas", () => {
  it("retorna valores por defecto seguros si se usa fuera del provider", () => {
    const { result } = renderHook(() => usePdcas());
    expect(result.current.pdcaList).toEqual([]);
    expect(result.current.allPdcas).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it("retorna listas vacías y loading false si no hay usuario logueado", () => {
    (auth_context.useAuth as any).mockReturnValue({ currentUser: null });

    const { result } = renderHook(() => usePdcas(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(false);
    expect(result.current.pdcaList).toEqual([]);
    expect(result.current.allPdcas).toEqual([]);
  });

  it("retorna todos los PDCAs si el usuario es admin", async () => {
    (auth_context.useAuth as any).mockReturnValue({
      currentUser: { role: "admin", email: "admin@test.com", name: "Admin" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pdcaList).toHaveLength(3);
    expect(result.current.allPdcas).toHaveLength(3);
  });

  it("filtra los PDCAs para usuarios normales (sólo propios o asignados)", async () => {
    (auth_context.useAuth as any).mockReturnValue({
      currentUser: { role: "user", email: "user@test.com", name: "User" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Debería ver el 2 (es autor) y el 3 (está asignado)
    expect(result.current.allPdcas).toHaveLength(3);
    expect(result.current.pdcaList).toHaveLength(2);
    expect(result.current.pdcaList.map((p: any) => p.id)).toEqual(["2", "3"]);
  });

  it("mantiene las listas pdcaList y allPdcas sincronizadas", async () => {
    (auth_context.useAuth as any).mockReturnValue({
      currentUser: { role: "admin", email: "admin@test.com", name: "Admin" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pdcaList).toEqual(result.current.allPdcas);
  });
});
