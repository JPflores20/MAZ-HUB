/**
 * @fileoverview Sección para cargar, previsualizar y gestionar múltiples imágenes o documentos de evidencia.
 */
import React, { useRef, useState } from "react";
import { StepCard } from "@/shared/ui/step_card";
import {
  subir_archivo_a_firebase,
  es_archivo_valido,
  ALL_ACCEPT_STRING,
} from "./upload_utils";
import { GrillaMultiUpload } from "./multi_upload_grid";
import { ZonaVaciaMultiUpload } from "./multi_upload_empty_zone";

export interface PropiedadesMultiImageUploadSection {
  images: string[];
  onChange?: ((imagenes_actualizadas: string[]) => void) | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  description?: string | undefined;
  maxImages?: number | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  defaultExpanded?: boolean | undefined;
  acceptTypes?: string | undefined;
  customBadge?: React.ReactNode;
}

/**
 * Permite subir hasta un límite configurable de archivos o enlaces de evidencia mediante galería interactiva.
 */
export function MultiImageUploadSection({
  images = [],
  onChange,
  title = "Imágenes Adjuntas",
  subtitle = "Sube tus imágenes",
  description = "Adjunta fotos o imágenes (se comprimirán y guardarán automáticamente).",
  maxImages = 6,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  defaultExpanded,
  acceptTypes,
  customBadge,
}: PropiedadesMultiImageUploadSection) {
  const referencia_input = useRef<HTMLInputElement>(null);
  const [esta_subiendo, set_esta_subiendo] = useState(false);
  const [esta_arrastrando, set_esta_arrastrando] = useState(false);

  const tipos_aceptados = acceptTypes || "image/*,application/pdf";

  const procesar_archivos = async (archivos: File[]) => {
    const archivos_validos = archivos.filter((archivo) =>
      es_archivo_valido(archivo, acceptTypes),
    );
    if (archivos_validos.length === 0) return;

    const espacios_disponibles = maxImages - images.length;
    const archivos_a_subir = archivos_validos.slice(0, espacios_disponibles);
    if (archivos_a_subir.length === 0) return;

    try {
      set_esta_subiendo(true);
      const urls_nuevas: string[] = [];

      for (const archivo of archivos_a_subir) {
        const url_descarga = await subir_archivo_a_firebase(archivo);
        urls_nuevas.push(url_descarga);
      }

      onChange?.([...images, ...urls_nuevas]);
    } catch (error_subida) {
      console.error("Error procesando imágenes:", error_subida);
    } finally {
      set_esta_subiendo(false);
      if (referencia_input.current) referencia_input.current.value = "";
    }
  };

  const manejar_pegar = (evento: React.ClipboardEvent<HTMLDivElement>) => {
    if (esta_subiendo || images.length >= maxImages) return;
    const elementos_portapapeles = evento.clipboardData?.items;
    if (!elementos_portapapeles) return;

    const archivos_imagenes: File[] = [];
    for (let indice_clip = 0; indice_clip < elementos_portapapeles.length; indice_clip += 1) {
      const elemento_clip = elementos_portapapeles[indice_clip];
      if (elemento_clip && elemento_clip.type.includes("image")) {
        const archivo_imagen = elemento_clip.getAsFile();
        if (archivo_imagen) archivos_imagenes.push(archivo_imagen);
      }
    }

    if (archivos_imagenes.length > 0) {
      evento.preventDefault();
      void procesar_archivos(archivos_imagenes);
    }
  };

  const eliminar_imagen = (indice_a_eliminar: number) => {
    onChange?.(images.filter((_url, indice_actual) => indice_actual !== indice_a_eliminar));
  };

  const propiedades_interaccion = {
    esta_subiendo,
    esta_arrastrando,
    al_abrir_selector: () => referencia_input.current?.click(),
    al_arrastrar_sobre: (evento: React.DragEvent<HTMLDivElement>) => {
      evento.preventDefault();
      if (!esta_subiendo && images.length < maxImages) set_esta_arrastrando(true);
    },
    al_salir_arrastre: (evento: React.DragEvent<HTMLDivElement>) => {
      evento.preventDefault();
      set_esta_arrastrando(false);
    },
    al_soltar: (evento: React.DragEvent<HTMLDivElement>) => {
      evento.preventDefault();
      set_esta_arrastrando(false);
      if (esta_subiendo || images.length >= maxImages) return;
      void procesar_archivos(Array.from(evento.dataTransfer.files || []));
    },
    al_pegar: manejar_pegar,
    al_confirmar_enlace: (url_segura: string) => onChange?.([...images, url_segura]),
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      defaultExpanded={defaultExpanded}
      onToggleNa={onToggleNa}
      headerRight={
        <div className="flex items-center gap-2 mr-2">
          {customBadge}
          <span className="text-xs normal-case font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
            {images.length} de {maxImages}
          </span>
        </div>
      }
    >
      {(subtitle || description) && (
        <div className="mb-4">
          {subtitle && <p className="text-sm font-semibold text-foreground">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <input
        type="file"
        ref={referencia_input}
        onChange={(evento) => void procesar_archivos(Array.from(evento.target.files || []))}
        accept={tipos_aceptados}
        multiple
        className="hidden"
      />

      {images.length === 0 ? (
        <ZonaVaciaMultiUpload limite_maximo={maxImages} {...propiedades_interaccion} />
      ) : (
        <GrillaMultiUpload
          urls_imagenes={images}
          limite_maximo={maxImages}
          al_eliminar={eliminar_imagen}
          {...propiedades_interaccion}
        />
      )}
    </StepCard>
  );
}

export { ALL_ACCEPT_STRING };
