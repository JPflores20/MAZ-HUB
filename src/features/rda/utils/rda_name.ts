/**
 * @fileoverview Helper functions to read, format, normalize, and auto-number RDA names and folios.
 */

import type { Rda } from "@/domain/models/rda";

const PLACEHOLDER_TITLES = new Set(["", "Nuevo RDA", "New RDA"]);

function is_placeholder_title(title: string | undefined): boolean {
  return PLACEHOLDER_TITLES.has((title || "").trim());
}

/** Returns the RDA title synchronized with the Ishikawa head, or empty if still default placeholder. */
export function get_rda_name(rda_record: Rda): string {
  return is_placeholder_title(rda_record.title) ? "" : rda_record.title;
}

/** Returns the display title for lists/headers, falling back to Ishikawa effect or default label. */
export function get_rda_display_name(rda_record: Rda, fallback_label = "Nuevo RDA"): string {
  const effect_text = rda_record.ishikawa?.[0]?.effect ?? "";
  return (
    get_rda_name(rda_record) ||
    (is_placeholder_title(effect_text) ? "" : effect_text.trim()) ||
    fallback_label
  );
}

/** Renames an RDA while keeping the first Ishikawa diagram effect synchronized. */
export function with_rda_name(rda_record: Rda, next_name: string): Rda {
  const [first_diagram, ...remaining_diagrams] = rda_record.ishikawa || [];
  if (!first_diagram) return { ...rda_record, title: next_name };
  return {
    ...rda_record,
    title: next_name,
    ishikawa: [{ ...first_diagram, effect: next_name }, ...remaining_diagrams],
  };
}

/** Adopts a populated Ishikawa effect when an older RDA record still holds a placeholder title. */
export function normalize_rda_name(rda_record: Rda): Rda {
  const effect_text = rda_record.ishikawa?.[0]?.effect?.trim();
  if (is_placeholder_title(rda_record.title) && effect_text) {
    return with_rda_name(rda_record, effect_text);
  }
  return rda_record;
}

/** Computes the next sequential `RDA_YYYY_NN` folio from in-memory records with zero DB reads. */
export function generate_next_rda_folio(existing_rdas: Rda[], target_year?: number): string {
  const year_number = target_year ?? new Date().getFullYear();
  const year_string = String(year_number);
  let max_sequence = 0;

  for (const rda_record of existing_rdas) {
    const raw_folio = (rda_record.context?.folio || "").trim();
    if (!raw_folio) continue;

    const folio_match = raw_folio.match(/RDA[\s_-]*(\d{4})[\s_-]*(\d+)/i);
    if (folio_match && folio_match[1] === year_string && folio_match[2]) {
      const parsed_number = Number.parseInt(folio_match[2], 10);
      if (!Number.isNaN(parsed_number) && parsed_number > max_sequence) {
        max_sequence = parsed_number;
      }
    }
  }

  const padded_sequence = String(max_sequence + 1).padStart(2, "0");
  return `RDA_${year_string}_${padded_sequence}`;
}
