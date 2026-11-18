/**
 * @fileoverview Zona de arrastre y selección de archivos para carga individual de imagen o PDF.
 */
import React from "react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PopoverPegarEnlace } from "./url_link_popover";

interface PropiedadesZonaCargaSimple {
  tiene_imagen: boolean;
  esta_subiendo: boolean;
  esta_arrastrando: boolean;
  subtitulo: string;
  descripcion: string;
  al_arrastrar_sobre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_salir_arrastre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_soltar: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_seleccionar_archivo: () => void;
  al_confirmar_enlace: (url_segura: string) => void;
}

/**
 * Despliega el estado vacío con soporte de arrastrar/soltar, explorador de archivos y pegado de URL.
 */
export const ZonaCargaImagenSimple: React.FC<PropiedadesZonaCargaSimple> = ({
  tiene_imagen,
  esta_subiendo,
  esta_arrastrando,
  subtitulo,
  descripcion,
  al_arrastrar_sobre,
  al_salir_arrastre,
  al_soltar,
  al_seleccionar_archivo,
  al_confirmar_enlace,
}) => {
  if (tiene_imagen) return null;

  return (
    <div
      className={`mt-2 relative rounded-xl overflow-hidden border ${
        esta_arrastrando
          ? "border-primary border-dashed bg-primary/10"
          : "border-border/50 bg-secondary/10"
      } transition-colors flex flex-col items-center justify-center p-6 min-h-[200px]`}
      onDragOver={al_arrastrar_sobre}
      onDragLeave={al_salir_arrastre}
      onDrop={al_soltar}
    >
      {esta_subiendo ? (
        <div className="text-center py-8">
          <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-foreground">Subiendo imagen...</p>
          <p className="text-xs text-muted-foreground mt-1">Por favor espera un momento</p>
        </div>
      ) : (
        <div className="text-center pointer-events-none">
          <div
            className={`size-12 rounded-full ${
              esta_arrastrando ? "bg-primary/20 text-primary" : "bg-background text-primary/60"
            } border shadow-sm flex items-center justify-center mx-auto mb-3 transition-colors`}
          >
            <ImageIcon className="size-5" />
          </div>
          <h4 className="font-semibold text-foreground">
            {esta_arrastrando ? "Suelta la imagen aquí" : subtitulo}
          </h4>
          <p className="text-sm max-w-sm mx-auto mt-1 text-muted-foreground mb-4">
            {esta_arrastrando ? "Se subirá y comprimirá automáticamente." : descripcion}
          </p>
          <div className="flex justify-center gap-2 mt-4 pointer-events-auto">
            <Button
              variant="outline"
              onClick={(evento) => {
                evento.stopPropagation();
                al_seleccionar_archivo();
              }}
              className="gap-2"
              disabled={esta_subiendo}
            >
              <UploadCloud className="size-4" />
              Seleccionar archivo
            </Button>
            <PopoverPegarEnlace
              al_confirmar_enlace={al_confirmar_enlace}
              deshabilitado={esta_subiendo}
              tamano="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
