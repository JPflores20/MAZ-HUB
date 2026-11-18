/**
 * @fileoverview Carga y compresión segura de evidencias para validación de causas raíz (5 Porqués).
 */
import {
  compress_image_for_upload,
  upload_validated_evidence_file,
} from "@/shared/services/storage/storage_upload_service";

/**
 * Comprime una imagen manteniendo proporción dentro de 2048px de ancho máximo.
 */
export async function comprimir_imagen_five_whys(
  archivo: File,
  ancho_maximo = 2048,
  calidad = 0.85,
): Promise<Blob> {
  const { blob: blob_comprimido } = await compress_image_for_upload(archivo, {
    max_width: ancho_maximo,
    quality: calidad,
    preserve_png: false,
  });
  return blob_comprimido;
}

/**
 * Sube un archivo de evidencia al bucket de `five_whys_evidencias` y retorna su URL de descarga.
 */
export async function subir_evidencia_five_whys(archivo: File): Promise<string> {
  return upload_validated_evidence_file(archivo, "five_whys_evidencias", {
    compress_images: true,
    max_width: 2048,
    quality: 0.85,
    preserve_png: false,
    allow_office_documents: true,
  });
}
