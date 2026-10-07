/**
 * Utilidades compartidas de subida de imágenes y documentos para el PDCA.
 * Contiene: compresión de imagen, subida a Firebase, detección de tipo de archivo y constantes.
 */

/** Tipos MIME de documentos de oficina aceptados */
export const TIPOS_MIME_OFICINA = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

/** String de tipos aceptados para inputs de archivo que admiten imágenes y documentos */
export const ALL_ACCEPT_STRING =
  "image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.xlsx,.xls,.pptx,.ppt";

/** Dimensiones máximas al comprimir una imagen antes de subirla */
const DIMENSION_MAXIMA_PX = 2048;

/**
 * Comprime una imagen manteniendo el aspecto y limitando su tamaño máximo.
 * @param archivo - Archivo de imagen a comprimir.
 */
export function comprimirImagenParaSubida(archivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = (evento) => {
      const imagenElement = new Image();

      imagenElement.onload = () => {
        const canvas = document.createElement("canvas");
        let ancho = imagenElement.width;
        let alto = imagenElement.height;

        if (ancho > alto) {
          if (ancho > DIMENSION_MAXIMA_PX) {
            alto *= DIMENSION_MAXIMA_PX / ancho;
            ancho = DIMENSION_MAXIMA_PX;
          }
        } else {
          if (alto > DIMENSION_MAXIMA_PX) {
            ancho *= DIMENSION_MAXIMA_PX / alto;
            alto = DIMENSION_MAXIMA_PX;
          }
        }

        canvas.width = ancho;
        canvas.height = alto;
        canvas.getContext("2d")?.drawImage(imagenElement, 0, 0, ancho, alto);

        const formatoSalida = archivo.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Error al comprimir la imagen")),
          formatoSalida,
          0.85,
        );
      };

      imagenElement.onerror = () => reject(new Error("Error cargando imagen"));
      imagenElement.src = evento.target?.result as string;
    };

    lector.onerror = () => reject(new Error("Error leyendo archivo"));
    lector.readAsDataURL(archivo);
  });
}

/**
 * Sube un archivo a Firebase Storage (con compresión si es imagen) y devuelve su URL.
 * @param archivo - Archivo a subir.
 * @param carpetaDestino - Carpeta dentro de Firebase Storage (default: pdca_images).
 */
export async function subirArchivoAFirebase(
  archivo: File,
  carpetaDestino = "pdca_images",
): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const identificadorUnico = Date.now().toString() + Math.random().toString(36).substring(7);
  const extension = archivo.name.split(".").pop() || "jpg";
  const rutaEnStorage = `uploads/${carpetaDestino}/${identificadorUnico}.${extension}`;
  const referenciaStorage = ref(storage, rutaEnStorage);

  let blobParaSubir: Blob = archivo;
  if (archivo.type.startsWith("image/")) {
    blobParaSubir = await comprimirImagenParaSubida(archivo);
  }

  const tareaDeSubida = uploadBytesResumable(referenciaStorage, blobParaSubir);

  return new Promise((resolve, reject) => {
    tareaDeSubida.on(
      "state_changed",
      null,
      reject,
      async () => resolve(await getDownloadURL(tareaDeSubida.snapshot.ref)),
    );
  });
}

export type TipoDeArchivo = "image" | "pdf" | "excel" | "powerpoint" | "document";

/**
 * Detecta el tipo de archivo a partir de su URL o nombre.
 */
export function detectarTipoDeArchivo(url: string): { tipo: TipoDeArchivo; etiqueta: string } {
  const urlMinuscula = url.toLowerCase();

  if (urlMinuscula.includes(".pdf")) return { tipo: "pdf", etiqueta: "PDF" };
  if (urlMinuscula.includes(".xlsx") || urlMinuscula.includes(".xls"))
    return { tipo: "excel", etiqueta: "Excel" };
  if (urlMinuscula.includes(".pptx") || urlMinuscula.includes(".ppt"))
    return { tipo: "powerpoint", etiqueta: "PowerPoint" };
  if (
    [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"].some((ext) =>
      urlMinuscula.includes(ext),
    )
  )
    return { tipo: "image", etiqueta: "Imagen" };
  // Firebase URLs sin extensión visible → tratar como imagen por defecto
  if (
    urlMinuscula.includes("firebasestorage") &&
    !urlMinuscula.includes(".pdf") &&
    !urlMinuscula.includes(".xls") &&
    !urlMinuscula.includes(".ppt")
  )
    return { tipo: "image", etiqueta: "Imagen" };

  return { tipo: "document", etiqueta: "Documento" };
}

/**
 * Verifica si un archivo es válido (imagen, PDF o documento de oficina).
 */
export function esArchivoValido(archivo: File, tiposAceptados?: string): boolean {
  if (archivo.type.startsWith("image/")) return true;
  if (archivo.type === "application/pdf") return true;
  if (tiposAceptados && TIPOS_MIME_OFICINA.includes(archivo.type)) return true;
  const extension = archivo.name.split(".").pop()?.toLowerCase();
  if (extension && ["pdf", "xls", "xlsx", "ppt", "pptx"].includes(extension)) return true;
  return false;
}
