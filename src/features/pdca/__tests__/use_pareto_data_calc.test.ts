/**
 * @fileoverview Pruebas unitarias de cálculo y operaciones CRUD en el hook use_pareto_data.
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { use_pareto_data } from "../plan/paso_10_pareto/use_pareto_data";
import type { ParetoItem } from "../plan/paso_10_pareto/pareto_types";

const SAMPLE_ITEMS: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
  { id: 3, area: "Yeast", gap: 6 },
  { id: 4, area: "Tart", gap: 4 },
];

describe("use_pareto_data > pareto_data calculation", () => {
  it("ordena los items de mayor a menor gap", () => {
    const { result } = renderHook(() => use_pareto_data({ items: SAMPLE_ITEMS }));
    expect(result.current.pareto_data[0]?.area).toBe("Esters");
    expect(result.current.pareto_data[0]?.gap).toBe(8);
    expect(result.current.pareto_data[1]?.area).toBe("Sweet");
  });

  it("calcula el porcentaje acumulado correctamente hasta llegar a 100%", () => {
    const { result } = renderHook(() => use_pareto_data({ items: SAMPLE_ITEMS }));
    expect(result.current.pareto_data[0]?.cum_pct).toBeCloseTo((8 / 25) * 100, 1);
    expect(result.current.pareto_data[1]?.cum_pct).toBeCloseTo(((8 + 7) / 25) * 100, 1);
    const ultimo = result.current.pareto_data[result.current.pareto_data.length - 1];
    expect(ultimo?.cum_pct).toBeCloseTo(100, 1);
  });

  it("calcula total_gap y maneja arreglos vacíos", () => {
    const { result } = renderHook(() => use_pareto_data({ items: SAMPLE_ITEMS }));
    expect(result.current.total_gap).toBe(25);

    const { result: vacio } = renderHook(() => use_pareto_data({ items: [] }));
    expect(vacio.current.pareto_data).toHaveLength(0);
    expect(vacio.current.total_gap).toBe(0);
  });
});

describe("use_pareto_data > add_row & remove_row", () => {
  it("agrega fila vacía al llamar add_row y tolera callback indefinido", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change }),
    );
    act(() => result.current.add_row());
    expect(mock_change).toHaveBeenCalledOnce();
    const llamadas = mock_change.mock.calls[0]?.[0] as ParetoItem[];
    expect(llamadas).toHaveLength(SAMPLE_ITEMS.length + 1);
    expect(llamadas[llamadas.length - 1]?.area).toBe("");
    expect(llamadas[llamadas.length - 1]?.gap).toBe(0);

    const { result: sin_callback } = renderHook(() => use_pareto_data({ items: SAMPLE_ITEMS }));
    expect(() => act(() => sin_callback.current.add_row())).not.toThrow();
  });

  it("elimina la fila con el id dado", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change }),
    );
    act(() => result.current.remove_row(2));
    const actualizados = mock_change.mock.calls[0]?.[0] as ParetoItem[];
    expect(actualizados.find((fila) => fila.id === 2)).toBeUndefined();
    expect(actualizados).toHaveLength(SAMPLE_ITEMS.length - 1);
  });
});

describe("use_pareto_data > update_row", () => {
  it("actualiza área o gap sin alterar otras filas", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change }),
    );
    act(() => result.current.update_row(1, "area", "Estery"));
    expect((mock_change.mock.calls[0]?.[0] as ParetoItem[]).find((fila) => fila.id === 1)?.area).toBe(
      "Estery",
    );

    act(() => result.current.update_row(3, "gap", 99));
    const segunda_llamada = mock_change.mock.calls[1]?.[0] as ParetoItem[];
    expect(segunda_llamada.find((fila) => fila.id === 3)?.gap).toBe(99);
    expect(segunda_llamada.find((fila) => fila.id === 2)?.gap).toBe(7);
  });
});
