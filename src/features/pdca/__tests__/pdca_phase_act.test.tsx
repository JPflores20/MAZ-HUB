/**
 * @fileoverview Pruebas unitarias de la Fase 4 (ACT) del PDCA.
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { vi } from "vitest";
import { PdcaPhaseAct } from "../act/pdca_phase_act";

describe("PdcaPhaseAct", () => {
  it("debe renderizar los pasos de la fase de Estandarización (Act)", () => {
    render(
      <PdcaPhaseAct
        tabla_estandarizacion={[]}
        on_tabla_estandarizacion_change={vi.fn()}
        completed_steps={new Set()}
        na_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
      />,
    );

    expect(screen.getByText(/PASO 28: ESTANDARIZACIÓN DE PROCESOS/i)).toBeDefined();
    expect(screen.getByText(/PASO 30: SOPs & DOCUMENTOS/i)).toBeDefined();
    expect(screen.getByText(/PASO 31: PLAN DE ENTRENAMIENTO/i)).toBeDefined();
    expect(screen.getByText(/PASO 32: PLAN DE CONTROL/i)).toBeDefined();
    expect(screen.getByText(/PASO 33: LECCIONES APRENDIDAS/i)).toBeDefined();
    expect(screen.getByText(/PASO 34: CONCLUSIONES/i)).toBeDefined();
  });
});
