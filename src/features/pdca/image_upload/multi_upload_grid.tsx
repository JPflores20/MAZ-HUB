/**
 * @fileoverview Cuadrícula de miniaturas con visor de zoom, confirmación de borrado y celda adicional.
 */
import React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert_dialog";
import { DialogTrigger } from "@/shared/ui/dialog";
import { VisorImagenConZoom } from "./image_zoom_viewer";
import { IconoTipoArchivo } from "./file_type_icon";
import { PopoverPegarEnlace } from "./url_link_popover";
import { detectar_tipo_de_archivo } from "./upload_utils";
import { open_safe_external_url, sanitize_external_url } from "@/core/security";

interface PropiedadesGrillaMultiUpload {
  urls_imagenes: string[];
  limite_maximo: number;
  esta_subiendo: boolean;
  esta_arrastrando: boolean;
  al_eliminar: (indice_imagen: number) => void;
  al_abrir_selector: () => void;
  al_arrastrar_sobre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_salir_arrastre: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_soltar: (evento: React.DragEvent<HTMLDivElement>) => void;
  al_pegar: (evento: React.ClipboardEvent<HTMLDivElement>) => void;
  al_confirmar_enlace: (url_segura: string) => void;
}

/**
 * Renderiza la galería de evidencias múltiples más la celda interactiva "Añadir más".
 */
export const GrillaMultiUpload: React.FC<PropiedadesGrillaMultiUpload> = ({
  urls_imagenes,
  limite_maximo,
  esta_subiendo,
  esta_arrastrando,
  al_eliminar,
  al_abrir_selector,
  al_arrastrar_sobre,
  al_salir_arrastre,
  al_soltar,
  al_pegar,
  al_confirmar_enlace,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {urls_imagenes.map((url_imagen, indice_imagen) => {
        const url_segura = sanitize_external_url(url_imagen, { allowDataMedia: true });
        if (!url_segura) return null;
        const info_archivo = detectar_tipo_de_archivo(url_segura);

        return (
          <div
            key={`${url_segura}-${indice_imagen}`}
            className="relative aspect-video rounded-xl overflow-hidden border bg-black/5 group shadow-sm"
          >
            {info_archivo.tipo !== "image" ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => open_safe_external_url(url_segura, { allowDataMedia: true })}
                title={`Clic para abrir ${info_archivo.etiqueta} en nueva pestaña`}
              >
                <IconoTipoArchivo tipo_archivo={info_archivo.tipo} className="size-12 mb-2" />
                <span className="text-xs font-semibold text-foreground">
                  {info_archivo.etiqueta}
                </span>
              </div>
            ) : (
              <VisorImagenConZoom
                url_imagen={url_segura}
                texto_alternativo={`Evidencia ${indice_imagen + 1}`}
              >
                <DialogTrigger asChild>
                  <img
                    src={url_segura}
                    alt={`Evidencia ${indice_imagen + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    title="Clic para ver imagen completa"
                  />
                </DialogTrigger>
              </VisorImagenConZoom>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all rounded-full h-7 w-7 shadow-md scale-90 hover:scale-100 z-10"
                  title="Eliminar imagen"
                >
                  <X className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar esta imagen de evidencia? Esta acción no se
                    puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => al_eliminar(indice_imagen)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}

      {urls_imagenes.length < limite_maximo && (
        <div
          className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed ${
            esta_arrastrando
              ? "border-primary bg-primary/10"
              : "border-border/60 bg-secondary/10 hover:bg-secondary/30"
          } transition-all flex flex-col items-center justify-center p-4 cursor-pointer group focus-visible:outline-primary focus-visible:ring-2 focus-visible:ring-ring`}
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
              <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Subiendo...</p>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center pointer-events-none">
              <div
                className={`size-10 rounded-full ${
                  esta_arrastrando
                    ? "bg-primary/20 text-primary scale-110"
                    : "bg-background text-primary/60"
                } border shadow-sm flex items-center justify-center mb-2 transition-all group-hover:scale-105 group-hover:text-primary`}
              >
                <Plus className="size-4 transition-colors" />
              </div>
              <p className="text-xs font-medium text-foreground">
                {esta_arrastrando ? "Soltar aquí" : "Añadir más"}
              </p>
              {!esta_arrastrando && (
                <div className="mt-2 pointer-events-auto">
                  <PopoverPegarEnlace
                    al_confirmar_enlace={al_confirmar_enlace}
                    deshabilitado={esta_subiendo}
                    tamano="xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
