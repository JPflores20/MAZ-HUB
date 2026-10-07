import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/data/pdca";
import type { CustomPhase } from "./stepper-types";
import {
  getPhaseTabColors,
  getPhaseCircleColors,
  getPhaseSubText,
  getPhaseToggleBorder,
} from "./stepper-styles";

interface Props {
  phase: CustomPhase;
  index: number;
  isCurrent: boolean;
  isCompleted: boolean;
  onSelect: (p: Phase) => void;
  onToggleComplete: (p: Phase) => void;
}

export const StepperPhaseItem: React.FC<Props> = ({
  phase,
  index,
  isCurrent,
  isCompleted,
  onSelect,
  onToggleComplete,
}) => {
  return (
    <div
      onClick={() => onSelect(phase.id as Phase)}
      className={cn(
        "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none",
        getPhaseTabColors(phase.id, isCurrent)
      )}
    >
      <div className={cn("flex flex-1 items-center min-w-0", (phase.id === "Resumen" || phase.id === "Evaluacion") ? "justify-center text-center" : "gap-2.5")}>
        {phase.id !== "Resumen" && phase.id !== "Evaluacion" && (
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
              getPhaseCircleColors(phase.id, isCurrent, isCompleted)
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
                getPhaseSubText(phase.id, isCurrent)
              )}
            >
              {phase.sub}
            </span>
          )}
        </span>
      </div>
      {/* Toggle complete button */}
      {phase.id !== "Resumen" && phase.id !== "Evaluacion" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(phase.id as Phase);
          }}
          title={isCompleted ? "Desmarcar fase como completada" : "Marcar fase como completada"}
          className={cn(
            "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
            getPhaseToggleBorder(phase.id, isCurrent, isCompleted)
          )}
        >
          <Check className="size-3.5" />
        </button>
      )}
    </div>
  );
};
