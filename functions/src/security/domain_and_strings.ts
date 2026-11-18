/**
 * Utilidades puras para validación de dominios corporativos, normalización de cadenas y áreas.
 * Utilizadas tanto en triggers de identidad como en funciones invocables Zero Trust.
 */

/** Dominios de correo corporativo autorizados para operar en la plataforma. */
export const ALLOWED_CORPORATE_DOMAINS = ["ab-inbev.com", "gmodelo.com.mx"] as const;

const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normaliza un valor arbitrario de correo electrónico eliminando espacios y pasando a minúsculas.
 * @param valor_correo - Valor recibido desde tokens o payloads HTTP/RPC.
 * @returns Correo normalizado en minúsculas o cadena vacía si no es string.
 */
export function normalize_email(valor_correo: unknown): string {
  return typeof valor_correo === "string" ? valor_correo.trim().toLowerCase() : "";
}

/**
 * Verifica estrictamente que un correo tenga formato válido y pertenezca a los dominios permitidos.
 * @param valor_correo - Correo electrónico candidato a validar.
 * @returns `true` cuando el correo termina exactamente en un dominio corporativo autorizado.
 */
export function is_corporate_email(valor_correo: unknown): boolean {
  const correo_normalizado = normalize_email(valor_correo);
  if (!EMAIL_FORMAT_REGEX.test(correo_normalizado)) {
    return false;
  }
  const segmentos_correo = correo_normalizado.split("@");
  const dominio_correo = segmentos_correo[1];
  if (segmentos_correo.length !== 2 || !dominio_correo) {
    return false;
  }
  return (ALLOWED_CORPORATE_DOMAINS as readonly string[]).includes(dominio_correo);
}

/**
 * Recorta y limita la longitud máxima de una cadena para evitar payloads sobredimensionados.
 * @param valor_entrada - Valor de entrada posiblemente no textual.
 * @param longitud_maxima - Cantidad máxima de caracteres permitidos.
 * @returns Cadena recortada y acotada al límite indicado.
 */
export function clamp_string(valor_entrada: unknown, longitud_maxima: number): string {
  if (typeof valor_entrada !== "string") {
    return "";
  }
  return valor_entrada.trim().slice(0, longitud_maxima);
}

/**
 * Normaliza el nombre de un área operativa removiendo diacríticos y pasando a minúsculas.
 * Permite comparar áreas de forma consistente independientemente de tildes o mayúsculas.
 * @param valor_area - Nombre crudo del área operativa.
 * @returns Área normalizada sin acentos ni espacios laterales.
 */
export function normalize_area(valor_area: unknown): string {
  if (typeof valor_area !== "string") {
    return "";
  }
  return valor_area
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
