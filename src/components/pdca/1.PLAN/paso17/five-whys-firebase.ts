// Utilidades de Firebase para el módulo Five Whys

/** Comprime una imagen antes de subirla para optimizar el almacenamiento */
export function comprimirImagen(archivo: File, anchoMaximo = 2048, calidad = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.readAsDataURL(archivo);
    lector.onload = (evento) => {
      const imagenElem = new Image();
      imagenElem.src = evento.target?.result as string;
      imagenElem.onload = () => {
        const lienzo = document.createElement("canvas");
        const escala = Math.min(1, anchoMaximo / imagenElem.width);
        lienzo.width = imagenElem.width * escala;
        lienzo.height = imagenElem.height * escala;
        lienzo.getContext("2d")!.drawImage(imagenElem, 0, 0, lienzo.width, lienzo.height);
        lienzo.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
          "image/jpeg",
          calidad,
        );
      };
      imagenElem.onerror = reject;
    };
    lector.onerror = reject;
  });
}

/** Sube un archivo a Firebase Storage y retorna la URL de descarga */
export async function subirArchivoAFirebase(archivo: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const identificadorUnico = Date.now().toString() + Math.random().toString(36).substring(7);
  const extensionArchivo = archivo.name.split(".").pop() || "jpg";
  const nombreArchivo = `uploads/five_whys_evidencias/${identificadorUnico}.${extensionArchivo}`;
  const referenciaStorage = ref(storage, nombreArchivo);

  let blobParaSubir: Blob = archivo;
  if (archivo.type.startsWith("image/")) {
    blobParaSubir = await comprimirImagen(archivo);
  }

  const tareaSubida = uploadBytesResumable(referenciaStorage, blobParaSubir);

  return new Promise((resolve, reject) => {
    tareaSubida.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(tareaSubida.snapshot.ref)),
    );
  });
}
