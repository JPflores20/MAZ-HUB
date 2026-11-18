/**
 * @fileoverview Pruebas unitarias de formateo, importación Excel y estado UI en use_pareto_data.
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { use_pareto_data } from "../plan/paso_10_pareto/use_pareto_data";
import type { ParetoItem } from "../plan/paso_10_pareto/pareto_types";

describe("use_pareto_data > format_value", () => {
  it("formatea valores con unidades %, $, sin unidad y maneja nulos", () => {
    const { result: pct } = renderHook(() => use_pareto_data({ items: [], unit: "%" }));
    expect(pct.current.format_value(8)).toBe("8.00%");
    expect(pct.current.format_value(null)).toBe("");
    expect(pct.current.format_value(undefined)).toBe("");
    expect(pct.current.format_value(NaN)).toBe("");

    const { result: usd } = renderHook(() => use_pareto_data({ items: [], unit: "$" }));
    expect(usd.current.format_value(1000)).toBe("$1,000.00");

    const { result: libre } = renderHook(() => use_pareto_data({ items: [], unit: "" }));
    expect(libre.current.format_value(42.5)).toBe("42.50");
  });
});

describe("use_pareto_data > handle_import_excel", () => {
  it("agrega, agrupa duplicados y fusiona con items existentes", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() => use_pareto_data({ items: [], on_items_change: mock_change }));
    act(() => result.current.handle_import_excel("Falla A\t10\nFalla B\t5"));
    const primera = mock_change.mock.calls[0]?.[0] as ParetoItem[];
    expect(primera.find((fila) => fila.area === "Falla A")?.gap).toBe(10);
    expect(primera.find((fila) => fila.area === "Falla B")?.gap).toBe(5);

    act(() => result.current.handle_import_excel("Falla A\t10\nFalla A\t15"));
    const segunda = mock_change.mock.calls[1]?.[0] as ParetoItem[];
    expect(segunda.find((fila) => fila.area === "Falla A")?.gap).toBe(25);

    const mock_fusion = vi.fn();
    const existentes: ParetoItem[] = [{ id: 1, area: "Falla A", gap: 10 }];
    const { result: fusionado } = renderHook(() =>
      use_pareto_data({ items: existentes, on_items_change: mock_fusion }),
    );
    act(() => fusionado.current.handle_import_excel("Falla B\t5"));
    const tercera = mock_fusion.mock.calls[0]?.[0] as ParetoItem[];
    expect(tercera).toHaveLength(2);
  });
});

describe("use_pareto_data > UI state", () => {
  it("administra is_paste_open, is_fullscreen, chart_title y límites de eje Y", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.is_paste_open).toBe(false);
    expect(result.current.is_fullscreen).toBe(false);
    expect(result.current.chart_title).toBe("");
    expect(result.current.y_axis_min).toBe(0);
    expect(result.current.y_axis_max).toBe("auto");

    act(() => {
      result.current.set_is_paste_open(true);
      result.current.set_is_fullscreen(true);
      result.current.set_chart_title("Mi Pareto");
      result.current.set_y_axis_max(100);
    });
    expect(result.current.is_paste_open).toBe(true);
    expect(result.current.is_fullscreen).toBe(true);
    expect(result.current.chart_title).toBe("Mi Pareto");
    expect(result.current.y_axis_max).toBe(100);

    act(() => result.current.set_y_axis_max("auto"));
    expect(result.current.y_axis_max).toBe("auto");
  });
});
