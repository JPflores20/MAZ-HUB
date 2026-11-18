/**
 * @fileoverview Types, status badge palette, and date helpers for the PDCA action tracker table.
 */

import type { ActionItem } from "@/domain/pdca";

export type ActionStatusValue =
  | "NO INICIADO"
  | "EN PROGRESO"
  | "COMPLETADO"
  | "Pendiente"
  | "En progreso"
  | "Retrasado"
  | "Completada";

/** Extends ActionItem with legacy Kanban UI keys and exactOptionalPropertyTypes compatibility. */
export type ExtendedActionItem = Omit<ActionItem, "status"> & {
  causa?: string | undefined;
  sdca?: string | undefined;
  status?: ActionStatusValue | undefined;
};

/** Visual badge styling preserving legacy status labels alongside current states. */
export const ACTION_STATUS_COLORS: Record<ActionStatusValue, string> = {
  "NO INICIADO": "bg-[#5D6770] text-white",
  "EN PROGRESO": "bg-[#FFC000] text-black",
  COMPLETADO: "bg-[#00B050] text-white",
  Pendiente: "bg-[#5D6770] text-white",
  "En progreso": "bg-[#FFC000] text-black",
  Retrasado: "bg-red-600 text-white",
  Completada: "bg-[#00B050] text-white",
};

/** Parses stored ISO or free-text action dates into a local-midday Date for the picker. */
export function parse_action_date(raw_date?: string): Date | undefined {
  if (!raw_date) return undefined;
  const midday_date = new Date(`${raw_date}T12:00:00`);
  if (!Number.isNaN(midday_date.getTime())) return midday_date;
  const fallback_date = new Date(raw_date);
  return Number.isNaN(fallback_date.getTime()) ? undefined : fallback_date;
}

/** Builds a clean empty action row initialized to NO INICIADO without preselected SDCA. */
export function create_empty_action_item(): ActionItem {
  const new_item: ExtendedActionItem = {
    id: `A-${Date.now()}`,
    tema: "",
    causa: "",
    what: "",
    comentarios: "",
    who: "",
    when: "",
    status: "NO INICIADO",
    sdca: "",
    done: false,
  };
  return new_item as unknown as ActionItem;
}
