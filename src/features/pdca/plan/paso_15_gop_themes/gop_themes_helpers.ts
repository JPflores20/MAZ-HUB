/**
 * @fileoverview Utilidades y tipos extendidos para ciclos mensuales de cumplimiento en Temas GOP (Paso 15).
 */
import type { GopThemeItem } from "@/domain/pdca";

export interface TemaGopExtendido extends GopThemeItem {
  mesesValues?: string[];
  mesesColors?: string[];
  fechaCompromiso?: string;
  porcentajeAvance?: string;
  focusType?: string;
  fecha_compromiso?: string;
  fecha?: string;
  porcentaje_avance?: string;
  avance?: string;
  focus_items?: string;
  focus_type?: string;
  estado?: string;
  estatus?: string;
  meses_values?: string[];
  meses_colors?: string[];
}

export const NOMBRES_MESES_GOP = [
  "Ene",
  "FEB",
  "MAR",
  "Abr",
  "MAY",
  "Jun",
  "JUL",
  "Ago",
  "SEP",
  "OCT",
  "NOV",
  "Dic",
];

export const MAPA_ESTADO_COLORES_GOP: Record<string, string> = {
  "Not Started": "bg-gray-300 text-gray-800",
  "In Progress": "bg-amber-400 text-amber-900",
  Complete: "bg-emerald-500 text-white",
  "": "bg-transparent text-transparent",
};

/**
 * Alterna el estado visual de una celda mensual: inactivo -> rojo -> verde -> inactivo.
 */
export function alternar_estado_mes_gop(
  registro: TemaGopExtendido,
  indice_mes: number,
): TemaGopExtendido {
  const meses_actualizados = [...registro.meses];
  const valores_actualizados = registro.mesesValues
    ? [...registro.mesesValues]
    : Array<string>(12).fill("100%");
  const colores_actualizados = registro.mesesColors
    ? [...registro.mesesColors]
    : Array<string>(12).fill("red");

  const esta_activo = meses_actualizados[indice_mes];
  const color_actual = colores_actualizados[indice_mes];

  if (!esta_activo) {
    meses_actualizados[indice_mes] = true;
    colores_actualizados[indice_mes] = "red";
  } else if (color_actual === "red") {
    meses_actualizados[indice_mes] = true;
    colores_actualizados[indice_mes] = "green";
  } else {
    meses_actualizados[indice_mes] = false;
    colores_actualizados[indice_mes] = "red";
  }

  return {
    ...registro,
    meses: meses_actualizados,
    mesesValues: valores_actualizados,
    mesesColors: colores_actualizados,
  };
}

/**
 * Normaliza los campos legados (`snake_case` o `camelCase`) de una fila GOP para renderizado uniforme.
 */
export function extraer_campos_fila_gop(registro_gop: TemaGopExtendido) {
  const fecha_compromiso =
    registro_gop.fechaCompromiso || registro_gop.fecha_compromiso || registro_gop.fecha || "";
  const raw_avance =
    registro_gop.porcentajeAvance ?? registro_gop.porcentaje_avance ?? registro_gop.avance;
  const porcentaje_avance =
    raw_avance !== undefined && raw_avance !== null ? String(raw_avance) : "";
  const raw_focus = registro_gop.focusItems ?? registro_gop.focus_items;
  const focus_items =
    raw_focus !== undefined && raw_focus !== null ? String(raw_focus) : "";
  const focus_type = registro_gop.focusType || registro_gop.focus_type || "#";
  const estatus_fila =
    registro_gop.status || registro_gop.estado || registro_gop.estatus || "";
  const arreglo_meses: boolean[] = Array.isArray(registro_gop.meses)
    ? registro_gop.meses
    : registro_gop.meses && typeof registro_gop.meses === "object"
      ? Object.values(registro_gop.meses)
      : Array<boolean>(12).fill(false);

  const esta_retrasado = Boolean(
    fecha_compromiso &&
      new Date(`${fecha_compromiso}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0)) &&
      Number(porcentaje_avance || 0) < 100,
  );

  return {
    fecha_compromiso,
    porcentaje_avance,
    focus_items,
    focus_type,
    estatus_fila,
    arreglo_meses,
    esta_retrasado,
  };
}
