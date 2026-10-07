import React, { useRef } from "react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PopoverPegarEnlace } from "./url-link-popover";

interface PropiedadesZonaSingleUpload {
  /** ¿Hay imagen ya cargada? */
  tieneImagen: boolean;
  /** ¿Está subiendo actualmente? */
  estaSubiendo: boolean;
  /** ¿Se está arrastrando un archivo sobre la zona? */
  estaArrastrando: boolean;
  /** Texto subtitle para estado vacío */
  subtitulo: string;
  /** Texto description para estado vacío */
  descripcion: string;
  /** Callback al arrastrar sobre la zona */
  alArrastarSobre: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Callback al salir del arrastre */
  alSalirArrastre: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Callback al soltar archivo */
  alSoltar: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Callback para abrir el selector de archivo */
  alSeleccionarArchivo: () => void;
  /** Callback al confirmar un enlace URL */
  alConfirmarEnlace: (url: string) => void;
}

/**
 * Zona de arrastre/clic para subir una sola imagen.
 * Muestra estado vacío con instrucciones o spinner de carga.
 */
export const ZonaCargaImagenSimple: React.FC<PropiedadesZonaSingleUpload> = ({
  tieneImagen,
  estaSubiendo,
  estaArrastrando,
  subtitulo,
  descripcion,
  alArrastarSobre,
  alSalirArrastre,
  alSoltar,
  alSeleccionarArchivo,
  alConfirmarEnlace,
}) => {
  if (tieneImagen) return null;

  return (
    <div
      className={`mt-2 relative rounded-xl overflow-hidden border ${
        estaArrastrando
          ? "border-primary border-dashed bg-primary/10"
          : "border-border/50 bg-secondary/10"
      } transition-colors flex flex-col items-center justify-center p-6 min-h-[200px]`}
      onDragOver={alArrastarSobre}
      onDragLeave={alSalirArrastre}
      onDrop={alSoltar}
    >
      {estaSubiendo ? (
        <div className="text-center py-8">
          <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-foreground">Subiendo imagen...</p>
          <p className="text-xs text-muted-foreground mt-1">Por favor espera un momento</p>
        </div>
      ) : (
        <div className="text-center pointer-events-none">
          <div
            className={`size-12 rounded-full ${
              estaArrastrando ? "bg-primary/20 text-primary" : "bg-background text-primary/60"
            } border shadow-sm flex items-center justify-center mx-auto mb-3 transition-colors`}
          >
            <ImageIcon className="size-5" />
          </div>
          <h4 className="font-semibold text-foreground">
            {estaArrastrando ? "Suelta la imagen aquí" : subtitulo}
          </h4>
          <p className="text-sm max-w-sm mx-auto mt-1 text-muted-foreground mb-4">
            {estaArrastrando ? "Se subirá y comprimirá automáticamente." : descripcion}
          </p>
          <div className="flex justify-center gap-2 mt-4 pointer-events-auto">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                alSeleccionarArchivo();
              }}
              className="gap-2"
              disabled={estaSubiendo}
            >
              <UploadCloud className="size-4" />
              Seleccionar archivo
            </Button>
            <PopoverPegarEnlace
              alConfirmarEnlace={alConfirmarEnlace}
              deshabilitado={estaSubiendo}
              tamano="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
