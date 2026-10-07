import React, { useRef } from "react";
import { StepCard } from "@/components/ui/step-card";
import { subirArchivoAFirebase, esArchivoValido, ALL_ACCEPT_STRING } from "./utils/upload-utils";
import { GrillaMultiUpload, ZonaVaciaMultiUpload } from "./components/multi-upload-grid";

export interface PropiedadesMultiImageUploadSection {
  images: string[];
  onChange: (images: string[]) => void;
  title?: string;
  subtitle?: string;
  description?: string;
  maxImages?: number;
  isStepCompleted?: boolean;
  isNa?: boolean;
  onToggleStep?: () => void;
  onToggleNa?: () => void;
  /** String de tipos aceptados para el input de archivo */
  acceptTypes?: string;
  customBadge?: React.ReactNode;
}

/**
 * Sección de subida de múltiples imágenes/documentos con galería, drag&drop y opción de URL.
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
  acceptTypes,
  customBadge,
}: PropiedadesMultiImageUploadSection) {
  const referenciaInput = useRef<HTMLInputElement>(null);
  const [estaSubiendo, setEstaSubiendo] = React.useState(false);
  const [estaArrastrando, setEstaArrastrando] = React.useState(false);

  const tiposAceptados = acceptTypes || "image/*,application/pdf";

  const procesarArchivos = async (archivos: File[]) => {
    const archivosValidos = archivos.filter((f) => esArchivoValido(f, acceptTypes));
    if (!archivosValidos.length) return;

    const espaciosDisponibles = maxImages - images.length;
    const archivosASubir = archivosValidos.slice(0, espaciosDisponibles);
    if (archivosASubir.length === 0) return;

    try {
      setEstaSubiendo(true);
      const urlsNuevas: string[] = [];

      for (const archivo of archivosASubir) {
        const urlDescarga = await subirArchivoAFirebase(archivo);
        urlsNuevas.push(urlDescarga);
      }

      onChange([...images, ...urlsNuevas]);
    } catch (error) {
      console.error("Error procesando imágenes:", error);
    } finally {
      setEstaSubiendo(false);
      if (referenciaInput.current) referenciaInput.current.value = "";
    }
  };

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    procesarArchivos(Array.from(e.target.files || []));
  };

  const manejarArrastreSobre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!estaSubiendo && images.length < maxImages) setEstaArrastrando(true);
  };

  const manejarSalidaArrastre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEstaArrastrando(false);
  };

  const manejarSoltar = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEstaArrastrando(false);
    if (estaSubiendo || images.length >= maxImages) return;
    procesarArchivos(Array.from(e.dataTransfer.files || []));
  };

  const manejarPegar = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (estaSubiendo || images.length >= maxImages) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const archivosImagenes: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf("image") !== -1) {
        const archivo = item.getAsFile();
        if (archivo) archivosImagenes.push(archivo);
      }
    }
    if (archivosImagenes.length > 0) {
      e.preventDefault();
      procesarArchivos(archivosImagenes);
    }
  };

  const eliminarImagen = (indice: number) => {
    onChange(images.filter((_, i) => i !== indice));
  };

  const propiedadesInteraccion = {
    estaSubiendo,
    estaArrastrando,
    alAbrirSelector: () => referenciaInput.current?.click(),
    alArrastarSobre: manejarArrastreSobre,
    alSalirArrastre: manejarSalidaArrastre,
    alSoltar: manejarSoltar,
    alPegar: manejarPegar,
    alConfirmarEnlace: (url: string) => onChange([...images, url]),
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
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
        ref={referenciaInput}
        onChange={manejarCambioInput}
        accept={tiposAceptados}
        multiple
        className="hidden"
      />

      {images.length === 0 ? (
        <ZonaVaciaMultiUpload limiteMaximo={maxImages} {...propiedadesInteraccion} />
      ) : (
        <GrillaMultiUpload
          urlsImagenes={images}
          limiteMaximo={maxImages}
          alEliminar={eliminarImagen}
          {...propiedadesInteraccion}
        />
      )}
    </StepCard>
  );
}

export { ALL_ACCEPT_STRING };
