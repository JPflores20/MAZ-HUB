/**
 * @fileoverview Funciones puras de ordenamiento, cálculo acumulado 80/20, formateo e importación desde Excel.
 */
import type { ParetoItem, ParetoChartItem } from "./pareto_types";

/**
 * Ordena elementos de mayor a menor brecha (gap) y calcula porcentaje individual y acumulado.
 * @param items - Lista de categorías y valores numéricos.
 */
export function compute_pareto_data(items: ParetoItem[]): ParetoChartItem[] {
  const items_ordenados = [...items].sort(
    (item_anterior, item_siguiente) => (item_siguiente.gap ?? 0) - (item_anterior.gap ?? 0),
  );
  const total_gap = items_ordenados.reduce(
    (acumulado, item_actual) => acumulado + (item_actual.gap ?? 0),
    0,
  );

  let porcentaje_acumulado = 0;
  return items_ordenados.map((item_actual) => {
    const porcentaje_individual =
      total_gap > 0 ? ((item_actual.gap ?? 0) / total_gap) * 100 : 0;
    porcentaje_acumulado += porcentaje_individual;
    return {
      ...item_actual,
      ind_pct: porcentaje_individual,
      cum_pct: porcentaje_acumulado,
    };
  });
}

/**
 * Formatea un valor numérico aplicando el símbolo o unidad de medida configurada.
 */
export function format_pareto_value(valor_entrada: unknown, unidad: string): string {
  if (valor_entrada === null || valor_entrada === undefined || Number.isNaN(valor_entrada)) {
    return "";
  }
  const numero_formateado = Number(valor_entrada).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (unidad === "$") return `$${numero_formateado}`;
  if (!unidad) return numero_formateado;
  return unidad === "%" ? `${numero_formateado}%` : `${numero_formateado} ${unidad}`;
}

/**
 * Parsea texto tabular pegado desde Excel o CSV y acumula los valores por categoría.
 */
export function parse_excel_paste(
  texto_crudo: string,
  items_existentes: ParetoItem[],
): ParetoItem[] {
  const lineas_texto = texto_crudo.split("\n");
  const agregado_nuevo: Record<string, number> = {};

  for (const linea_actual of lineas_texto) {
    if (!linea_actual.trim()) continue;
    const columnas_tab = linea_actual.split("\t");
    let categoria = "";
    let valor_numerico = 0;

    if (columnas_tab.length >= 2 && columnas_tab[0] && columnas_tab[1]) {
      categoria = columnas_tab[0].trim();
      valor_numerico = parseFloat(columnas_tab[1].replace(/,/g, "").trim()) || 0;
    } else {
      const columnas_coma = linea_actual.split(",");
      if (columnas_coma.length >= 2 && columnas_coma[0] && columnas_coma[1]) {
        categoria = columnas_coma[0].trim();
        valor_numerico = parseFloat(columnas_coma[1].replace(/,/g, "").trim()) || 0;
      } else {
        categoria = linea_actual.trim();
        valor_numerico = 1;
      }
    }

    if (categoria) {
      agregado_nuevo[categoria] = (agregado_nuevo[categoria] ?? 0) + valor_numerico;
    }
  }

  const mapa_consolidado: Record<string, number> = {};
  for (const item_actual of items_existentes) {
    const nombre_limpio = item_actual.area?.trim();
    if (nombre_limpio) {
      mapa_consolidado[nombre_limpio] =
        (mapa_consolidado[nombre_limpio] ?? 0) + (item_actual.gap ?? 0);
    }
  }

  for (const categoria of Object.keys(agregado_nuevo)) {
    mapa_consolidado[categoria] =
      (mapa_consolidado[categoria] ?? 0) + (agregado_nuevo[categoria] ?? 0);
  }

  return Object.keys(mapa_consolidado).map((categoria) => ({
    id: Date.now() + Math.random(),
    area: categoria,
    gap: mapa_consolidado[categoria] ?? 0,
  }));
}

/**
 * Calcula la sumatoria total de la columna gap para una lista de registros Pareto.
 */
export function compute_total_gap(items: ParetoItem[]): number {
  return items.reduce((acumulado, item_actual) => acumulado + (item_actual.gap ?? 0), 0);
}
