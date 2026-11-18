/**
 * @fileoverview Utilidades compartidas de compresión, validación y subida de evidencias a Firebase Storage.
 */
import {
  compress_image_for_upload,
  upload_validated_evidence_file,
} from "@/shared/services/storage/storage_upload_service";
import {
  ALLOWED_UPLOAD_FOLDERS,
  OFFICE_MIME_TYPES,
  is_valid_evidence_file,
  type AllowedUploadFolder,
} from "@/shared/services/storage/storage_upload_validation";

/** Tipos MIME de documentos de oficina aceptados */
export const TIPOS_MIME_OFICINA = [...OFFICE_MIME_TYPES];

/** Cadena de tipos aceptados para inputs de archivo de evidencias */
export const ALL_ACCEPT_STRING =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.jpg,.jpeg,.png,.webp,.gif,.pdf,.xlsx,.xls,.pptx,.ppt";

export type TipoDeArchivo = "image" | "pdf" | "excel" | "powerpoint" | "document";

/**
 * Comprime una imagen manteniendo la relación de aspecto dentro del ancho máximo permitido.
 * @param archivo_imagen - Archivo de imagen origen.
 * @returns Blob comprimido listo para subir.
 */
export async function comprimir_imagen_para_subida(archivo_imagen: File): Promise<Blob> {
  const { blob: blob_comprimido } = await compress_image_for_upload(archivo_imagen, {
    max_width: 2048,
    quality: 0.85,
    preserve_png: true,
  });
  return blob_comprimido;
}

/**
 * Sube un archivo validado a Firebase Storage bajo ruta aislada por UID del propietario.
 * @param archivo - Archivo a subir.
 * @param carpeta_destino - Carpeta destino dentro de Storage (por defecto `pdca_images`).
 * @returns URL pública firmada del recurso subido.
 */
export async function subir_archivo_a_firebase(
  archivo: File,
  carpeta_destino = "pdca_images",
): Promise<string> {
  const carpeta_valida = (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(carpeta_destino)
    ? (carpeta_destino as AllowedUploadFolder)
    : "pdca_images";

  return upload_validated_evidence_file(archivo, carpeta_valida, {
    compress_images: true,
    max_width: 2048,
    quality: 0.85,
    preserve_png: true,
    allow_office_documents: true,
  });
}

/**
 * Determina el tipo lógico y etiqueta amigable a partir de la URL o nombre de archivo.
 * @param url_archivo - URL o ruta del documento.
 */
export function detectar_tipo_de_archivo(url_archivo: string): {
  tipo: TipoDeArchivo;
  etiqueta: string;
} {
  const url_normalizada = url_archivo.toLowerCase();

  if (url_normalizada.includes(".pdf")) return { tipo: "pdf", etiqueta: "PDF" };
  if (url_normalizada.includes(".xlsx") || url_normalizada.includes(".xls")) {
    return { tipo: "excel", etiqueta: "Excel" };
  }
  if (url_normalizada.includes(".pptx") || url_normalizada.includes(".ppt")) {
    return { tipo: "powerpoint", etiqueta: "PowerPoint" };
  }
  if (
    [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((extension_img) =>
      url_normalizada.includes(extension_img),
    )
  ) {
    return { tipo: "image", etiqueta: "Imagen" };
  }
  // Las URLs generadas por Firebase Storage sin extensión visible corresponden a imágenes por defecto
  if (
    url_normalizada.includes("firebasestorage") &&
    !url_normalizada.includes(".pdf") &&
    !url_normalizada.includes(".xls") &&
    !url_normalizada.includes(".ppt")
  ) {
    return { tipo: "image", etiqueta: "Imagen" };
  }

  return { tipo: "document", etiqueta: "Documento" };
}

/**
 * Valida si un archivo es permitido como evidencia según su tipo MIME/extensión.
 * @param archivo - Archivo seleccionado por el usuario.
 * @param tipos_aceptados - Cadena opcional que habilita documentos adicionales.
 */
export function es_archivo_valido(archivo: File, tipos_aceptados?: string): boolean {
  return is_valid_evidence_file(archivo, Boolean(tipos_aceptados));
}
