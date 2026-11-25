/**
 * @fileoverview Pure helpers for RDA bank filters, Excel export, record creation, and assignee toggling.
 */

import { sanitize_rows_for_spreadsheet } from "@/core/security";
import { DEFAULT_RDA, type Rda } from "@/domain/models/rda";
import { AREAS, does_area_belong_to_parent_or_match, is_bloque_frio_area } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import { generate_next_rda_folio, get_rda_display_name } from "../utils/rda_name";
import { get_rda_status } from "../utils/rda_status";

export const RDA_KANBAN_COLUMNS = [
  {
    status: "Abierto",
    label: "Abierto (En Análisis / Acción)",
    accent: "border-t-blue-600",
    badge_bg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    status: "Cerrado",
    label: "Cerrado (Fases 1-3 Completas)",
    accent: "border-t-emerald-600",
    badge_bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    status: "Evaluado",
    label: "Evaluado (Fases 4-5 Completas)",
    accent: "border-t-purple-600",
    badge_bg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
] as const;

/** Extracts normalized responsible names from RDA context or fallback cover assignments. */
export function get_rda_responsibles_list(rda_record: Rda): string[] {
  const from_context = (rda_record.context?.responsable || "")
    .split(",")
    .map((person_name) => person_name.trim())
    .filter(Boolean);
  if (from_context.length > 0) return from_context;
  return (rda_record.portada?.usuariosAsignados || [])
    .map((person_name) => person_name.trim())
    .filter(Boolean);
}

/** Builds a new blank RDA initialized with sequential folio and owner identity fields. */
export function build_new_rda_record(all_rdas: Rda[], current_user: UserProfile | null): Rda {
  const next_folio = generate_next_rda_folio(all_rdas);
  const now_iso = new Date().toISOString();
  return {
    ...DEFAULT_RDA,
    id: Date.now().toString(),
    createdAt: now_iso,
    updatedAt: now_iso,
    ...(current_user?.uid ? { ownerUid: current_user.uid } : {}),
    portada: {
      ...DEFAULT_RDA.portada!,
      autorOriginal: current_user?.name || "",
      autorEmail: (current_user?.email || "").trim().toLowerCase(),
      area: current_user?.area || "",
    },
    context: {
      ...DEFAULT_RDA.context,
      folio: next_folio,
      iniciadoPor: current_user?.name || "",
      area: current_user?.area || "",
    },
  };
}

/** Returns an updated RDA copy with `person_name` toggled across context and cover assignees. */
export function build_toggled_responsible_rda(rda_record: Rda, person_name: string): Rda | null {
  const normalized = person_name.trim();
  if (!normalized) return null;
  const current_list = get_rda_responsibles_list(rda_record);
  const exists = current_list.some((item) => item.toLowerCase() === normalized.toLowerCase());
  const next_list = exists
    ? current_list.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
    : [...current_list, normalized];

  return {
    ...rda_record,
    context: { ...rda_record.context, responsable: next_list.join(", ") },
    portada: { ...(rda_record.portada || DEFAULT_RDA.portada!), usuariosAsignados: next_list },
  };
}

/** Collects sorted unique brewing areas present across all RDAs, including Bloque Frío rollup. */
export function build_rda_available_areas(all_rdas: Rda[]): string[] {
  const area_map = new Map<string, string>();
  all_rdas.forEach((rda_record) => {
    const raw_area = (rda_record.context?.area || rda_record.portada?.area || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!raw_area) return;

    const lower_key = raw_area.toLowerCase();
    if (!area_map.has(lower_key)) {
      const canonical_match = AREAS.find(
        (area_option) =>
          area_option.value.toLowerCase() === lower_key ||
          area_option.label.toLowerCase() === lower_key,
      );
      area_map.set(lower_key, canonical_match ? canonical_match.label : raw_area);
    }
    if (is_bloque_frio_area(raw_area) && !area_map.has("bloque frío")) {
      area_map.set("bloque frío", "Bloque Frío");
    }
  });
  return Array.from(area_map.values()).sort((area_a, area_b) =>
    area_a.localeCompare(area_b, "es", { sensitivity: "base" }),
  );
}

/** Filters RDAs by text query (title, folio, responsibles, author), area, and status. */
export function filter_rda_records(
  all_rdas: Rda[],
  search_term: string,
  area_filter: string,
  status_filter: string,
): Rda[] {
  const lower_query = search_term.toLowerCase();
  return all_rdas.filter((rda_record) => {
    const display_title = get_rda_display_name(rda_record).toLowerCase();
    const folio = (rda_record.context?.folio || "").toLowerCase();
    const responsibles = get_rda_responsibles_list(rda_record).join(", ").toLowerCase();
    const author = (rda_record.portada?.autorOriginal || "").toLowerCase();
    const matches_search =
      display_title.includes(lower_query) ||
      folio.includes(lower_query) ||
      responsibles.includes(lower_query) ||
      author.includes(lower_query);

    const raw_rda_area = (rda_record.context?.area || rda_record.portada?.area || "").trim();
    const matches_area =
      area_filter === "all" || does_area_belong_to_parent_or_match(raw_rda_area, area_filter);
    const matches_status = status_filter === "all" || get_rda_status(rda_record) === status_filter;

    return matches_search && matches_area && matches_status;
  });
}

/** Exports filtered RDAs into a formula-injection-sanitized Excel spreadsheet on demand. */
export async function export_rdas_to_excel(filtered_rdas: Rda[]): Promise<void> {
  const xlsx = await import("xlsx");
  const sanitized_rows = sanitize_rows_for_spreadsheet(
    filtered_rdas.map((rda_record) => ({
      Folio: rda_record.context?.folio || "-",
      Titulo: get_rda_display_name(rda_record),
      Estatus: get_rda_status(rda_record),
      Planta: rda_record.context?.planta || "-",
      Area: rda_record.context?.area || "-",
      Responsable: get_rda_responsibles_list(rda_record).join(", ") || "-",
      Autor: rda_record.portada?.autorOriginal || "-",
      FechaLimite: rda_record.portada?.fechaLimite
        ? new Date(rda_record.portada.fechaLimite).toLocaleDateString("es-ES")
        : "-",
      Actualizado: rda_record.updatedAt
        ? new Date(rda_record.updatedAt).toLocaleDateString("es-ES")
        : "-",
    })),
  );
  const worksheet = xlsx.utils.json_to_sheet(sanitized_rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Mis RDA");
  xlsx.writeFile(workbook, "Mis_RDA.xlsx");
}
