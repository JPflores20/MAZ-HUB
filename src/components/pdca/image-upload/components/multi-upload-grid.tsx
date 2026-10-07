import React from "react";
import { X, Plus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { VisorImagenConZoom } from "./image-zoom-viewer";
import { IconoTipoArchivo } from "./file-type-icon";
import { PopoverPegarEnlace } from "./url-link-popover";
import { detectarTipoDeArchivo } from "../utils/upload-utils";

interface PropiedadesGrillaMultiUpload {
  urlsImagenes: string[];
  limiteMaximo: number;
  estaSubiendo: boolean;
  estaArrastrando: boolean;
  alEliminar: (indice: number) => void;
  alAbrirSelector: () => void;
  alArrastarSobre: (e: React.DragEvent<HTMLDivElement>) => void;
  alSalirArrastre: (e: React.DragEvent<HTMLDivElement>) => void;
  alSoltar: (e: React.DragEvent<HTMLDivElement>) => void;
  alPegar: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  alConfirmarEnlace: (url: string) => void;
}

/**
 * Grilla de miniaturas para el componente MultiImageUploadSection.
 * Incluye la celda de "Añadir más" al final si no se ha alcanzado el límite.
 */
export const GrillaMultiUpload: React.FC<PropiedadesGrillaMultiUpload> = ({
  urlsImagenes,
  limiteMaximo,
  estaSubiendo,
  estaArrastrando,
  alEliminar,
  alAbrirSelector,
  alArrastarSobre,
  alSalirArrastre,
  alSoltar,
  alPegar,
  alConfirmarEnlace,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {urlsImagenes.map((urlImagen, indice) => {
        const infoArchivo = detectarTipoDeArchivo(urlImagen);
        return (
          <div
            key={indice}
            className="relative aspect-video rounded-xl overflow-hidden border bg-black/5 group shadow-sm"
          >
            {infoArchivo.tipo !== "image" ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => window.open(urlImagen, "_blank")}
                title={`Clic para abrir ${infoArchivo.etiqueta} en nueva pestaña`}
              >
                <IconoTipoArchivo tipoArchivo={infoArchivo.tipo} className="size-12 mb-2" />
                <span className="text-xs font-semibold text-foreground">{infoArchivo.etiqueta}</span>
              </div>
            ) : (
              <VisorImagenConZoom
                urlImagen={urlImagen}
                textoAlternativo={`Evidencia ${indice + 1}`}
              >
                <DialogTrigger asChild>
                  <img
                    src={urlImagen}
                    alt={`Evidencia ${indice + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    title="Clic para ver imagen completa"
                  />
                </DialogTrigger>
              </VisorImagenConZoom>
            )}

            {/* Botón de eliminar */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full h-7 w-7 shadow-md scale-90 hover:scale-100"
                  title="Eliminar imagen"
                >
                  <X className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar esta imagen de evidencia? Esta acción no
                    se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => alEliminar(indice)}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}

      {/* Celda "Añadir más" */}
      {urlsImagenes.length < limiteMaximo && (
        <div
          className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed ${
            estaArrastrando
              ? "border-primary bg-primary/10"
              : "border-border/60 bg-secondary/10 hover:bg-secondary/30"
          } transition-all flex flex-col items-center justify-center p-4 cursor-pointer group focus-visible:outline-primary focus-visible:ring-2 focus-visible:ring-ring`}
          tabIndex={0}
          onClick={alAbrirSelector}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") alAbrirSelector();
          }}
          onDragOver={alArrastarSobre}
          onDragLeave={alSalirArrastre}
          onDrop={alSoltar}
          onPaste={alPegar}
        >
          {estaSubiendo ? (
            <div className="text-center">
              <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Subiendo...</p>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center pointer-events-none">
              <div
                className={`size-10 rounded-full ${
                  estaArrastrando
                    ? "bg-primary/20 text-primary scale-110"
                    : "bg-background text-primary/60"
                } border shadow-sm flex items-center justify-center mb-2 transition-all group-hover:scale-105 group-hover:text-primary`}
              >
                <Plus className="size-4 transition-colors" />
              </div>
              <p className="text-xs font-medium text-foreground">
                {estaArrastrando ? "Soltar aquí" : "Añadir más"}
              </p>
              {!estaArrastrando && (
                <div className="mt-2 pointer-events-auto">
                  <PopoverPegarEnlace
                    alConfirmarEnlace={alConfirmarEnlace}
                    deshabilitado={estaSubiendo}
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

interface PropiedadesZonaVaciaMulti {
  estaSubiendo: boolean;
  estaArrastrando: boolean;
  limiteMaximo: number;
  alAbrirSelector: () => void;
  alArrastarSobre: (e: React.DragEvent<HTMLDivElement>) => void;
  alSalirArrastre: (e: React.DragEvent<HTMLDivElement>) => void;
  alSoltar: (e: React.DragEvent<HTMLDivElement>) => void;
  alPegar: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  alConfirmarEnlace: (url: string) => void;
}

/**
 * Zona vacía inicial de arrastre para MultiImageUploadSection (cuando no hay imágenes aún).
 */
export const ZonaVaciaMultiUpload: React.FC<PropiedadesZonaVaciaMulti> = ({
  estaSubiendo,
  estaArrastrando,
  limiteMaximo,
  alAbrirSelector,
  alArrastarSobre,
  alSalirArrastre,
  alSoltar,
  alPegar,
  alConfirmarEnlace,
}) => {
  return (
    <div
      className={`relative rounded-xl border-2 border-dashed ${
        estaArrastrando
          ? "border-primary bg-primary/10"
          : "border-border/60 bg-secondary/10 hover:bg-secondary/30"
      } transition-all flex flex-col items-center justify-center p-10 min-h-[200px] cursor-pointer group focus-visible:outline-primary focus-visible:ring-2 focus-visible:ring-ring`}
      tabIndex={0}
      onClick={alAbrirSelector}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") alAbrirSelector();
      }}
      onDragOver={alArrastarSobre}
      onDragLeave={alSalirArrastre}
      onDrop={alSoltar}
      onPaste={alPegar}
    >
      {estaSubiendo ? (
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-foreground">Subiendo imágenes...</p>
          <p className="text-xs text-muted-foreground mt-1">Por favor espera</p>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center pointer-events-none">
          <div
            className={`size-14 rounded-full ${
              estaArrastrando
                ? "bg-primary/20 text-primary scale-110"
                : "bg-background text-primary/60"
            } border shadow-sm flex items-center justify-center mb-4 transition-all group-hover:scale-105 group-hover:border-primary/40 group-hover:text-primary`}
          >
            <UploadCloud className="size-6 transition-colors" />
          </div>
          <h4 className="font-semibold text-foreground">
            {estaArrastrando ? "Suelta las imágenes aquí" : "No hay evidencias"}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
            {estaArrastrando
              ? "Se subirán y comprimirán automáticamente."
              : `Haz clic aquí o arrastra para adjuntar tus fotos o capturas (hasta ${limiteMaximo}).`}
          </p>
          {!estaArrastrando && (
            <div className="flex justify-center gap-2 mt-4 pointer-events-auto">
              <PopoverPegarEnlace
                alConfirmarEnlace={alConfirmarEnlace}
                deshabilitado={estaSubiendo}
                tamano="sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
