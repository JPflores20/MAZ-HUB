// @ts-nocheck
import "@testing-library/jest-dom";
/**
 * pareto_chart.test.tsx
 * Pruebas del componente ParetoChart: renderizado de controles clave.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParetoChart } from "../pareto_chart";
import type { ParetoChartItem } from "../pareto_types";

const SAMPLE_DATA: ParetoChartItem[] = [
  { id: 1, area: "Esters", gap: 8, ind_pct: 53.3, cum_pct: 53.3 },
  { id: 2, area: "Sweet", gap: 7, ind_pct: 46.7, cum_pct: 100 },
];

const format_value = (val: unknown) => `${val}`;

const DEFAULT_PROPS = {
  chart_data: SAMPLE_DATA,
  chart_title: "",
  on_chart_title_change: vi.fn(),
  y_axis_min: 0,
  y_axis_max: "auto" as const,
  on_y_axis_min_change: vi.fn(),
  on_y_axis_max_change: vi.fn(),
  unit: "%",
  format_value,
};

describe("ParetoChart", () => {
  it("renderiza el input de nombre del grï¿½fico", () => {
    render(<ParetoChart {...DEFAULT_PROPS} />);
    const title_input = screen.getByPlaceholderText("Nombre del grï¿½fico...");
    expect(title_input).toBeDefined();
  });

  it("llama a on_chart_title_change al escribir el nombre", () => {
    const mock_fn = vi.fn();
    render(<ParetoChart {...DEFAULT_PROPS} on_chart_title_change={mock_fn} />);
    const input = screen.getByPlaceholderText("Nombre del grï¿½fico...");
    fireEvent.change(input, { target: { value: "Pareto Sabores" } });
    expect(mock_fn).toHaveBeenCalledWith("Pareto Sabores");
  });

  it("renderiza los controles de Y mï¿½n y Y mï¿½x", () => {
    render(<ParetoChart {...DEFAULT_PROPS} />);
    expect(screen.getByText(/Y mï¿½n/i)).toBeDefined();
    expect(screen.getByText(/Y mï¿½x/i)).toBeDefined();
  });

  it("llama a on_y_axis_min_change al cambiar el mï¿½nimo", () => {
    const mock_fn = vi.fn();
    render(<ParetoChart {...DEFAULT_PROPS} on_y_axis_min_change={mock_fn} />);
    const min_inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(min_inputs[0], { target: { value: "5" } });
    expect(mock_fn).toHaveBeenCalledWith(5);
  });

  it("muestra el botï¿½n Expandir cuando se provee on_expand y no estï¿½ en fullscreen", () => {
    render(<ParetoChart {...DEFAULT_PROPS} on_expand={vi.fn()} is_fullscreen={false} />);
    expect(screen.getByText(/Expandir/i)).toBeDefined();
  });

  it("no muestra el botï¿½n Expandir en modo fullscreen", () => {
    render(<ParetoChart {...DEFAULT_PROPS} on_expand={vi.fn()} is_fullscreen={true} />);
    expect(screen.queryByText(/Expandir/i)).toBeNull();
  });

  it("muestra el tï¿½tulo editado en el input", () => {
    render(<ParetoChart {...DEFAULT_PROPS} chart_title="Mi Pareto" />);
    const input = screen.getByDisplayValue("Mi Pareto");
    expect(input).toBeDefined();
  });
});
