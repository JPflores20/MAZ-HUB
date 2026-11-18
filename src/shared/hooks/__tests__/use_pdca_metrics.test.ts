/**
 * use_pdca_metrics.test.ts
 * Pruebas unitarias para `use_pdca_metrics.ts`.
 */
import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Pdca } from "@/domain/models/pdca";
import { usePdcaMetrics } from "../use_pdca_metrics";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
});

afterAll(() => {
  vi.useRealTimers();
});

function create_pdca(partial_pdca: Partial<Pdca>): Pdca {
  return {
    id: "test",
    titulo: "test",
    area: "",
    fase: "Plan",
    actualizado: "",
    progreso: 0,
    problema: "",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "", antes: 0, despues: 0, unidad: "" },
    serie: [],
    ...partial_pdca,
  };
}

describe("usePdcaMetrics", () => {
  it("retorna todo en 0 con un arreglo vacío", () => {
    const { result: hook_result } = renderHook(() => usePdcaMetrics([]));
    expect(hook_result.current).toEqual({
      activos: 0,
      cerrados: 0,
      bloque_frio: 0,
      cocimientos: 0,
      vencidos: 0,
      a_tiempo: 0,
    });
  });

  it("cuenta correctamente activos vs cerrados", () => {
    const sample_pdcas = [
      create_pdca({ fase: "Act", progreso: 100 }),
      create_pdca({ fase: "Act", progreso: 99 }),
      create_pdca({ fase: "Plan", progreso: 0 }),
    ];

    const { result: hook_result } = renderHook(() => usePdcaMetrics(sample_pdcas));
    expect(hook_result.current.cerrados).toBe(1);
    expect(hook_result.current.activos).toBe(2);
  });

  it("clasifica por áreas incluyendo Fermentación y Filtración dentro de Bloque Frío", () => {
    const sample_pdcas = [
      create_pdca({ area: "Cuartos Fríos" }),
      create_pdca({ area: "bloque frio" }),
      create_pdca({ area: "fermentacion" }),
      create_pdca({ area: "Filtración" }),
      create_pdca({ area: "Cocimientos L1" }),
      create_pdca({ area: "Envasado" }),
    ];

    const { result: hook_result } = renderHook(() => usePdcaMetrics(sample_pdcas));
    expect(hook_result.current.bloque_frio).toBe(4);
    expect(hook_result.current.cocimientos).toBe(1);
  });

  it("calcula vencidos vs a tiempo para los PDCAs activos (referencia: 2026-09-08)", () => {
    const sample_pdcas = [
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-09-01" }),
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-10-01" }),
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-09-08" }),
      create_pdca({ fase: "Act", progreso: 100, fecha_finalizacion: "2026-01-01" }),
      create_pdca({ fase: "Plan", fecha_finalizacion: "" }),
    ];

    const { result: hook_result } = renderHook(() => usePdcaMetrics(sample_pdcas));
    expect(hook_result.current.vencidos).toBe(1);
    expect(hook_result.current.a_tiempo).toBe(2);
  });
});
