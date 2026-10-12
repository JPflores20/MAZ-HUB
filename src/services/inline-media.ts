/**
 * Utilidades para mantener los documentos de Firestore por debajo del límite de 1 MiB.
 *
 * Históricamente algunas evidencias (fotos / PDFs) se guardaban como cadenas base64
 * (`data:image/...;base64,...`) directamente dentro del documento. Una sola foto de
 * celular supera el límite de Firestore y hace que TODO el guardado falle.
 *
 * Estas funciones recorren un objeto, suben cualquier `data:` URL a Firebase Storage
 * y la reemplazan por su URL de descarga.
 */
import { subirArchivoAFirebase } from "@/components/pdca/image-upload/utils/upload-utils";

/** Límite duro de Firestore: 1,048,576 bytes. Dejamos margen para metadatos. */
export const FIRESTORE_SAFE_DOC_BYTES = 1_000_000;

/** Cadenas `data:` más pequeñas que esto se dejan tal cual (íconos, etc.). */
const MIN_INLINE_BYTES_TO_EXTERNALIZE = 2048;

/** Caché de sesión: evita volver a subir la misma data URL en guardados sucesivos. */
const uploadedCache = new Map<string, Promise<string>>();

function isHeavyDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("data:") &&
    value.length > MIN_INLINE_BYTES_TO_EXTERNALIZE
  );
}

function extensionFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "application/pdf") return "pdf";
  const sub = mime.split("/")[1] || "bin";
  return sub.split("+")[0] || "bin";
}

function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(",");
  const header = dataUrl.slice(5, commaIndex); // quita "data:"
  const payload = dataUrl.slice(commaIndex + 1);
  const isBase64 = header.endsWith(";base64");
  const mime =
    (isBase64 ? header.slice(0, -7) : header).split(";")[0] || "application/octet-stream";

  if (!isBase64) return new Blob([decodeURIComponent(payload)], { type: mime });

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadDataUrl(dataUrl: string, folder: string): Promise<string> {
  const cached = uploadedCache.get(dataUrl);
  if (cached) return cached;

  const task = (async () => {
    const blob = dataUrlToBlob(dataUrl);
    const mime = blob.type || "application/octet-stream";
    const file = new File([blob], `evidencia.${extensionFromMime(mime)}`, { type: mime });
    return subirArchivoAFirebase(file, folder);
  })();

  uploadedCache.set(dataUrl, task);
  try {
    return await task;
  } catch (error) {
    uploadedCache.delete(dataUrl);
    throw error;
  }
}

function collectDataUrls(value: unknown, found: Set<string>): void {
  if (isHeavyDataUrl(value)) {
    found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectDataUrls(v, found));
  } else if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => collectDataUrls(v, found));
  }
}

/** Devuelve una copia profunda de `value` reemplazando las cadenas según `replacements`. */
export function replaceStrings<T>(value: T, replacements: Map<string, string>): T {
  if (replacements.size === 0) return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return replacements.get(v) ?? v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).map(([k, inner]) => [k, walk(inner)]),
      );
    }
    return v;
  };
  return walk(value) as T;
}

/**
 * Sube a Storage todas las data URLs pesadas encontradas en `value` y devuelve
 * una copia con las URLs de descarga en su lugar.
 */
export async function externalizeInlineMedia<T>(
  value: T,
  folder: string,
): Promise<{ value: T; replacements: Map<string, string> }> {
  const found = new Set<string>();
  collectDataUrls(value, found);

  const replacements = new Map<string, string>();
  await Promise.all(
    [...found].map(async (dataUrl) => {
      replacements.set(dataUrl, await uploadDataUrl(dataUrl, folder));
    }),
  );

  return { value: replaceStrings(value, replacements), replacements };
}

/** Estimación (conservadora) del tamaño en bytes de un documento. */
export function estimateDocBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export class DocumentTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(
      `El documento pesa ${(bytes / 1024).toFixed(0)} KB y supera el límite de Firestore (1 MB).`,
    );
    this.name = "DocumentTooLargeError";
  }
}
