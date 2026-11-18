/**
 * @fileoverview Zona inicial vacía para carga múltiple de evidencias por clic, arrastre o pegado.
 */
import React from "react";
import { UploadCloud } from "lucide-react";
import { PopoverPegarEnlace } from "./url_link_popover";

interface PropiedadesZonaVaciaMulti {
  esta_subiendo: boolean;
  esta_arrastrando: boolean;
  limite_maximo: number;
  al_abrir_selector: () => void;
  al_arrastrar_sobre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_salir_arrastre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_soltar: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_pegar: (evento: React.ClipboardEvent<HTMLDivElement>) => void;
  al_confirmar_enlace: (url_segura: string) => void;
}

/**
 * Muestra la tarjeta inicial de carga cuando aún no se han agregado archivos múltiples.
 */
export const ZonaVaciaMultiUpload: React.FC<PropiedadesZonaVaciaMulti> = ({
  esta_subiendo,
  esta_arrastrando,
  limite_maximo,
  al_abrir_selector,
  al_arrastrar_sobre,
  al_salir_arrastre,
  al_soltar,
  al_pegar,
  al_confirmar_enlace,
}) => {
  return (
    <div
      className={`relative rounded-xl border-2 border-dashed ${
        esta_arrastrando
          ? "border-primary bg-primary/10"
          : "border-border/60 bg-secondary/10 hover:bg-secondary/30"
      } transition-all flex flex-col items-center justify-center p-10 min-h-[200px] cursor-pointer group focus-visible:outline-primary focus-visible:ring-2 focus-visible:ring-ring`}
      tabIndex={0}
      onClick={al_abrir_selector}
      onKeyDown={(evento) => {
        if (evento.key === "Enter" || evento.key === " ") al_abrir_selector();
      }}
      onDragOver={al_arrastrar_sobre}
      onDragLeave={al_salir_arrastre}
      onDrop={al_soltar}
      onPaste={al_pegar}
    >
      {esta_subiendo ? (
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-foreground">Subiendo imágenes...</p>
          <p className="text-xs text-muted-foreground mt-1">Por favor espera</p>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center pointer-events-none">
          <div
            className={`size-14 rounded-full ${
              esta_arrastrando
                ? "bg-primary/20 text-primary scale-110"
                : "bg-background text-primary/60"
            } border shadow-sm flex items-center justify-center mb-4 transition-all group-hover:scale-105 group-hover:border-primary/40 group-hover:text-primary`}
          >
            <UploadCloud className="size-6 transition-colors" />
          </div>
          <h4 className="font-semibold text-foreground">
            {esta_arrastrando ? "Suelta las imágenes aquí" : "No hay evidencias"}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
            {esta_arrastrando
              ? "Se subirán y comprimirán automáticamente."
              : `Haz clic aquí o arrastra para adjuntar tus fotos o capturas (hasta ${limite_maximo}).`}
          </p>
          {!esta_arrastrando && (
            <div className="flex justify-center gap-2 mt-4 pointer-events-auto">
              <PopoverPegarEnlace
                al_confirmar_enlace={al_confirmar_enlace}
                deshabilitado={esta_subiendo}
                tamano="sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
