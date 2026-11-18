/**
 * Validación y apertura segura de URLs externas bajo lista blanca estricta de protocolos.
 * Previene ataques `javascript:`, `vbscript:`, SVG embebidos y reverse tabnabbing.
 */

const SAFE_DATA_MEDIA_PREFIXES = [
  "data:image/jpeg;base64,",
  "data:image/jpg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
  "data:image/gif;base64,",
  "data:application/pdf;base64,",
] as const;

export interface SafeUrlOptions {
  allowDataMedia?: boolean;
}

/**
 * Verifica si una cadena contiene caracteres de control ASCII usados para evadir filtros de esquema.
 * @param texto_entrada - Cadena candidata a validar.
 * @returns `true` cuando existe algún byte de control (0x00-0x1F o 0x7F).
 */
function contains_ascii_control_char(texto_entrada: string): boolean {
  for (let indice_char = 0; indice_char < texto_entrada.length; indice_char += 1) {
    const codigo_char = texto_entrada.charCodeAt(indice_char);
    if (codigo_char <= 0x1f || codigo_char === 0x7f) return true;
  }
  return false;
}

/**
 * Valida y normaliza una URL de evidencia o enlace externo bajo lista blanca `https:`/`http:`
 * y prefijos `data:` seguros cuando se autorizan explícitamente.
 * @param url_cruda - URL recibida desde usuario o documento Firestore.
 * @param opciones - Permite aceptar URI base64 de imágenes/PDF sin SVG.
 * @returns URL normalizada lista para renderizar, o `null` si es insegura o inválida.
 */
export function sanitize_external_url(
  url_cruda: string | null | undefined,
  opciones: SafeUrlOptions = {},
): string | null {
  if (!url_cruda || typeof url_cruda !== "string") return null;
  const url_recortada = url_cruda.trim();
  if (!url_recortada) return null;

  // Bloquea caracteres de control invisibles usados para evadir validadores de esquema
  if (contains_ascii_control_char(url_recortada)) return null;

  const url_minusculas = url_recortada.toLowerCase();
  if (url_minusculas.startsWith("data:")) {
    if (!opciones.allowDataMedia) return null;
    const es_media_segura = SAFE_DATA_MEDIA_PREFIXES.some((prefijo_seguro) =>
      url_minusculas.startsWith(prefijo_seguro),
    );
    return es_media_segura ? url_recortada : null;
  }

  try {
    const url_analizada = new URL(url_recortada);
    if (url_analizada.protocol === "https:" || url_analizada.protocol === "http:") {
      return url_analizada.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Abre una URL validada en una nueva pestaña protegiendo contra reverse tabnabbing (`noopener,noreferrer`).
 * @param url_cruda - URL candidata a abrir.
 * @param opciones - Opciones de validación de esquema `data:`.
 * @returns `true` si la URL pasó validación y se invocó la apertura en navegador.
 */
export function open_safe_external_url(
  url_cruda: string | null | undefined,
  opciones: SafeUrlOptions = {},
): boolean {
  const url_segura = sanitize_external_url(url_cruda, opciones);
  if (!url_segura || typeof window === "undefined") return false;
  const ventana_abierta = window.open(url_segura, "_blank", "noopener,noreferrer");
  if (ventana_abierta) {
    ventana_abierta.opener = null;
  }
  return true;
}
