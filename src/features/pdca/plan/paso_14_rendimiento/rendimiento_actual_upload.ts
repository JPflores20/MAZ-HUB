/**
 * @fileoverview Carga y compresión segura de evidencias asociadas al Paso 14 (Rendimiento Actual).
 */
import {
  compress_image_for_upload,
  upload_validated_evidence_file,
} from "@/shared/services/storage/storage_upload_service";

/**
 * Comprime una imagen manteniendo su proporción dentro del ancho máximo configurado.
 */
export async function comprimir_imagen_rendimiento(
  archivo_imagen: File,
  ancho_maximo = 2048,
  calidad_compresion = 0.85,
): Promise<Blob> {
  const { blob: blob_comprimido } = await compress_image_for_upload(archivo_imagen, {
    max_width: ancho_maximo,
    quality: calidad_compresion,
    preserve_png: false,
  });
  return blob_comprimido;
}

/**
 * Sube la evidencia fotográfica o documento del indicador PI hacia Firebase Storage.
 */
export async function subir_evidencia_rendimiento(archivo_subir: File): Promise<string> {
  return upload_validated_evidence_file(archivo_subir, "rendimiento_actual_evidencias", {
    compress_images: true,
    max_width: 2048,
    quality: 0.85,
    preserve_png: false,
    allow_office_documents: true,
  });
}
