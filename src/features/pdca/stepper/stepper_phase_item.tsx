/**
 * @fileoverview Elemento individual de fase en la barra de navegación (stepper) del PDCA.
 */
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/class_names";
import type { Phase } from "@/domain/pdca";
import type { CustomPhase } from "./stepper_types";
import {
  obtener_colores_pestana_fase,
  obtener_colores_circulo_fase,
  obtener_subtexto_fase,
  obtener_borde_toggle_fase,
} from "./stepper_styles";

interface PropiedadesStepperPhaseItem {
  phase: CustomPhase;
  index: number;
  isCurrent: boolean;
  isCompleted: boolean;
  onSelect: (fase: Phase) => void;
  onToggleComplete: (fase: Phase) => void;
}

/**
 * Despliega una tarjeta interactiva para cambiar de fase y marcar su cierre global.
 */
export const StepperPhaseItem: React.FC<PropiedadesStepperPhaseItem> = ({
  phase,
  index,
  isCurrent,
  isCompleted,
  onSelect,
  onToggleComplete,
}) => {
  const es_especial = phase.id === "Resumen" || phase.id === "Evaluacion";

  return (
    <div
      onClick={() => onSelect(phase.id as Phase)}
      className={cn(
        "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none",
        obtener_colores_pestana_fase(phase.id, isCurrent),
      )}
    >
      <div
        className={cn(
          "flex flex-1 items-center min-w-0",
          es_especial ? "justify-center text-center" : "gap-2.5",
        )}
      >
        {!es_especial && (
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
              obtener_colores_circulo_fase(phase.id, isCurrent, isCompleted),
            )}
          >
            {index}
          </span>
        )}
        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold uppercase tracking-wide">
            {phase.label}
          </span>
          {phase.sub && (
            <span
              className={cn(
                "hidden truncate text-[11px] sm:block",
                obtener_subtexto_fase(phase.id, isCurrent),
              )}
            >
              {phase.sub}
            </span>
          )}
        </span>
      </div>

      {!es_especial && (
        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            onToggleComplete(phase.id as Phase);
          }}
          title={
            isCompleted ? "Desmarcar fase como completada" : "Marcar fase como completada"
          }
          className={cn(
            "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
            obtener_borde_toggle_fase(phase.id, isCurrent, isCompleted),
          )}
        >
          <Check className="size-3.5" />
        </button>
      )}
    </div>
  );
};
