/**
 * rda-name.ts
 * Funciones auxiliares para obtener y sincronizar el nombre del RDA a partir de la cabeza (efecto) del Diagrama de Ishikawa.
 */
import type { Rda } from "@/data/rda";

/** Título con el que se crea un RDA nuevo (ver `defaultRda`). */
const PLACEHOLDER_TITLES = new Set(["", "Nuevo RDA", "New RDA"]);

function isPlaceholderTitle(title: string | undefined): boolean {
  return PLACEHOLDER_TITLES.has((title || "").trim());
}

/**
 * Nombre del RDA = cabeza (efecto / problema) del Ishikawa.
 * Si el título sigue siendo el de por defecto, se devuelve vacío para que la
 * cabeza del Ishikawa muestre su placeholder en lugar de "Nuevo RDA".
 */
export function getRdaName(rda: Rda): string {
  return isPlaceholderTitle(rda.title) ? "" : rda.title;
}

/**
 * Nombre a mostrar en listas y encabezados: el título, o la cabeza del Ishikawa
 * si el título sigue siendo el de por defecto. No depende de que el RDA se haya
 * vuelto a abrir/guardar.
 */
export function getRdaDisplayName(rda: Rda, fallback = "Nuevo RDA"): string {
  const effect = rda.ishikawa?.[0]?.effect ?? "";
  return getRdaName(rda) || (isPlaceholderTitle(effect) ? "" : effect.trim()) || fallback;
}

/** Renombra el RDA manteniendo sincronizada la cabeza del Ishikawa. */
export function withRdaName(rda: Rda, name: string): Rda {
  const [first, ...rest] = rda.ishikawa || [];
  if (!first) return { ...rda, title: name };
  return { ...rda, title: name, ishikawa: [{ ...first, effect: name }, ...rest] };
}

/**
 * RDAs creados antes de este cambio pueden tener el problema escrito solo en la
 * cabeza del Ishikawa y el título atorado en "Nuevo RDA". En ese caso se adopta
 * la cabeza como nombre del RDA.
 */
export function normalizeRdaName(rda: Rda): Rda {
  const effect = rda.ishikawa?.[0]?.effect?.trim();
  if (isPlaceholderTitle(rda.title) && effect) {
    return withRdaName(rda, effect);
  }
  return rda;
}

/**
 * Genera automáticamente el siguiente folio consecutivo para un RDA con el formato:
 * `RDA_<año>_<número>` (ej. `RDA_2026_01`, `RDA_2026_20`).
 *
 * Calcula el consecutivo en memoria a partir de la lista de RDAs existentes
 * (0 lecturas adicionales a Firestore).
 */
export function generateNextRdaFolio(existingRdas: Rda[], targetYear?: number): string {
  const year = targetYear ?? new Date().getFullYear();
  const yearStr = String(year);
  let maxNumber = 0;

  for (const rda of existingRdas) {
    const rawFolio = (rda.context?.folio || "").trim();
    if (!rawFolio) continue;

    const match = rawFolio.match(/RDA[\s_-]*(\d{4})[\s_-]*(\d+)/i);
    if (match && match[1] === yearStr && match[2]) {
      const parsed = parseInt(match[2], 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  const nextNumber = maxNumber + 1;
  const paddedNumber = String(nextNumber).padStart(2, "0");
  return `RDA_${yearStr}_${paddedNumber}`;
}

