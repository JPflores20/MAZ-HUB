/**
 * @fileoverview Hook reutilizable para administrar el estado de un Pareto interactivo individual.
 */
import { useState } from "react";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "./pareto_data_utils";
import type { ParetoItem, ParetoChartItem } from "./pareto_types";

export interface UseParetoDataOptions {
  items?: ParetoItem[];
  on_items_change?: (items: ParetoItem[]) => void;
  unit?: string;
}

export interface UseParetoDataResult {
  pareto_data: ParetoChartItem[];
  total_gap: number;
  format_value: (valor: unknown) => string;
  add_row: () => void;
  update_row: (fila_id: number, campo: "area" | "gap", valor: string | number) => void;
  remove_row: (fila_id: number) => void;
  handle_import_excel: (texto_crudo: string) => void;
  is_paste_open: boolean;
  set_is_paste_open: (abierto: boolean) => void;
  is_fullscreen: boolean;
  set_is_fullscreen: (pantalla_completa: boolean) => void;
  chart_title: string;
  set_chart_title: (titulo: string) => void;
  y_axis_min: number;
  set_y_axis_min: (minimo: number) => void;
  y_axis_max: number | "auto";
  set_y_axis_max: (maximo: number | "auto") => void;
}

/**
 * Encapsula la transformación de datos, controles de ejes e importación desde Excel de un Pareto.
 */
export function use_pareto_data({
  items = [],
  on_items_change,
  unit = "",
}: UseParetoDataOptions): UseParetoDataResult {
  const [is_paste_open, set_is_paste_open] = useState(false);
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const [chart_title, set_chart_title] = useState("");
  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max, set_y_axis_max] = useState<number | "auto">("auto");

  const pareto_data = compute_pareto_data(items);
  const total_gap = compute_total_gap(items);
  const format_value = (valor: unknown) => format_pareto_value(valor, unit);

  const add_row = () => {
    on_items_change?.([...items, { id: Date.now(), area: "", gap: 0 }]);
  };

  const update_row = (fila_id: number, campo: "area" | "gap", valor: string | number) => {
    on_items_change?.(
      items.map((item_actual) =>
        item_actual.id === fila_id ? { ...item_actual, [campo]: valor } : item_actual,
      ),
    );
  };

  const remove_row = (fila_id: number) => {
    on_items_change?.(items.filter((item_actual) => item_actual.id !== fila_id));
  };

  const handle_import_excel = (texto_crudo: string) => {
    const combinados = parse_excel_paste(texto_crudo, items);
    if (combinados.length > 0) {
      on_items_change?.(combinados);
    }
  };

  return {
    pareto_data,
    total_gap,
    format_value,
    add_row,
    update_row,
    remove_row,
    handle_import_excel,
    is_paste_open,
    set_is_paste_open,
    is_fullscreen,
    set_is_fullscreen,
    chart_title,
    set_chart_title,
    y_axis_min,
    set_y_axis_min,
    y_axis_max,
    set_y_axis_max,
  };
}
