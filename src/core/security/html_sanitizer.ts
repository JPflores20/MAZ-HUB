/**
 * Sanitizador estricto de HTML enriquecido mediante DOMPurify para prevenir XSS almacenado.
 */
import DOMPurify from "dompurify";

const ALLOWED_RICH_TEXT_TAGS = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "p",
  "br",
  "div",
  "span",
  "font",
];

const FORBIDDEN_RICH_TEXT_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
  "form",
  "input",
  "textarea",
  "button",
  "select",
  "a",
  "img",
  "link",
  "meta",
];

/**
 * Sanitiza HTML proveniente de editores enriquecidos permitiendo únicamente formato básico seguro.
 * En ejecución sin DOM (SSR), elimina todas las etiquetas HTML de forma conservadora.
 * @param html_crudo - Cadena HTML sin sanitizar ingresada o persistida.
 * @returns HTML limpio libre de scripts, manejadores inline y atributos peligrosos.
 */
export function sanitize_rich_text_html(html_crudo: string | null | undefined): string {
  if (!html_crudo) return "";
  if (typeof window === "undefined") {
    return html_crudo.replace(/<[^>]*>/g, "");
  }
  return DOMPurify.sanitize(html_crudo, {
    ALLOWED_TAGS: ALLOWED_RICH_TEXT_TAGS,
    ALLOWED_ATTR: ["size"],
    FORBID_TAGS: FORBIDDEN_RICH_TEXT_TAGS,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
