export function comprimirImagen(
  archivoImagen: File,
  anchoMaximo = 2048,
  calidadCompresion = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const lectorArchivo = new FileReader();
    lectorArchivo.readAsDataURL(archivoImagen);
    lectorArchivo.onload = (eventoLector) => {
      const objetoImagen = new Image();
      objetoImagen.src = eventoLector.target?.result as string;
      objetoImagen.onload = () => {
        const elementoCanvas = document.createElement("canvas");
        const escalaImagen = Math.min(1, anchoMaximo / objetoImagen.width);
        elementoCanvas.width = objetoImagen.width * escalaImagen;
        elementoCanvas.height = objetoImagen.height * escalaImagen;
        elementoCanvas
          .getContext("2d")!
          .drawImage(objetoImagen, 0, 0, elementoCanvas.width, elementoCanvas.height);
        elementoCanvas.toBlob(
          (blobResultado) =>
            blobResultado ? resolve(blobResultado) : reject(new Error("Compresión fallida")),
          "image/jpeg",
          calidadCompresion,
        );
      };
      objetoImagen.onerror = reject;
    };
    lectorArchivo.onerror = reject;
  });
}

export async function subirArchivoFirebase(archivoSubir: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const identificadorUnico = Date.now().toString() + Math.random().toString(36).substring(7);
  const extensionArchivo = archivoSubir.name.split(".").pop() || "jpg";
  const nombreRutaArchivo = `uploads/rendimiento_actual_evidencias/${identificadorUnico}.${extensionArchivo}`;
  const referenciaStorage = ref(storage, nombreRutaArchivo);

  let blobParaSubir: Blob = archivoSubir;
  if (archivoSubir.type.startsWith("image/")) {
    blobParaSubir = await comprimirImagen(archivoSubir);
  }

  const tareaSubida = uploadBytesResumable(referenciaStorage, blobParaSubir);

  return new Promise((resolve, reject) => {
    tareaSubida.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(tareaSubida.snapshot.ref)),
    );
  });
}
