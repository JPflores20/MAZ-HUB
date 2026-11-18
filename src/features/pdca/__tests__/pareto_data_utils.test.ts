/**
 * @fileoverview Pruebas unitarias de utilidades puras del módulo Pareto.
 */
import { describe, it, expect } from "vitest";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "../plan/paso_10_pareto/pareto_data_utils";
import type { ParetoItem } from "../plan/paso_10_pareto/pareto_types";

const SAMPLE_ITEMS: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
  { id: 3, area: "Yeast", gap: 6 },
  { id: 4, area: "Tart", gap: 4 },
];

describe("compute_pareto_data", () => {
  it("ordena los items de mayor a menor gap", () => {
    const resultado = compute_pareto_data(SAMPLE_ITEMS);
    expect(resultado[0]!.area).toBe("Esters");
    expect(resultado[0]!.gap).toBe(8);
    expect(resultado[1]!.area).toBe("Sweet");
  });

  it("calcula el porcentaje individual correctamente", () => {
    const resultado = compute_pareto_data(SAMPLE_ITEMS);
    const total = 25;
    expect(resultado[0]!.ind_pct).toBeCloseTo((8 / total) * 100, 1);
  });

  it("calcula el porcentaje acumulado correctamente", () => {
    const resultado = compute_pareto_data(SAMPLE_ITEMS);
    const esperado = ((8 + 7) / 25) * 100;
    expect(resultado[1]!.cum_pct).toBeCloseTo(esperado, 1);
  });

  it("el último item siempre acumula 100%", () => {
    const resultado = compute_pareto_data(SAMPLE_ITEMS);
    expect(resultado[resultado.length - 1]!.cum_pct).toBeCloseTo(100, 1);
  });

  it("maneja lista vacía sin errores", () => {
    expect(compute_pareto_data([])).toHaveLength(0);
  });

  it("maneja gaps nulos tratándolos como cero", () => {
    const registros = [{ id: 1, area: "A", gap: null as unknown as number }];
    const resultado = compute_pareto_data(registros);
    expect(resultado[0]!.ind_pct).toBe(0);
  });
});

describe("format_pareto_value", () => {
  it("formatea con unidad de porcentaje y dólar", () => {
    expect(format_pareto_value(8, "%")).toBe("8.00%");
    expect(format_pareto_value(1000, "$")).toBe("$1,000.00");
    expect(format_pareto_value(42.5, "")).toBe("42.50");
  });

  it("retorna cadena vacía para valores nulos", () => {
    expect(format_pareto_value(null, "%")).toBe("");
    expect(format_pareto_value(undefined, "%")).toBe("");
    expect(format_pareto_value(NaN, "%")).toBe("");
  });
});

describe("parse_excel_paste", () => {
  it("parsea tab-separado, suma duplicados, fusiona existentes e ignora líneas vacías", () => {
    const tab_resultado = parse_excel_paste("Falla A\t10\nFalla B\t5", []);
    expect(tab_resultado.find((fila) => fila.area === "Falla A")?.gap).toBe(10);

    const agrupado = parse_excel_paste("Falla A\t10\nFalla A\t15", []);
    expect(agrupado.find((fila) => fila.area === "Falla A")?.gap).toBe(25);

    const existentes: ParetoItem[] = [{ id: 1, area: "Falla A", gap: 10 }];
    expect(parse_excel_paste("Falla B\t5", existentes)).toHaveLength(2);
    expect(parse_excel_paste("Falla A\t10\n\n\nFalla B\t5", [])).toHaveLength(2);
  });
});

describe("compute_total_gap", () => {
  it("calcula la suma correctamente y 0 para lista vacía", () => {
    expect(compute_total_gap(SAMPLE_ITEMS)).toBe(25);
    expect(compute_total_gap([])).toBe(0);
  });
});
