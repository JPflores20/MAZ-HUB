/**
 * @fileoverview Sección reutilizable para carga, previsualización y borrado de una sola imagen o PDF.
 */
import React, { useRef, useState } from "react";
import { X, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StepCard } from "@/shared/ui/step_card";
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
import { sanitize_external_url } from "@/core/security";
import { VisorImagenConZoom } from "./image_zoom_viewer";
import { ZonaCargaImagenSimple } from "./single_upload_drop_zone";
import { subir_archivo_a_firebase } from "./upload_utils";

export interface PropiedadesImageUploadSection {
  image: string | null;
  onChange?: ((url_archivo: string | null) => void) | undefined;
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
 * Permite subir una imagen o documento PDF con drag&drop, compresión y visor a pantalla completa.
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
  const referencia_input = useRef<HTMLInputElement>(null);
  const [esta_subiendo, set_esta_subiendo] = useState(false);
  const [esta_arrastrando, set_esta_arrastrando] = useState(false);

  const procesar_archivo = async (archivo: File) => {
    if (!archivo.type.startsWith("image/") && archivo.type !== "application/pdf") return;
    try {
      set_esta_subiendo(true);
      const url_descarga = await subir_archivo_a_firebase(archivo);
      onChange?.(url_descarga);
    } catch (error_subida) {
      console.error("Error procesando imagen:", error_subida);
    } finally {
      set_esta_subiendo(false);
      if (referencia_input.current) referencia_input.current.value = "";
    }
  };

  const manejar_cambio_input = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) void procesar_archivo(archivo);
  };

  const manejar_soltar = (evento: React.DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    set_esta_arrastrando(false);
    if (image || esta_subiendo) return;
    const archivo = evento.dataTransfer.files?.[0];
    if (archivo) void procesar_archivo(archivo);
  };

  const url_imagen_segura = sanitize_external_url(image, { allowDataMedia: true });
  const es_pdf = Boolean(
    url_imagen_segura &&
      (url_imagen_segura.startsWith("data:application/pdf") ||
        url_imagen_segura.toLowerCase().includes(".pdf")),
  );

  const contenido_interno = (
    <>
      {url_imagen_segura ? (
        <div className="w-full flex justify-center mt-2">
          <div className="relative inline-block group">
            {es_pdf ? (
              <div className="flex flex-col items-center justify-center w-64 h-64 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-md border shadow-sm">
                <FileText className="size-16 mb-2" />
                <span className="text-sm font-semibold">Documento PDF</span>
                <a
                  href={url_imagen_segura}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:text-blue-800 mt-2"
                  onClick={(evento) => evento.stopPropagation()}
                >
                  Abrir PDF
                </a>
              </div>
            ) : (
              <VisorImagenConZoom url_imagen={url_imagen_segura} texto_alternativo={title}>
                <DialogTrigger asChild>
                  <img
                    src={url_imagen_segura}
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
          tiene_imagen={Boolean(image)}
          esta_subiendo={esta_subiendo}
          esta_arrastrando={esta_arrastrando}
          subtitulo={subtitle}
          descripcion={description}
          al_arrastrar_sobre={(evento) => {
            evento.preventDefault();
            if (!image && !esta_subiendo) set_esta_arrastrando(true);
          }}
          al_salir_arrastre={(evento) => {
            evento.preventDefault();
            set_esta_arrastrando(false);
          }}
          al_soltar={manejar_soltar}
          al_seleccionar_archivo={() => referencia_input.current?.click()}
          al_confirmar_enlace={(url_segura) => onChange?.(url_segura)}
        />
      )}

      <input
        type="file"
        ref={referencia_input}
        onChange={manejar_cambio_input}
        accept="image/*,application/pdf"
        className="hidden"
      />
    </>
  );

  if (hideCard) return contenido_interno;

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={customBadge}
    >
      {contenido_interno}
    </StepCard>
  );
}
