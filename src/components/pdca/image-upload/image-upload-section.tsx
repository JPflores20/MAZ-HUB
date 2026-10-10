import React, { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
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
import { VisorImagenConZoom } from "./components/image-zoom-viewer";
import { ZonaCargaImagenSimple } from "./components/single-upload-drop-zone";
import { subirArchivoAFirebase } from "./utils/upload-utils";

export interface PropiedadesImageUploadSection {
  image: string | null;
  onChange?: ((base64: string | null) => void) | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  description?: string | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  hideCard?: boolean | undefined;
  customBadge?: React.ReactNode;
}

/**
 * Sección de subida de una sola imagen con drag&drop, lightbox con zoom y opción de URL.
 */
export function ImageUploadSection({
  image,
  onChange,
  title = "Imagen Adjunta",
  subtitle = "Sube tu imagen",
  description = "Adjunta una foto o imagen (se comprimirá y guardará automáticamente).",
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  hideCard = false,
  customBadge,
}: PropiedadesImageUploadSection) {
  const referenciaInput = useRef<HTMLInputElement>(null);
  const [estaSubiendo, setEstaSubiendo] = React.useState(false);
  const [estaArrastrando, setEstaArrastrando] = React.useState(false);

  const procesarArchivo = async (archivo: File) => {
    if (!archivo.type.startsWith("image/") && archivo.type !== "application/pdf") return;
    try {
      setEstaSubiendo(true);
      const urlDescarga = await subirArchivoAFirebase(archivo);
      onChange?.(urlDescarga);
    } catch (error) {
      console.error("Error procesando imagen:", error);
    } finally {
      setEstaSubiendo(false);
      if (referenciaInput.current) referenciaInput.current.value = "";
    }
  };

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) procesarArchivo(archivo);
  };

  const manejarArrastreSobre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!image && !estaSubiendo) setEstaArrastrando(true);
  };

  const manejarSalidaArrastre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEstaArrastrando(false);
  };

  const manejarSoltar = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEstaArrastrando(false);
    if (image || estaSubiendo) return;
    const archivo = e.dataTransfer.files?.[0];
    if (archivo) procesarArchivo(archivo);
  };

  const contenidoInterno = (
    <>
      {image ? (
        <div className="w-full flex justify-center mt-2">
          <div className="relative inline-block group">
            {image.startsWith("data:application/pdf") || image.toLowerCase().includes(".pdf") ? (
              <div className="flex flex-col items-center justify-center w-64 h-64 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-md border shadow-sm">
                <FileText className="size-16 mb-2" />
                <span className="text-sm font-semibold">Documento PDF</span>
                <a
                  href={image}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline hover:text-blue-800 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Abrir PDF
                </a>
              </div>
            ) : (
              <VisorImagenConZoom urlImagen={image} textoAlternativo={title}>
                <DialogTrigger asChild>
                  <img
                    src={image}
                    alt={title}
                    className="max-h-[500px] object-contain rounded-md border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
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
                  className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 shadow-md"
                  title="Eliminar imagen"
                >
                  <X className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede
                    deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onChange?.(null)}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <ZonaCargaImagenSimple
          tieneImagen={!!image}
          estaSubiendo={estaSubiendo}
          estaArrastrando={estaArrastrando}
          subtitulo={subtitle}
          descripcion={description}
          alArrastarSobre={manejarArrastreSobre}
          alSalirArrastre={manejarSalidaArrastre}
          alSoltar={manejarSoltar}
          alSeleccionarArchivo={() => referenciaInput.current?.click()}
          alConfirmarEnlace={(url) => onChange?.(url)}
        />
      )}

      <input
        type="file"
        ref={referenciaInput}
        onChange={manejarCambioInput}
        accept="image/*,application/pdf"
        className="hidden"
      />
    </>
  );

  if (hideCard) return contenidoInterno;

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={customBadge}
    >
      {contenidoInterno}
    </StepCard>
  );
}
