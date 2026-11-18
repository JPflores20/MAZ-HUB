/**
 * inline_media_service.ts
 * Utilidades para mantener los documentos de Firestore por debajo del límite de 1 MiB.
 * Detecta cadenas Base64 (`data:...`) pesadas, las sube a Firebase Storage y las reemplaza
 * por sus URLs de descarga antes de persistir el documento.
 */
import { subir_archivo_a_firebase } from "@/features/pdca/image_upload/upload_utils";

/** Límite duro de Firestore: 1,048,576 bytes. Dejamos margen para metadatos. */
export const FIRESTORE_SAFE_DOC_BYTES = 1_000_000;

/** Cadenas `data:` más pequeñas que esto se dejan tal cual (íconos, etc.). */
const MIN_INLINE_BYTES_TO_EXTERNALIZE = 2048;

/** Caché de sesión: evita volver a subir la misma data URL en guardados sucesivos. */
const uploaded_data_url_cache = new Map<string, Promise<string>>();

function is_heavy_data_url(candidate_value: unknown): candidate_value is string {
  return (
    typeof candidate_value === "string" &&
    candidate_value.startsWith("data:") &&
    candidate_value.length > MIN_INLINE_BYTES_TO_EXTERNALIZE
  );
}

function resolve_extension_from_mime(mime_type: string): string {
  if (mime_type === "image/jpeg") return "jpg";
  if (mime_type === "application/pdf") return "pdf";
  const subtype = mime_type.split("/")[1] || "bin";
  return subtype.split("+")[0] || "bin";
}

function convert_data_url_to_blob(data_url: string): Blob {
  const comma_index = data_url.indexOf(",");
  const header = data_url.slice(5, comma_index); // Omite prefijo "data:"
  const encoded_payload = data_url.slice(comma_index + 1);
  const is_base64 = header.endsWith(";base64");
  const mime_type =
    (is_base64 ? header.slice(0, -7) : header).split(";")[0] || "application/octet-stream";

  if (!is_base64) {
    return new Blob([decodeURIComponent(encoded_payload)], { type: mime_type });
  }

  const binary_string = atob(encoded_payload);
  const byte_array = new Uint8Array(binary_string.length);
  for (let byte_index = 0; byte_index < binary_string.length; byte_index++) {
    byte_array[byte_index] = binary_string.charCodeAt(byte_index);
  }
  return new Blob([byte_array], { type: mime_type });
}

async function upload_data_url_with_cache(
  data_url: string,
  destination_folder: string,
): Promise<string> {
  const cached_upload = uploaded_data_url_cache.get(data_url);
  if (cached_upload) return cached_upload;

  const upload_promise = (async () => {
    const file_blob = convert_data_url_to_blob(data_url);
    const mime_type = file_blob.type || "application/octet-stream";
    const evidence_file = new File(
      [file_blob],
      `evidencia.${resolve_extension_from_mime(mime_type)}`,
      { type: mime_type },
    );
    return subir_archivo_a_firebase(evidence_file, destination_folder);
  })();

  uploaded_data_url_cache.set(data_url, upload_promise);
  try {
    return await upload_promise;
  } catch (upload_error) {
    uploaded_data_url_cache.delete(data_url);
    throw upload_error;
  }
}

function collect_heavy_data_urls(candidate_node: unknown, collected_urls: Set<string>): void {
  if (is_heavy_data_url(candidate_node)) {
    collected_urls.add(candidate_node);
  } else if (Array.isArray(candidate_node)) {
    candidate_node.forEach((child_node) => collect_heavy_data_urls(child_node, collected_urls));
  } else if (candidate_node && typeof candidate_node === "object") {
    Object.values(candidate_node as Record<string, unknown>).forEach((property_value) =>
      collect_heavy_data_urls(property_value, collected_urls),
    );
  }
}

/**
 * Devuelve una copia profunda de `target_value` reemplazando las cadenas coincidentes
 * según el mapa `replacements_map`.
 *
 * @param target_value - Estructura original a recorrer inmutablemente.
 * @param replacements_map - Diccionario cadena original → URL en Storage.
 * @returns Copia profunda con las cadenas sustituidas.
 */
export function replace_strings_in_object<T>(
  target_value: T,
  replacements_map: Map<string, string>,
): T {
  if (replacements_map.size === 0) return target_value;

  const transform_node = (current_node: unknown): unknown => {
    if (typeof current_node === "string") {
      return replacements_map.get(current_node) ?? current_node;
    }
    if (Array.isArray(current_node)) {
      return current_node.map(transform_node);
    }
    if (current_node && typeof current_node === "object") {
      return Object.fromEntries(
        Object.entries(current_node as Record<string, unknown>).map(
          ([property_key, inner_value]) => [property_key, transform_node(inner_value)],
        ),
      );
    }
    return current_node;
  };

  return transform_node(target_value) as T;
}

/**
 * Sube a Firebase Storage todas las `data:` URLs pesadas encontradas en `target_value`
 * y devuelve una copia inmutable con las URLs de descarga en su lugar.
 *
 * @param target_value - Objeto/documento completo (PDCA o RDA) previo a guardar en Firestore.
 * @param destination_folder - Carpeta destino en Firebase Storage (`pdca_images`, `rda_images`).
 * @returns Objeto clonado ya externalizado junto con el mapa de reemplazos realizados.
 */
export async function externalize_inline_media<T>(
  target_value: T,
  destination_folder: string,
): Promise<{ value: T; replacements: Map<string, string> }> {
  const discovered_urls = new Set<string>();
  collect_heavy_data_urls(target_value, discovered_urls);

  const replacements_map = new Map<string, string>();
  await Promise.all(
    [...discovered_urls].map(async (data_url) => {
      replacements_map.set(data_url, await upload_data_url_with_cache(data_url, destination_folder));
    }),
  );

  return {
    value: replace_strings_in_object(target_value, replacements_map),
    replacements: replacements_map,
  };
}

/**
 * Calcula una estimación conservadora del tamaño UTF-8 en bytes de un documento serializado.
 *
 * @param document_payload - Objeto listo para enviarse a Firestore.
 * @returns Cantidad aproximada de bytes ocupados en formato JSON UTF-8.
 */
export function estimate_document_bytes(document_payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(document_payload)).length;
}

/** Error lanzado cuando un documento excede el umbral seguro previo al límite duro de Firestore. */
export class DocumentTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(
      `El documento pesa ${(bytes / 1024).toFixed(0)} KB y supera el límite de Firestore (1 MB).`,
    );
    this.name = "DocumentTooLargeError";
  }
}
