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
