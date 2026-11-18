/**
 * @fileoverview Pruebas unitarias de la tabla editable de datos ParetoDataTable.
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParetoDataTable } from "../plan/paso_10_pareto/pareto_data_table";
import type { ParetoChartItem, ParetoItem } from "../plan/paso_10_pareto/pareto_types";

const SAMPLE_CHART_ITEMS: ParetoChartItem[] = [
  { id: 1, area: "Esters", gap: 8, ind_pct: 32, cum_pct: 32 },
  { id: 2, area: "Sweet", gap: 7, ind_pct: 28, cum_pct: 60 },
];

const SAMPLE_RAW: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
];

const format_value = (valor: unknown) => `${valor}`;

describe("ParetoDataTable", () => {
  it("renderiza los encabezados de la tabla", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByText(/Área \/ Categoría/i)).toBeDefined();
    expect(screen.getByText(/% Ind\./i)).toBeDefined();
    expect(screen.getByText(/% Acum\./i)).toBeDefined();
    expect(screen.getByText("TOTAL")).toBeDefined();
  });

  it("renderiza todos los items de datos", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByDisplayValue("Esters")).toBeDefined();
    expect(screen.getByDisplayValue("Sweet")).toBeDefined();
  });

  it("llama a on_row_update al cambiar el área", () => {
    const mock_update = vi.fn();
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={mock_update}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    const input_area = screen.getByDisplayValue("Esters");
    fireEvent.change(input_area, { target: { value: "Estery" } });
    expect(mock_update).toHaveBeenCalledWith(1, "area", "Estery");
  });

  it("muestra botones de eliminar cuando hay más de un item", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("muestra el total correctamente", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByText("15")).toBeDefined();
  });
});
