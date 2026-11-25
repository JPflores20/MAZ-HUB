/**
 * Utilidades puras para validación de dominios corporativos, normalización de cadenas y áreas.
 * Utilizadas tanto en triggers de identidad como en funciones invocables Zero Trust.
 */

/** Dominios de correo corporativo autorizados para operar en la plataforma. */
export const ALLOWED_CORPORATE_DOMAINS = ["ab-inbev.com", "gmodelo.com.mx"] as const;

/** Rango permitido de vigencia en días para perfiles temporales de becario creados por un administrador. */
export const MIN_INTERN_ACTIVE_DAYS = 1;
export const MAX_INTERN_ACTIVE_DAYS = 730;
const MS_PER_DAY = 86_400_000;

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
 * Verifica formato sintáctico válido de un correo electrónico (sin restringir dominio).
 */
export function is_valid_email_format(valor_correo: unknown): boolean {
  const correo_normalizado = normalize_email(valor_correo);
  return Boolean(
    correo_normalizado &&
    correo_normalizado.length >= 6 &&
    correo_normalizado.length <= 254 &&
    EMAIL_FORMAT_REGEX.test(correo_normalizado),
  );
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

/** Valida que la vigencia en días sea un entero dentro del rango permitido para becarios temporales. */
export function parse_active_days(raw_days: unknown): number | null {
  const parsed = typeof raw_days === "number" ? raw_days : Number(raw_days);
  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_INTERN_ACTIVE_DAYS ||
    parsed > MAX_INTERN_ACTIVE_DAYS
  ) {
    return null;
  }
  return parsed;
}

/** Calcula fecha de expiración ISO y en milisegundos a partir de `active_days`. */
export function compute_intern_expiration(active_days: number, now_ms = Date.now()) {
  const expires_at_ms = now_ms + active_days * MS_PER_DAY;
  return {
    activeDays: active_days,
    expiresAtMs: expires_at_ms,
    expiresAt: new Date(expires_at_ms).toISOString(),
  };
}

/** Determina si un perfil corresponde a una cuenta temporal de becario provisionada por administrador. */
export function is_temporary_intern_profile(datos_perfil: Record<string, unknown>): boolean {
  return (
    datos_perfil["role"] === "intern" &&
    datos_perfil["temporaryAccount"] === true &&
    datos_perfil["verifiedByAdmin"] === true
  );
}

/** Indica si una cuenta temporal ha superado su fecha de expiración o carece de marca válida. */
export function is_profile_expired(
  datos_perfil: Record<string, unknown>,
  now_ms = Date.now(),
): boolean {
  if (datos_perfil["temporaryAccount"] !== true) {
    return false;
  }
  const raw_ms = datos_perfil["expiresAtMs"];
  if (typeof raw_ms === "number" && Number.isFinite(raw_ms)) {
    return now_ms >= raw_ms;
  }
  const raw_iso = datos_perfil["expiresAt"];
  if (typeof raw_iso === "string" && raw_iso.trim()) {
    const parsed_ms = Date.parse(raw_iso);
    if (Number.isFinite(parsed_ms)) {
      return now_ms >= parsed_ms;
    }
  }
  return true;
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
