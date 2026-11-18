/**
 * @fileoverview Helpers puros para extraer datos de Pareto, normalizar acciones y calcular GAP del Resumen PDCA.
 */
import type {
  ActionItem,
  DefinicionMeta,
  ImpactMatrixRow,
  ParetoItem,
} from "@/domain/pdca";
import type { AccionResumenDisplay } from "./resumen_action_table";

export const META_DEFECTO_RESUMEN: DefinicionMeta = {
  kpi: "",
  pis: "",
  desdeValor: "",
  aValor: "",
  unidadMedida: "",
  benchmark: "",
  mejora: "",
  responsable: "",
};

/**
 * Selecciona y ordena de mayor a menor las categorías del Pareto raíz válido dentro de un mapa multinivel.
 * @param mapa_pareto - Diccionario indexado por nivel ("root", "root-1", etc.).
 */
export function extraer_datos_pareto_resumen(
  mapa_pareto: Record<string, ParetoItem[]> | undefined,
): ParetoItem[] {
  if (!mapa_pareto || typeof mapa_pareto !== "object") return [];

  const tiene_datos_reales = (filas: ParetoItem[] | undefined): boolean =>
    Array.isArray(filas) &&
    filas.some(
      (registro) =>
        (registro?.area !== undefined && String(registro.area).trim() !== "") ||
        Number(registro?.gap) > 0,
    );

  const todas_las_llaves = Object.keys(mapa_pareto);
  const llaves_raiz_secundarias = todas_las_llaves
    .filter((llave) => llave.startsWith("root-"))
    .sort();
  const otras_llaves = todas_las_llaves.filter(
    (llave) => llave !== "root" && !llave.startsWith("root-"),
  );
  const orden_candidatas = ["root", ...llaves_raiz_secundarias, ...otras_llaves];

  let seleccion: ParetoItem[] = [];
  for (const llave of orden_candidatas) {
    const candidato = mapa_pareto[llave];
    if (tiene_datos_reales(candidato) && candidato) {
      seleccion = candidato;
      break;
    }
  }

  if (seleccion.length === 0) {
    for (const llave of orden_candidatas) {
      const candidato = mapa_pareto[llave];
      if (Array.isArray(candidato) && candidato.length > 0) {
        seleccion = candidato;
        break;
      }
    }
  }

  const filtrados = seleccion
    .filter(
      (registro) =>
        (registro?.area !== undefined && String(registro.area).trim() !== "") ||
        Number(registro?.gap) > 0,
    )
    .map((registro, indice) => ({
      ...registro,
      id: registro?.id ?? indice + 1,
      area: String(registro?.area ?? "").trim() || `Categoría ${indice + 1}`,
      gap: Number(registro?.gap) || 0,
    }));

  return [...filtrados].sort(
    (registro_a, registro_b) => (Number(registro_b.gap) || 0) - (Number(registro_a.gap) || 0),
  );
}

/**
 * Unifica las acciones del Plan de Acción moderno con la Matriz de Impacto legada en formato de resumen.
 */
export function construir_acciones_resumen(
  action_items?: ActionItem[],
  impact_matrix?: ImpactMatrixRow[],
): AccionResumenDisplay[] {
  if (Array.isArray(action_items) && action_items.length > 0) {
    return action_items.map((accion_item) => ({
      issue: accion_item.tema || accion_item.what || "-",
      root_cause: accion_item.causaRaiz || accion_item.causaRaiz2 || "-",
      accion: accion_item.accion || accion_item.accion2 || accion_item.what || "-",
      priorizar: accion_item.priorizar || "NO",
      quick_win: accion_item.quickWin || "NO",
      herramienta_sdca: accion_item.herramientaSdca || "-",
    }));
  }

  return (impact_matrix || []).map((fila_matriz) => ({
    issue: fila_matriz.issue || "-",
    root_cause: fila_matriz.root_cause || fila_matriz.rootCause || "-",
    accion: fila_matriz.accion || "-",
    priorizar: fila_matriz.priorizar || "NO",
    quick_win: "NO",
    herramienta_sdca: "-",
  }));
}

/**
 * Calcula valores normalizados de meta (desde, a, unidad) y la diferencia numérica formatada (GAP).
 */
export function resolver_metricas_meta_resumen(meta: DefinicionMeta): {
  kpi_label: string;
  desde_val: string;
  a_val: string;
  unidad: string;
  gap_text: string;
} {
  const kpi_label = meta.kpi || "-";
  const desde_val = meta.desde_valor || meta.desdeValor || "-";
  const a_val = meta.a_valor || meta.aValor || "-";
  const unidad = meta.unidad_medida || meta.unidadMedida || "";

  let gap_text = "-";
  const numero_desde = parseFloat(desde_val);
  const numero_a = parseFloat(a_val);
  if (!Number.isNaN(numero_desde) && !Number.isNaN(numero_a)) {
    const diferencia = +(numero_a - numero_desde).toFixed(2);
    gap_text = `${diferencia > 0 ? "+" : ""}${diferencia} ${unidad}`.trim();
  }

  return { kpi_label, desde_val, a_val, unidad, gap_text };
}
