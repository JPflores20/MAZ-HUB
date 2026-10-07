import React from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GEMBA_MAX_ARCHIVOS } from "../utils/gemba-image-utils";

interface PropiedadesZonaCarga {
  /** ¿Se puede agregar más archivos todavía? */
  puedeAgregarMas: boolean;
  /** ¿El usuario está arrastrando un archivo sobre la zona? */
  estaArrastrando: boolean;
  /** Cuántas imágenes hay actualmente en la galería */
  cantidadImagenesActual: number;
  /** Cuántas imágenes están subiendo actualmente */
  cantidadSubiendo: number;
  /** Callback al arrastrar sobre la zona */
  alArrastarSobre: (e: React.DragEvent) => void;
  /** Callback al salir de la zona con arrastre */
  alSalirDelArrastre: (e: React.DragEvent) => void;
  /** Callback al soltar archivos en la zona */
  alSoltarArchivos: (e: React.DragEvent) => void;
  /** Callback al hacer clic (abre el selector de archivo) */
  alHacerClic: () => void;
}

/**
 * Zona interactiva de arrastre y clic para subir evidencias fotográficas.
 * Muestra instrucciones iniciales o un indicador de "agregar más" según el estado.
 */
export const ZonaCargaGemba: React.FC<PropiedadesZonaCarga> = ({
  puedeAgregarMas,
  estaArrastrando,
  cantidadImagenesActual,
  cantidadSubiendo,
  alArrastarSobre,
  alSalirDelArrastre,
  alSoltarArchivos,
  alHacerClic,
}) => {
  const esEstadoInicial = cantidadImagenesActual === 0 && cantidadSubiendo === 0;
  const espaciosRestantes = GEMBA_MAX_ARCHIVOS - cantidadImagenesActual;

  if (!puedeAgregarMas) {
    return (
      <p className="text-xs text-center text-muted-foreground py-2">
        Límite de {GEMBA_MAX_ARCHIVOS} evidencias alcanzado. Elimina alguna para añadir otra.
      </p>
    );
  }

  return (
    <div
      onDragOver={alArrastarSobre}
      onDragLeave={alSalirDelArrastre}
      onDrop={alSoltarArchivos}
      onClick={alHacerClic}
      className={cn(
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-colors select-none",
        estaArrastrando
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      {esEstadoInicial ? (
        <>
          <div className="p-4 rounded-full bg-muted">
            <UploadCloud className="size-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No hay evidencias</p>
          <p className="text-xs text-center text-primary/80 leading-relaxed px-4">
            Haz clic aquí o arrastra para adjuntar tus fotos o capturas
            <br />
            (hasta {GEMBA_MAX_ARCHIVOS}).
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="size-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            + Agregar más fotos ({espaciosRestantes} restantes)
          </p>
        </div>
      )}
    </div>
  );
};
