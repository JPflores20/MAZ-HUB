import React, { useRef, useState } from "react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { GEMBA_MAX_ARCHIVOS, subirImagenAFirebase } from "./utils/gemba-image-utils";
import { MiniaturaEvidenciaGemba } from "./components/gemba-image-thumbnail";
import { GaleriaEvidenciasGemba } from "./components/gemba-gallery";
import { ZonaCargaGemba } from "./components/gemba-drop-zone";
import { LightboxEvidenciaGemba } from "./components/gemba-lightbox";

interface PropiedadesGembaEvidencias {
  images: string[];
  onChange: (images: string[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean;
  onToggleStep?: () => void;
  onToggleNa?: () => void;
  title?: string;
  description?: string;
}

/**
 * Paso 9: GEMBA (Evidencias)
 * Permite subir, visualizar y eliminar fotos de evidencia del gemba.
 * Modularizado en: galería, miniatura, zona de carga y lightbox.
 */
export function GembaEvidenciasStep({
  images,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title = "PASO 9: GEMBA (EVIDENCIAS)",
  description = "Sube fotos del Gemba o documentos que respalden que el plan de acción se ejecutó correctamente.",
}: PropiedadesGembaEvidencias) {
  const referenciaInputArchivo = useRef<HTMLInputElement>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [cantidadSubiendo, setCantidadSubiendo] = useState(0);
  const [urlImagenLightbox, setUrlImagenLightbox] = useState<string | null>(null);

  const puedeAgregarMas = images.length < GEMBA_MAX_ARCHIVOS;

  /** Procesa un array de archivos: sube los que sean imágenes y quepan en el límite */
  const procesarArchivos = async (archivos: FileList | File[]) => {
    const soloImagenes = Array.from(archivos).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    const espaciosDisponibles = GEMBA_MAX_ARCHIVOS - images.length;
    const archivosASubir = soloImagenes.slice(0, espaciosDisponibles);

    if (archivosASubir.length === 0) return;

    setCantidadSubiendo((prev) => prev + archivosASubir.length);
    const urlsNuevas: string[] = [];

    await Promise.all(
      archivosASubir.map(async (archivo) => {
        try {
          const urlPublica = await subirImagenAFirebase(archivo);
          urlsNuevas.push(urlPublica);
        } catch (error) {
          console.error("Error subiendo evidencia Gemba:", error);
        } finally {
          setCantidadSubiendo((prev) => prev - 1);
        }
      }),
    );

    onChange([...images, ...urlsNuevas]);
    if (referenciaInputArchivo.current) referenciaInputArchivo.current.value = "";
  };

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) procesarArchivos(e.target.files);
  };

  const manejarArrastreSobre = (e: React.DragEvent) => {
    e.preventDefault();
    if (puedeAgregarMas) setEstaArrastrando(true);
  };

  const manejarSalidaArrastre = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
  };

  const manejarSoltarArchivos = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
    if (e.dataTransfer.files) procesarArchivos(e.dataTransfer.files);
  };

  const eliminarImagen = (indice: number) => {
    onChange(images.filter((_, i) => i !== indice));
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        <span className="text-xs text-muted-foreground font-medium">
          {images.length} de {GEMBA_MAX_ARCHIVOS}
        </span>
      }
    >
      <StepInstructions>
        <p className="text-muted-foreground text-xs">{description}</p>
      </StepInstructions>

      <div className="mt-4 space-y-4">
        <GaleriaEvidenciasGemba
          urlsImagenes={images}
          cantidadSubiendo={cantidadSubiendo}
          alVerEnGrande={setUrlImagenLightbox}
          alEliminar={eliminarImagen}
          ComponenteMiniatura={MiniaturaEvidenciaGemba}
        />

        <ZonaCargaGemba
          puedeAgregarMas={puedeAgregarMas}
          estaArrastrando={estaArrastrando}
          cantidadImagenesActual={images.length}
          cantidadSubiendo={cantidadSubiendo}
          alArrastarSobre={manejarArrastreSobre}
          alSalirDelArrastre={manejarSalidaArrastre}
          alSoltarArchivos={manejarSoltarArchivos}
          alHacerClic={() => referenciaInputArchivo.current?.click()}
        />

        <input
          ref={referenciaInputArchivo}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={manejarCambioInput}
        />
      </div>

      <LightboxEvidenciaGemba
        urlImagenActiva={urlImagenLightbox}
        alCerrar={() => setUrlImagenLightbox(null)}
      />
    </StepCard>
  );
}
