/**
 * @fileoverview Pure PDCA bank metrics aggregation and text/phase filtering helpers.
 */

import { isBefore, isValid, parse, startOfDay } from "date-fns";
import { is_bloque_frio_area, type Pdca, type Phase } from "@/domain/pdca";

/** Summarizes phase counts, plant area breakdowns, and deadline timeliness across all PDCAs. */
export function compute_pdca_bank_metrics(user_pdcas: Pdca[]) {
  let activos = 0;
  let cerrados = 0;
  let bloque_frio = 0;
  let cocimientos = 0;
  let vencidos = 0;
  let a_tiempo = 0;
  const today = startOfDay(new Date());

  user_pdcas.forEach((pdca_entry) => {
    const is_closed = pdca_entry.fase === "Act" && pdca_entry.progreso === 100;
    if (is_closed) {
      cerrados += 1;
    } else {
      activos += 1;
      if (pdca_entry.fechaFinalizacion) {
        try {
          const deadline_date = parse(pdca_entry.fechaFinalizacion, "dd/MM/yyyy", new Date());
          if (isValid(deadline_date)) {
            if (isBefore(deadline_date, today)) {
              vencidos += 1;
            } else {
              a_tiempo += 1;
            }
          }
        } catch {
          // Ignore invalid legacy date strings
        }
      }
    }

    const area_lower = pdca_entry.area.toLowerCase();
    if (is_bloque_frio_area(pdca_entry.area)) {
      bloque_frio += 1;
    } else if (area_lower.includes("cocimiento")) {
      cocimientos += 1;
    }
  });

  return { activos, cerrados, bloque_frio, cocimientos, vencidos, a_tiempo };
}

/** Filters PDCA rows by selected phase and search query matching title, area, or author. */
export function filter_pdca_bank_rows(
  user_pdcas: Pdca[],
  filter_phase: Phase | "Todas",
  raw_query: string,
): Pdca[] {
  const normalized_query = raw_query.toLowerCase();
  return user_pdcas.filter((pdca_entry) => {
    const matches_phase = filter_phase === "Todas" || pdca_entry.fase === filter_phase;
    const matches_query =
      !normalized_query ||
      pdca_entry.titulo.toLowerCase().includes(normalized_query) ||
      pdca_entry.area.toLowerCase().includes(normalized_query) ||
      (pdca_entry.autor && pdca_entry.autor.toLowerCase().includes(normalized_query)) ||
      (pdca_entry.autorEmail && pdca_entry.autorEmail.toLowerCase().includes(normalized_query));
    return matches_phase && matches_query;
  });
}
