/**
 * @fileoverview Zona interactiva de arrastre y selección de archivos para evidencias Gemba.
 */
import React from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import { cn } from "@/shared/utils/class_names";
import { GEMBA_MAX_ARCHIVOS } from "./gemba_image_utils";

interface PropiedadesZonaCargaGemba {
  puede_agregar_mas: boolean;
  esta_arrastrando: boolean;
  cantidad_imagenes_actual: number;
  cantidad_subiendo: number;
  al_arrastrar_sobre: (evento: React.DragEvent) => void;
  al_salir_del_arrastre: (evento: React.DragEvent) => void;
  al_soltar_archivos: (evento: React.DragEvent) => void;
  al_hacer_clic: () => void;
}

/**
 * Permite adjuntar fotos o capturas Gemba por clic o drag-and-drop respetando el límite máximo.
 */
export const ZonaCargaGemba: React.FC<PropiedadesZonaCargaGemba> = ({
  puede_agregar_mas,
  esta_arrastrando,
  cantidad_imagenes_actual,
  cantidad_subiendo,
  al_arrastrar_sobre,
  al_salir_del_arrastre,
  al_soltar_archivos,
  al_hacer_clic,
}) => {
  const es_estado_inicial = cantidad_imagenes_actual === 0 && cantidad_subiendo === 0;
  const espacios_restantes = GEMBA_MAX_ARCHIVOS - cantidad_imagenes_actual;

  if (!puede_agregar_mas) {
    return (
      <p className="text-xs text-center text-muted-foreground py-2">
        Límite de {GEMBA_MAX_ARCHIVOS} evidencias alcanzado. Elimina alguna para añadir otra.
      </p>
    );
  }

  return (
    <div
      onDragOver={al_arrastrar_sobre}
      onDragLeave={al_salir_del_arrastre}
      onDrop={al_soltar_archivos}
      onClick={al_hacer_clic}
      className={cn(
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-colors select-none",
        esta_arrastrando
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      {es_estado_inicial ? (
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
            + Agregar más fotos ({espacios_restantes} restantes)
          </p>
        </div>
      )}
    </div>
  );
};
