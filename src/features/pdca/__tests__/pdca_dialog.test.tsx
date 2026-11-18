/**
 * @fileoverview Pruebas de integración del componente principal PdcaDialog.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Pdca } from "@/domain/pdca";
import { PdcaDialog } from "../dialog/pdca_dialog";

vi.mock("@/features/auth/auth_context", () => ({
  get_effective_permissions: () => ({
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageAssignment: true,
    canViewArea: true,
    canViewAll: true,
  }),
  useAuth: () => ({
    currentUser: { name: "Ingeniero Modelo", email: "modelo@corona.com", role: "admin" },
    usersList: [{ name: "Ingeniero Modelo", email: "modelo@corona.com" }],
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManageAssignment: true,
      canViewArea: true,
      canViewAll: true,
    },
  }),
}));

vi.mock("@/shared/services/pdca/pdca_firestore_mutations", () => ({
  save_pdca_to_firestore: vi.fn().mockResolvedValue(true),
}));

const sample_pdca: Pdca = {
  id: "PDCA-2026-UNIT",
  titulo: "Proyecto de Reducción de Pérdidas",
  area: "cocimientos",
  fase: "Plan",
  actualizado: "01/01/2026",
  progreso: 10,
  problema: "Variación térmica",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Temperatura", antes: 80, despues: 70, unidad: "°C" },
  serie: [],
  equipo: [],
};

describe("PdcaDialog (Componente Refactorizado)", () => {
  it("debe renderizar el diálogo con el título del proyecto y los campos de metadatos", () => {
    render(<PdcaDialog pdca={sample_pdca} open={true} onOpenChange={vi.fn()} />);

    expect(screen.getAllByText("PDCA-2026-UNIT").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", { name: "Proyecto de Reducción de Pérdidas" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Guardar PDCA/i)).toBeDefined();

    fireEvent.click(screen.getByText(/1\. PLAN/i));
    fireEvent.click(screen.getByRole("button", { name: /Identificación del Problema/i }));
    fireEvent.click(screen.getByText(/PASO 1: DECLARACIÓN DEL PROYECTO/i));
    expect(screen.getByDisplayValue("Proyecto de Reducción de Pérdidas")).toBeDefined();
  });
});
