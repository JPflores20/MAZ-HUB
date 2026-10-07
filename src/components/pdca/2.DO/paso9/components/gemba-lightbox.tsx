import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PropiedadesLightbox {
  /** URL de la imagen a mostrar, o null si el lightbox está cerrado */
  urlImagenActiva: string | null;
  /** Callback para cerrar el lightbox */
  alCerrar: () => void;
}

/**
 * Visor de imagen a pantalla completa (lightbox).
 * Se muestra cuando el usuario hace clic en el botón de zoom de una miniatura.
 */
export const LightboxEvidenciaGemba: React.FC<PropiedadesLightbox> = ({
  urlImagenActiva,
  alCerrar,
}) => {
  return (
    <Dialog open={!!urlImagenActiva} onOpenChange={alCerrar}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
        <DialogTitle className="sr-only">Vista de evidencia en pantalla completa</DialogTitle>
        <img
          src={urlImagenActiva ?? ""}
          alt="Evidencia en grande"
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};
