/**
 * Utilidades de procesamiento de imágenes para el paso Gemba Evidencias.
 * Contiene la lógica de compresión de imagen y subida a Firebase Storage.
 */

/** Máximo de evidencias permitidas por PDCA */
export const GEMBA_MAX_ARCHIVOS = 10;

/**
 * Comprime una imagen al ancho y calidad indicados antes de subirla.
 * @param archivo - Archivo de imagen a comprimir.
 * @param anchoMaximo - Ancho máximo en píxeles (default: 2048).
 * @param calidadJpeg - Calidad de compresión JPEG de 0 a 1 (default: 0.85).
 */
export function comprimirImagen(
  archivo: File,
  anchoMaximo = 2048,
  calidadJpeg = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.readAsDataURL(archivo);

    lector.onload = (evento) => {
      const imagenElement = new Image();
      imagenElement.src = evento.target?.result as string;

      imagenElement.onload = () => {
        const canvas = document.createElement("canvas");
        const escala = Math.min(1, anchoMaximo / imagenElement.width);
        canvas.width = imagenElement.width * escala;
        canvas.height = imagenElement.height * escala;

        canvas
          .getContext("2d")!
          .drawImage(imagenElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Compresión fallida: toBlob devolvió null")),
          "image/jpeg",
          calidadJpeg,
        );
      };

      imagenElement.onerror = reject;
    };

    lector.onerror = reject;
  });
}

/**
 * Sube un archivo de imagen a Firebase Storage (con compresión previa)
 * y devuelve la URL de descarga pública.
 * @param archivo - Archivo de imagen a subir.
 */
export async function subirImagenAFirebase(archivo: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import(
    "firebase/storage"
  );
  const { storage } = await import("@/lib/firebase");

  const identificadorUnico =
    Date.now().toString() + Math.random().toString(36).substring(7);
  const extensionArchivo = archivo.name.split(".").pop() || "jpg";
  const rutaEnStorage = `uploads/gemba_evidencias/${identificadorUnico}.${extensionArchivo}`;

  const referenciaStorage = ref(storage, rutaEnStorage);
  const blobComprimido = await comprimirImagen(archivo);
  const tareaDeSubida = uploadBytesResumable(referenciaStorage, blobComprimido);

  return new Promise((resolve, reject) => {
    tareaDeSubida.on(
      "state_changed",
      null,
      reject,
      async () => resolve(await getDownloadURL(tareaDeSubida.snapshot.ref)),
    );
  });
}
