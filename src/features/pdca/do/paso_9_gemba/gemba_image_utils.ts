/**
 * @fileoverview Utilidades de compresión y subida segura a Firebase Storage para evidencias Gemba Walk.
 */
import {
  compress_image_for_upload,
  upload_validated_evidence_file,
} from "@/shared/services/storage/storage_upload_service";

/** Máximo de evidencias fotográficas permitidas por paso Gemba */
export const GEMBA_MAX_ARCHIVOS = 10;

/**
 * Comprime una fotografía al ancho y calidad JPEG especificados antes de enviarla a Storage.
 * @param archivo - Imagen de entrada seleccionada por el usuario.
 * @param ancho_maximo - Ancho máximo en píxeles (por defecto 2048).
 * @param calidad_jpeg - Calidad JPEG entre 0 y 1 (por defecto 0.85).
 */
export async function comprimir_imagen_gemba(
  archivo: File,
  ancho_maximo = 2048,
  calidad_jpeg = 0.85,
): Promise<Blob> {
  const { blob } = await compress_image_for_upload(archivo, {
    max_width: ancho_maximo,
    quality: calidad_jpeg,
    preserve_png: false,
  });
  return blob;
}

/**
 * Valida y sube una evidencia Gemba a Firebase Storage devolviendo su URL pública.
 * @param archivo - Imagen o PDF capturado en piso.
 */
export async function subir_imagen_gemba(archivo: File): Promise<string> {
  return upload_validated_evidence_file(archivo, "gemba_evidencias", {
    compress_images: true,
    max_width: 2048,
    quality: 0.85,
    preserve_png: false,
    allow_office_documents: false,
  });
}
