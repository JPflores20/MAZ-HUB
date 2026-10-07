import React from "react";
import { ZoomIn, X } from "lucide-react";

interface PropiedadesMiniaturaEvidencia {
  /** URL de la imagen a mostrar */
  urlImagen: string;
  /** Posición en la galería (para mostrar el número) */
  numeroPosicion: number;
  /** Callback para abrir la imagen en el lightbox */
  alVerEnGrande: (url: string) => void;
  /** Callback para eliminar la imagen de la galería */
  alEliminar: (indice: number) => void;
}

/**
 * Miniatura individual de evidencia fotográfica.
 * Muestra la imagen con overlay de acciones (zoom y eliminar) al hacer hover.
 */
export const MiniaturaEvidenciaGemba: React.FC<PropiedadesMiniaturaEvidencia> = ({
  urlImagen,
  numeroPosicion,
  alVerEnGrande,
  alEliminar,
}) => {
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
      <img
        src={urlImagen}
        alt={`Evidencia ${numeroPosicion}`}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />

      {/* Overlay de acciones visible en hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => alVerEnGrande(urlImagen)}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          title="Ver en grande"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => alEliminar(numeroPosicion - 1)}
          className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/80 text-white transition-colors"
          title="Eliminar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Etiqueta con número de posición */}
      <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/40 rounded px-1">
        {numeroPosicion}
      </span>
    </div>
  );
};
