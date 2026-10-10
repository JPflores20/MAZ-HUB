import React from "react";
import type { Phase } from "@/data/pdca";
import { useTranslation } from "react-i18next";
import {
  getCustomPhases,
  isPhaseStepsCompleted,
  PILAR_STYLE_MAP,
} from "./stepper/stepper-constants";
import { StepperPhaseItem } from "./stepper/stepper-phase-item";

interface CustomStepperProps {
  current: Phase;
  onSelect: (p: Phase) => void;
  completedPhases: Set<string>;
  onToggleComplete: (p: Phase) => void;
  completedSteps: Set<string>;
  naSteps?: Set<string>;
  isAdmin?: boolean;
}

export function CustomStepper({
  current,
  onSelect,
  completedPhases,
  onToggleComplete,
  completedSteps,
  naSteps,
  isAdmin,
}: CustomStepperProps) {
  const { t } = useTranslation();
  const customPhases = getCustomPhases(!!isAdmin, t);
  const currentIndex = customPhases.findIndex((p) => p.id === current);

  return (
    <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {customPhases.map((phase, i) => {
        const isCurrent = i === currentIndex;
        const isCompleted =
          completedPhases.has(phase.id) || isPhaseStepsCompleted(phase.id, completedSteps, naSteps);

        return (
          <StepperPhaseItem
            key={phase.id}
            phase={phase}
            index={i} // 'Resumen' is index 0. If it's Resumen it's hidden in the item itself
            isCurrent={isCurrent}
            isCompleted={isCompleted}
            onSelect={onSelect}
            onToggleComplete={onToggleComplete}
          />
        );
      })}
    </div>
  );
}

// Re-export for compatibility with other components relying on this map
export { PILAR_STYLE_MAP };
