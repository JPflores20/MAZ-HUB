/**
 * @fileoverview Miniatura de evidencia Gemba con controles de ampliación y eliminación segura.
 */
import React from "react";
import { ZoomIn, X, FileText } from "lucide-react";
import { sanitize_external_url } from "@/core/security";

export interface PropiedadesMiniaturaGemba {
  url_imagen: string;
  numero_posicion: number;
  al_ver_en_grande: (url: string) => void;
  al_eliminar: (indice: number) => void;
}

/**
 * Muestra una miniatura segura (imagen o badge PDF) con overlay interactivo al pasar el cursor.
 */
export const MiniaturaEvidenciaGemba: React.FC<PropiedadesMiniaturaGemba> = ({
  url_imagen,
  numero_posicion,
  al_ver_en_grande,
  al_eliminar,
}) => {
  const url_segura = sanitize_external_url(url_imagen, { allowDataMedia: true });
  if (!url_segura) return null;

  const es_pdf =
    url_segura.startsWith("data:application/pdf") || url_segura.toLowerCase().includes(".pdf");

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
      {es_pdf ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-105">
          <FileText className="size-8 mb-1" />
          <span className="text-[10px] font-semibold">PDF</span>
        </div>
      ) : (
        <img
          src={url_segura}
          alt={`Evidencia ${numero_posicion}`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => al_ver_en_grande(url_segura)}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          title="Ver en grande"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => al_eliminar(numero_posicion - 1)}
          className="p-1.5 rounded-full bg-white/20 hover:bg-red-500 dark:bg-red-600/80 text-white transition-colors"
          title="Eliminar"
        >
          <X className="size-4" />
        </button>
      </div>

      <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/40 rounded px-1">
        {numero_posicion}
      </span>
    </div>
  );
};
