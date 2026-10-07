import React from "react";
import { Loader2 } from "lucide-react";

interface PropiedadesGaleria {
  /** URLs de imágenes ya subidas */
  urlsImagenes: string[];
  /** Cantidad de imágenes actualmente en proceso de subida */
  cantidadSubiendo: number;
  /** Callback al hacer clic en zoom de una imagen */
  alVerEnGrande: (url: string) => void;
  /** Callback al hacer clic en eliminar una imagen (por índice) */
  alEliminar: (indice: number) => void;
  /** Componente de miniatura a usar para cada imagen */
  ComponenteMiniatura: React.FC<{
    urlImagen: string;
    numeroPosicion: number;
    alVerEnGrande: (url: string) => void;
    alEliminar: (indice: number) => void;
  }>;
}

/**
 * Galería de miniaturas de evidencias con indicadores de carga.
 * Muestra las imágenes subidas y placeholders animados para las que están cargando.
 */
export const GaleriaEvidenciasGemba: React.FC<PropiedadesGaleria> = ({
  urlsImagenes,
  cantidadSubiendo,
  alVerEnGrande,
  alEliminar,
  ComponenteMiniatura,
}) => {
  const hayContenido = urlsImagenes.length > 0 || cantidadSubiendo > 0;

  if (!hayContenido) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {urlsImagenes.map((url, indice) => (
        <ComponenteMiniatura
          key={url + indice}
          urlImagen={url}
          numeroPosicion={indice + 1}
          alVerEnGrande={alVerEnGrande}
          alEliminar={alEliminar}
        />
      ))}

      {/* Placeholders de carga animados */}
      {Array.from({ length: cantidadSubiendo }).map((_, indice) => (
        <div
          key={`subiendo-${indice}`}
          className="aspect-square rounded-lg border border-dashed border-border bg-muted flex items-center justify-center"
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ))}
    </div>
  );
};
