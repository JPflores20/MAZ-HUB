/**
 * storage_upload_service.ts
 * Servicio centralizado y seguro para compresión de imágenes y subida de evidencias
 * a Firebase Storage bajo rutas aisladas por UID (`uploads/{carpeta}/{uid}/{archivo}`).
 */
import {
  type AllowedUploadFolder,
  MIME_TO_EXTENSION,
  MAX_UPLOAD_BYTES,
  SAFE_IMAGE_MIME_SET,
  generate_safe_upload_id,
  is_allowed_upload_folder,
  resolve_safe_mime_type,
} from "./storage_upload_validation";

export interface ImageCompressionOptions {
  max_width?: number;
  quality?: number;
  preserve_png?: boolean;
}

export interface EvidenceUploadOptions extends ImageCompressionOptions {
  compress_images?: boolean;
  allow_office_documents?: boolean;
}

export interface CompressedImageResult {
  blob: Blob;
  content_type: string;
  extension: string;
}

/**
 * Calcula las dimensiones escaladas manteniendo la relación de aspecto dentro de `max_width`.
 *
 * @param original_width - Ancho original de la imagen en píxeles.
 * @param original_height - Alto original de la imagen en píxeles.
 * @param max_width - Límite máximo para el lado mayor en píxeles.
 * @returns Ancho y alto enteros positivos resultantes.
 */
function calculate_resized_dimensions(
  original_width: number,
  original_height: number,
  max_width: number,
): { target_width: number; target_height: number } {
  let scaled_width = original_width;
  let scaled_height = original_height;

  if (scaled_width > scaled_height) {
    if (scaled_width > max_width) {
      scaled_height *= max_width / scaled_width;
      scaled_width = max_width;
    }
  } else if (scaled_height > max_width) {
    scaled_width *= max_width / scaled_height;
    scaled_height = max_width;
  }

  return {
    target_width: Math.max(1, Math.round(scaled_width)),
    target_height: Math.max(1, Math.round(scaled_height)),
  };
}

/**
 * Comprime y redimensiona una imagen en navegador mediante `<canvas>` antes de subirla a Storage.
 *
 * @param target_file - Archivo de imagen original.
 * @param options - Parámetros de resolución máxima, calidad y preservación de transparencia PNG.
 * @returns Promesa con el `Blob` comprimido, su MIME final y extensión sugerida.
 */
export function compress_image_for_upload(
  target_file: File,
  options: ImageCompressionOptions = {},
): Promise<CompressedImageResult> {
  const max_width = options.max_width ?? 2048;
  const quality = options.quality ?? 0.85;
  const preserve_png = options.preserve_png ?? false;

  return new Promise((resolve, reject) => {
    const file_reader = new FileReader();
    file_reader.onload = (load_event) => {
      const image_element = new Image();
      image_element.onload = () => {
        const canvas_element = document.createElement("canvas");
        const { target_width, target_height } = calculate_resized_dimensions(
          image_element.width,
          image_element.height,
          max_width,
        );

        canvas_element.width = target_width;
        canvas_element.height = target_height;
        const canvas_context = canvas_element.getContext("2d");
        if (!canvas_context) {
          reject(new Error("No se pudo inicializar el contexto gráfico para comprimir la imagen."));
          return;
        }
        canvas_context.drawImage(image_element, 0, 0, target_width, target_height);

        const content_type =
          preserve_png && target_file.type === "image/png" ? "image/png" : "image/jpeg";
        const extension = content_type === "image/png" ? "png" : "jpg";
        canvas_element.toBlob(
          (output_blob) =>
            output_blob
              ? resolve({ blob: output_blob, content_type, extension })
              : reject(new Error("Error al comprimir la imagen.")),
          content_type,
          quality,
        );
      };
      image_element.onerror = () => reject(new Error("Error cargando imagen."));
      image_element.src = load_event.target?.result as string;
    };
    file_reader.onerror = () => reject(new Error("Error leyendo archivo."));
    file_reader.readAsDataURL(target_file);
  });
}

/**
 * Valida permisos/MIME/tamaño, opcionalmente comprime imágenes y sube un archivo de evidencia
 * a la ruta aislada `uploads/{carpeta}/{uid}/{uuid}.{ext}` de Firebase Storage.
 *
 * @param target_file - Archivo seleccionado o generado para subir.
 * @param destination_folder - Carpeta autorizada dentro de `uploads/`.
 * @param options - Opciones de compresión y habilitación de documentos Office/PDF.
 * @returns Promesa con la URL de descarga generada por Firebase Storage.
 */
export async function upload_validated_evidence_file(
  target_file: File,
  destination_folder: AllowedUploadFolder | string = "pdca_images",
  options: EvidenceUploadOptions = {},
): Promise<string> {
  if (!is_allowed_upload_folder(destination_folder)) {
    throw new Error("Carpeta de almacenamiento no autorizada.");
  }

  const allow_office_documents = options.allow_office_documents ?? true;
  const resolved_mime = resolve_safe_mime_type(target_file, allow_office_documents);
  if (!resolved_mime) {
    throw new Error(
      "Formato de archivo no permitido. Usa únicamente imágenes seguras (JPG, PNG, WEBP, GIF) o documentos (PDF, Excel, PowerPoint).",
    );
  }

  if (target_file.size <= 0 || target_file.size > MAX_UPLOAD_BYTES) {
    throw new Error("El archivo excede el tamaño máximo permitido de 10 MB.");
  }

  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { primary_auth, storage } = await import("@/core/config/firebase");

  const auth_uid = primary_auth.currentUser?.uid;
  if (!auth_uid) {
    throw new Error("Debes iniciar sesión con tu cuenta corporativa verificada para subir archivos.");
  }

  let upload_blob: Blob = target_file;
  let final_mime_type = resolved_mime;
  let final_extension = MIME_TO_EXTENSION[resolved_mime] || "bin";

  const should_compress = options.compress_images ?? true;
  if (should_compress && SAFE_IMAGE_MIME_SET.has(resolved_mime) && resolved_mime !== "image/gif") {
    const compressed_image = await compress_image_for_upload(target_file, {
      ...(options.max_width !== undefined ? { max_width: options.max_width } : {}),
      ...(options.quality !== undefined ? { quality: options.quality } : {}),
      ...(options.preserve_png !== undefined ? { preserve_png: options.preserve_png } : {}),
    });
    upload_blob = compressed_image.blob;
    final_mime_type = compressed_image.content_type;
    final_extension = compressed_image.extension;
  }

  if (upload_blob.size <= 0 || upload_blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("El archivo procesado excede el tamaño máximo permitido de 10 MB.");
  }

  const storage_path = `uploads/${destination_folder}/${auth_uid}/${generate_safe_upload_id()}.${final_extension}`;
  const storage_ref = ref(storage, storage_path);
  const upload_task = uploadBytesResumable(storage_ref, upload_blob, {
    contentType: final_mime_type,
  });

  return new Promise((resolve, reject) => {
    upload_task.on("state_changed", null, reject, async () => {
      try {
        resolve(await getDownloadURL(upload_task.snapshot.ref));
      } catch (download_url_error) {
        reject(download_url_error);
      }
    });
  });
}
