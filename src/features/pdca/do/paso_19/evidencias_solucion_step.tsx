/**
 * @fileoverview Paso 20 del PDCA: Evidencias fotográficas y PDF asociadas a cada acción del Plan de Acción.
 */
import React from "react";
import { StepCard } from "@/shared/ui/step_card";
import type { ActionItem, EvidenciaSolucionItem } from "@/domain/pdca";
import { StepInstructions } from "../../components/step_instructions";
import { EvidenciaActionCard } from "./evidencia_action_card";

export type MultiEvidenciaSolucionItem = EvidenciaSolucionItem & {
  images?: string[];
};

interface PropiedadesEvidenciasSolucion {
  actions: ActionItem[];
  evidencias: MultiEvidenciaSolucionItem[];
  onEvidenciasChange: (nuevas_evidencias: MultiEvidenciaSolucionItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  hideStepCard?: boolean | undefined;
}

/**
 * Permite adjuntar y visualizar múltiples evidencias antes/después vinculadas a cada acción del plan.
 */
export const EvidenciasSolucionStep: React.FC<PropiedadesEvidenciasSolucion> = ({
  actions,
  evidencias,
  onEvidenciasChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title,
  hideStepCard,
}) => {
  const obtener_imagenes_accion = (accion_id: string): string[] => {
    const encontrado = evidencias.find((registro) => registro.actionId === accion_id);
    if (!encontrado) return [];
    if (Array.isArray(encontrado.images) && encontrado.images.length > 0) {
      return encontrado.images;
    }
    return encontrado.image ? [encontrado.image] : [];
  };

  const agregar_imagenes = (accion_id: string, nuevas_urls: string[]) => {
    if (nuevas_urls.length === 0) return;
    const actualizadas = [...evidencias];
    const indice = actualizadas.findIndex((registro) => registro.actionId === accion_id);
    const combinadas = [...obtener_imagenes_accion(accion_id), ...nuevas_urls];

    if (indice >= 0 && actualizadas[indice]) {
      actualizadas[indice] = {
        ...actualizadas[indice],
        image: combinadas[0] || "",
        images: combinadas,
      };
    } else {
      actualizadas.push({ actionId: accion_id, image: combinadas[0] || "", images: combinadas });
    }
    onEvidenciasChange(actualizadas);
  };

  const eliminar_imagen = (accion_id: string, indice_imagen: number) => {
    const actualizadas = [...evidencias];
    const indice = actualizadas.findIndex((registro) => registro.actionId === accion_id);
    if (indice < 0) return;
    const filtradas = obtener_imagenes_accion(accion_id).filter((_, pos) => pos !== indice_imagen);

    if (filtradas.length === 0) {
      actualizadas.splice(indice, 1);
    } else {
      actualizadas[indice] = {
        actionId: accion_id,
        image: filtradas[0] || "",
        images: filtradas,
      };
    }
    onEvidenciasChange(actualizadas);
  };

  const manejar_seleccion_archivos = async (
    accion_id: string,
    evento: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const lista_archivos = evento.target.files ? Array.from(evento.target.files) : [];
    evento.target.value = "";
    if (lista_archivos.length === 0) return;

    const lecturas = lista_archivos.map(
      (archivo) =>
        new Promise<string>((resolver) => {
          const lector = new FileReader();
          lector.onload = (evento_carga) =>
            resolver(typeof evento_carga.target?.result === "string" ? evento_carga.target.result : "");
          lector.onerror = () => resolver("");
          lector.readAsDataURL(archivo);
        }),
    );

    const resultados = (await Promise.all(lecturas)).filter(Boolean);
    agregar_imagenes(accion_id, resultados);
  };

  const contenido_tarjetas = (
    <div className={hideStepCard ? "" : "mt-4 space-y-8"}>
      <div className="space-y-4">
        {title && <h4 className="text-sm font-bold text-slate-700 uppercase">{title}</h4>}
        {actions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No hay acciones definidas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((accion, indice_accion) => (
              <EvidenciaActionCard
                key={accion.id}
                accion={accion}
                indice_accion={indice_accion}
                urls_evidencia={obtener_imagenes_accion(accion.id)}
                al_subir_archivos={manejar_seleccion_archivos}
                al_eliminar_imagen={eliminar_imagen}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (hideStepCard) return contenido_tarjetas;

  return (
    <StepCard
      title={title || "PASO 20: EVIDENCIA DE SOLUCIONES"}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        Por cada acción del plan, adjunta una o varias fotos o PDFs como evidencia.
      </StepInstructions>
      {contenido_tarjetas}
    </StepCard>
  );
};
