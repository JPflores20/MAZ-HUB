/**
 * pdca_dialog.test.tsx
 * Pruebas de integración del componente principal PdcaDialog.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaDialog } from "../pdca_dialog";
import type { Pdca } from "@/data/pdca";

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    currentUser: { name: "Ingeniero Modelo", email: "modelo@corona.com", role: "admin" },
    usersList: [{ name: "Ingeniero Modelo", email: "modelo@corona.com" }],
  }),
}));

vi.mock("@/services/pdca-service", () => ({
  savePdcaToFirestore: vi.fn().mockResolvedValue(true),
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

    // Al cambiar a la pestaña Plan, abrir la subfase 1 y expandir el Paso 1 se muestra el campo de título editable
    fireEvent.click(screen.getByText(/1\. PLAN/i));
    fireEvent.click(screen.getByRole("button", { name: /Identificación del Problema/i }));
    fireEvent.click(screen.getByText(/PASO 1: DECLARACIÓN DEL PROYECTO/i));
    expect(screen.getByDisplayValue("Proyecto de Reducción de Pérdidas")).toBeDefined();
  });
});
