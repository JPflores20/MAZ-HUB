import React from "react";
import { render, screen } from "@testing-library/react";
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
  titulo: "Proyecto de ReducciÃ³n de PÃ©rdidas",
  area: "cocimientos",
  fase: "Plan",
  actualizado: "01/01/2026",
  progreso: 10,
  problema: "VariaciÃ³n tÃ©rmica",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Temperatura", antes: 80, despues: 70, unidad: "Â°C" },
  serie: [],
  equipo: [],
};

describe("PdcaDialog (Componente Refactorizado)", () => {
  it("debe renderizar el diÃ¡logo con el tÃ­tulo del proyecto y los campos de metadatos", () => {
    render(<PdcaDialog pdca={sample_pdca} open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("PDCA-2026-UNIT")).toBeDefined();
    expect(screen.getByDisplayValue("Proyecto de ReducciÃ³n de PÃ©rdidas")).toBeDefined();
    expect(screen.getByText("Guardar PDCA")).toBeDefined();
  });
});
