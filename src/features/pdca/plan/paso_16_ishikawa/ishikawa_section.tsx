/**
 * @fileoverview Paso 16 del PDCA: Sección contenedora de uno o múltiples diagramas de Ishikawa.
 */
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StepCard } from "@/shared/ui/step_card";
import type { IshikawaItem } from "@/domain/pdca";
import { StepInstructions } from "../../components/step_instructions";
import { IshikawaInteractivo } from "./ishikawa_interactive";
import type { CausaPriorizacionIshikawa } from "./ishikawa_prioritization_row";

interface PropiedadesSeccionIshikawa {
  ishikawas: IshikawaItem[];
  onChange: (nuevos_registros: IshikawaItem[]) => void;
  onSendToFiveWhys?: ((causas_priorizadas_texto: string[]) => void) | undefined;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite gestionar múltiples diagramas de Ishikawa 6M e impulsar sus causas priorizadas hacia 5 Porqués.
 */
export function IshikawaSection({
  ishikawas: lista_ishikawas,
  onChange: al_cambiar_registros,
  onSendToFiveWhys,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: PropiedadesSeccionIshikawa) {
  const { t: translate } = useTranslation();

  const crear_nuevo_ishikawa = () => {
    al_cambiar_registros([
      ...lista_ishikawas,
      {
        id: `ishikawa-${Date.now()}`,
        effect: "Efecto / Problema",
        causes: {
          machine: [],
          method: [],
          material: [],
          manpower: [],
          measurement: [],
          environment: [],
        },
        prioritization: [],
      },
    ]);
  };

  const eliminar_ishikawa = (diagrama_id: string) => {
    if (lista_ishikawas.length <= 1) return;
    al_cambiar_registros(
      lista_ishikawas.filter((diagrama_actual) => diagrama_actual.id !== diagrama_id),
    );
  };

  const actualizar_atributo_ishikawa = (
    diagrama_id: string,
    campo: keyof IshikawaItem,
    nuevo_valor: unknown,
  ) => {
    al_cambiar_registros(
      lista_ishikawas.map((diagrama_actual) =>
        diagrama_actual.id === diagrama_id
          ? { ...diagrama_actual, [campo]: nuevo_valor }
          : diagrama_actual,
      ),
    );
  };

  return (
    <StepCard
      className="space-y-6"
      title="PASO 16: FISHBONE"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          {translate("pdcaPlan.paso16_ishikawa_section_working_on_files")}
        </span>
      </div>

      <StepInstructions>
        <p className="mb-2">
          1. Define el tema específico a analizar como &quot;cabeza del pez&quot; (el PI o aspecto
          enfocado del problema).
        </p>
        <p className="mb-2">
          2. Reúne al equipo y registra las causas potenciales en cada una de las categorías 6M.
        </p>
        <p className="mb-2">
          3. Utiliza la Espina de Pescado como herramienta de lluvia de ideas antes de validar.
        </p>
        <p className="mb-2">
          4. Para añadir causas escribe dentro de cada categoría y presiona Enter.
        </p>
        <p>
          5. Introduce las causas relevantes en la matriz de prioridades para confirmar si contribuyen
          al problema.
        </p>
      </StepInstructions>

      <div className="space-y-12">
        {lista_ishikawas.map((diagrama_actual, indice_diagrama) => (
          <div key={diagrama_actual.id} className="relative group/ishikawa">
            <IshikawaInteractivo
              causasRegistradas={diagrama_actual.causes}
              alCambiarCausas={(causas_estado) =>
                actualizar_atributo_ishikawa(
                  diagrama_actual.id,
                  "causes",
                  typeof causas_estado === "function"
                    ? causas_estado(diagrama_actual.causes)
                    : causas_estado,
                )
              }
              efectoPrincipal={diagrama_actual.effect}
              alCambiarEfecto={(nuevo_efecto) =>
                actualizar_atributo_ishikawa(diagrama_actual.id, "effect", nuevo_efecto)
              }
              causasPriorizadas={
                diagrama_actual.prioritization as CausaPriorizacionIshikawa[] | undefined
              }
              alCambiarCausasPriorizadas={(causas_priorizadas) =>
                actualizar_atributo_ishikawa(
                  diagrama_actual.id,
                  "prioritization",
                  causas_priorizadas,
                )
              }
              alEnviarA5Porques={onSendToFiveWhys}
              etiquetasPersonalizadas={diagrama_actual.customLabels || {}}
              alCambiarEtiquetas={(etiquetas_estado) =>
                actualizar_atributo_ishikawa(
                  diagrama_actual.id,
                  "customLabels",
                  typeof etiquetas_estado === "function"
                    ? etiquetas_estado(diagrama_actual.customLabels || {})
                    : etiquetas_estado,
                )
              }
              sufijoTitulo={lista_ishikawas.length > 1 ? ` ${indice_diagrama + 1}` : ""}
              tituloPersonalizado={diagrama_actual.title}
              alCambiarTitulo={(titulo_modificado) =>
                actualizar_atributo_ishikawa(diagrama_actual.id, "title", titulo_modificado)
              }
              alEliminarIshikawa={
                lista_ishikawas.length > 1
                  ? () => eliminar_ishikawa(diagrama_actual.id)
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-border/60 pt-6">
        <Button
          onClick={crear_nuevo_ishikawa}
          variant="outline"
          className="gap-2 shadow-sm bg-card hover:bg-card/80"
        >
          <Plus className="size-4" />
          {translate("pdcaPlan.paso16_ishikawa_section_add_another")}
        </Button>
      </div>
    </StepCard>
  );
}
