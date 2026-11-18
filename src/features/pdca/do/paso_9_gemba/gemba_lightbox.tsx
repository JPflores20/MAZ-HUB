/**
 * @fileoverview Visor a pantalla completa (lightbox) para fotografías de evidencia Gemba Walk.
 */
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesLightboxGemba {
  url_imagen_activa: string | null;
  al_cerrar: () => void;
}

/**
 * Muestra la imagen Gemba ampliada en modal fullscreen tras sanitizar su origen.
 */
export const LightboxEvidenciaGemba: React.FC<PropiedadesLightboxGemba> = ({
  url_imagen_activa,
  al_cerrar,
}) => {
  const url_segura = url_imagen_activa
    ? sanitize_external_url(url_imagen_activa, { allowDataMedia: true })
    : "";

  return (
    <Dialog open={Boolean(url_segura)} onOpenChange={al_cerrar}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
        <DialogTitle className="sr-only">Vista de evidencia en pantalla completa</DialogTitle>
        <img
          src={url_segura ?? ""}
          alt="Evidencia en grande"
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};
