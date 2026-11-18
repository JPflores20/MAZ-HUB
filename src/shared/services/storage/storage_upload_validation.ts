/**
 * storage_upload_validation.ts
 * Catálogos de carpetas/MIME permitidos y funciones puras de validación de archivos
 * previo a cualquier subida a Firebase Storage (alineado con `storage.rules`).
 */

/** Límite máximo de carga por archivo (10 MiB, alineado con `storage.rules`). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_FOLDERS = [
  "pdca_images",
  "rda_images",
  "rendimiento_actual_evidencias",
  "five_whys_evidencias",
  "gemba_evidencias",
  "pruebas_ejecutadas_evidencias",
] as const;

export type AllowedUploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export const SAFE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const OFFICE_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

const BLOCKED_SCRIPT_EXTENSIONS = new Set(["svg", "html", "htm", "js"]);
const ALLOWED_FOLDER_SET = new Set<string>(ALLOWED_UPLOAD_FOLDERS);
export const SAFE_IMAGE_MIME_SET = new Set<string>(SAFE_IMAGE_MIME_TYPES);
const ALL_SAFE_MIME_SET = new Set<string>([...SAFE_IMAGE_MIME_TYPES, ...OFFICE_MIME_TYPES]);

/**
 * Resuelve y verifica un tipo MIME seguro a partir de extensión y cabecera del archivo,
 * bloqueando explícitamente archivos SVG/HTML/JS que podrían ejecutar scripts (XSS almacenado).
 *
 * @param target_file - Archivo seleccionado por el usuario.
 * @param allow_office_documents - Indica si se permiten documentos PDF/Office además de imágenes.
 * @returns El tipo MIME normalizado si está permitido, o `null` si debe rechazarse.
 */
export function resolve_safe_mime_type(
  target_file: File,
  allow_office_documents: boolean,
): string | null {
  const file_extension = target_file.name.split(".").pop()?.trim().toLowerCase() ?? "";
  if (BLOCKED_SCRIPT_EXTENSIONS.has(file_extension)) {
    return null;
  }

  const raw_mime_type = target_file.type.trim().toLowerCase();
  if (raw_mime_type === "image/svg+xml") {
    return null;
  }

  const allowed_mime_set = allow_office_documents ? ALL_SAFE_MIME_SET : SAFE_IMAGE_MIME_SET;
  if (raw_mime_type && allowed_mime_set.has(raw_mime_type)) {
    return raw_mime_type === "image/jpg" ? "image/jpeg" : raw_mime_type;
  }

  const mapped_mime_type = EXTENSION_TO_MIME[file_extension];
  if (mapped_mime_type && allowed_mime_set.has(mapped_mime_type)) {
    return mapped_mime_type;
  }

  return null;
}

/**
 * Valida que el archivo tenga tamaño positivo menor o igual a 10 MiB y tipo MIME seguro.
 *
 * @param target_file - Archivo a validar.
 * @param allow_office_documents - Si se aceptan PDFs/hojas/presentaciones además de imágenes.
 * @returns `true` si el archivo cumple todas las políticas de carga segura.
 */
export function is_valid_evidence_file(
  target_file: File,
  allow_office_documents = true,
): boolean {
  if (!target_file || target_file.size <= 0 || target_file.size > MAX_UPLOAD_BYTES) {
    return false;
  }
  return resolve_safe_mime_type(target_file, allow_office_documents) !== null;
}

/**
 * Verifica que el nombre de carpeta de destino pertenezca al catálogo permitido en Storage.
 *
 * @param folder_name - Identificador de la carpeta destino solicitada.
 * @returns `true` si está en la lista blanca `ALLOWED_UPLOAD_FOLDERS`.
 */
export function is_allowed_upload_folder(folder_name: string): folder_name is AllowedUploadFolder {
  return ALLOWED_FOLDER_SET.has(folder_name);
}

/**
 * Genera un identificador único no colisionable para nombrar archivos dentro de Storage.
 *
 * @returns Cadena con timestamp y UUID criptográfico (o sufijo aleatorio de respaldo).
 */
export function generate_safe_upload_id(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${Date.now()}-${crypto.randomUUID()}`;
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000_000)}`;
}
