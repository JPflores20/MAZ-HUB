/**
 * @fileoverview Paso Gemba Walk del PDCA: gestión integral de evidencias fotográficas en piso.
 */
import React, { useRef, useState } from "react";
import { StepCard } from "@/shared/ui/step_card";
import { StepInstructions } from "../../components/step_instructions";
import { GEMBA_MAX_ARCHIVOS, subir_imagen_gemba } from "./gemba_image_utils";
import { MiniaturaEvidenciaGemba } from "./gemba_image_thumbnail";
import { GaleriaEvidenciasGemba } from "./gemba_gallery";
import { ZonaCargaGemba } from "./gemba_drop_zone";
import { LightboxEvidenciaGemba } from "./gemba_lightbox";

interface PropiedadesGembaEvidencias {
  images: string[];
  onChange: (nuevas_urls: string[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  description?: string | undefined;
}

/**
 * Orquesta subida, galería de miniaturas y visor lightbox de evidencias Gemba.
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
  const referencia_input_archivo = useRef<HTMLInputElement>(null);
  const [esta_arrastrando, set_esta_arrastrando] = useState(false);
  const [cantidad_subiendo, set_cantidad_subiendo] = useState(0);
  const [url_imagen_lightbox, set_url_imagen_lightbox] = useState<string | null>(null);

  const puede_agregar_mas = images.length < GEMBA_MAX_ARCHIVOS;

  const procesar_archivos = async (archivos: FileList | File[]) => {
    const validos = Array.from(archivos).filter(
      (archivo) => archivo.type.startsWith("image/") || archivo.type === "application/pdf",
    );
    const espacios_disponibles = GEMBA_MAX_ARCHIVOS - images.length;
    const archivos_a_subir = validos.slice(0, espacios_disponibles);
    if (archivos_a_subir.length === 0) return;

    set_cantidad_subiendo((previo) => previo + archivos_a_subir.length);
    const urls_nuevas: string[] = [];

    await Promise.all(
      archivos_a_subir.map(async (archivo) => {
        try {
          const url_publica = await subir_imagen_gemba(archivo);
          urls_nuevas.push(url_publica);
        } catch (error_subida) {
          console.error("Error subiendo evidencia Gemba:", error_subida);
        } finally {
          set_cantidad_subiendo((previo) => previo - 1);
        }
      }),
    );

    onChange([...images, ...urls_nuevas]);
    if (referencia_input_archivo.current) referencia_input_archivo.current.value = "";
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
          urls_imagenes={images}
          cantidad_subiendo={cantidad_subiendo}
          al_ver_en_grande={set_url_imagen_lightbox}
          al_eliminar={(indice) => onChange(images.filter((_, pos) => pos !== indice))}
          ComponenteMiniatura={MiniaturaEvidenciaGemba}
        />

        <ZonaCargaGemba
          puede_agregar_mas={puede_agregar_mas}
          esta_arrastrando={esta_arrastrando}
          cantidad_imagenes_actual={images.length}
          cantidad_subiendo={cantidad_subiendo}
          al_arrastrar_sobre={(evento) => {
            evento.preventDefault();
            if (puede_agregar_mas) set_esta_arrastrando(true);
          }}
          al_salir_del_arrastre={(evento) => {
            evento.preventDefault();
            set_esta_arrastrando(false);
          }}
          al_soltar_archivos={(evento) => {
            evento.preventDefault();
            set_esta_arrastrando(false);
            if (evento.dataTransfer.files) procesar_archivos(evento.dataTransfer.files);
          }}
          al_hacer_clic={() => referencia_input_archivo.current?.click()}
        />

        <input
          ref={referencia_input_archivo}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(evento) => {
            if (evento.target.files) procesar_archivos(evento.target.files);
          }}
        />
      </div>

      <LightboxEvidenciaGemba
        url_imagen_activa={url_imagen_lightbox}
        al_cerrar={() => set_url_imagen_lightbox(null)}
      />
    </StepCard>
  );
}
