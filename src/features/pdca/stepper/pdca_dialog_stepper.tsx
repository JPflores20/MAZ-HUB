/**
 * @fileoverview Barra de navegación horizontal por fases (Resumen, Plan, Do, Check, Act, Evaluación R2D2).
 */
import type { Phase } from "@/domain/pdca";
import { useTranslation } from "react-i18next";
import {
  obtener_fases_personalizadas,
  esta_fase_completada,
  PILAR_STYLE_MAP,
} from "./stepper_constants";
import { StepperPhaseItem } from "./stepper_phase_item";

interface PropiedadesCustomStepper {
  current: Phase;
  onSelect: (fase: Phase) => void;
  completedPhases: Set<string>;
  onToggleComplete: (fase: Phase) => void;
  completedSteps: Set<string>;
  naSteps?: Set<string>;
  isAdmin?: boolean;
}

/**
 * Renderiza el selector de fases con seguimiento visual del porcentaje de avance por etapa.
 */
export function CustomStepper({
  current,
  onSelect,
  completedPhases,
  onToggleComplete,
  completedSteps,
  naSteps,
  isAdmin,
}: PropiedadesCustomStepper) {
  const { t: translate } = useTranslation();
  const fases_personalizadas = obtener_fases_personalizadas(Boolean(isAdmin), translate);
  const indice_actual = fases_personalizadas.findIndex(
    (fase_item) => fase_item.id === current,
  );

  return (
    <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {fases_personalizadas.map((fase_item, indice_fase) => {
        const es_actual = indice_fase === indice_actual;
        const esta_completada =
          completedPhases.has(fase_item.id) ||
          esta_fase_completada(fase_item.id, completedSteps, naSteps);

        return (
          <StepperPhaseItem
            key={fase_item.id}
            phase={fase_item}
            index={indice_fase}
            isCurrent={es_actual}
            isCompleted={esta_completada}
            onSelect={onSelect}
            onToggleComplete={onToggleComplete}
          />
        );
      })}
    </div>
  );
}

export { PILAR_STYLE_MAP };
