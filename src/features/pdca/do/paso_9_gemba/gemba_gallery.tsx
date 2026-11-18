/**
 * @fileoverview Cuadrícula de miniaturas y placeholders de carga para evidencias del Gemba Walk.
 */
import React from "react";
import { Loader2 } from "lucide-react";
import type { PropiedadesMiniaturaGemba } from "./gemba_image_thumbnail";

interface PropiedadesGaleriaGemba {
  urls_imagenes: string[];
  cantidad_subiendo: number;
  al_ver_en_grande: (url: string) => void;
  al_eliminar: (indice: number) => void;
  ComponenteMiniatura: React.FC<PropiedadesMiniaturaGemba>;
}

/**
 * Renderiza las miniaturas subidas junto con esqueletos animados de carga en progreso.
 */
export const GaleriaEvidenciasGemba: React.FC<PropiedadesGaleriaGemba> = ({
  urls_imagenes,
  cantidad_subiendo,
  al_ver_en_grande,
  al_eliminar,
  ComponenteMiniatura,
}) => {
  if (urls_imagenes.length === 0 && cantidad_subiendo === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {urls_imagenes.map((url_item, indice) => (
        <ComponenteMiniatura
          key={`${url_item}-${indice}`}
          url_imagen={url_item}
          numero_posicion={indice + 1}
          al_ver_en_grande={al_ver_en_grande}
          al_eliminar={al_eliminar}
        />
      ))}

      {Array.from({ length: cantidad_subiendo }).map((_, indice) => (
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
