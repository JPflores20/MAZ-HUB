import React from "react";
import type { Rda } from "@/data/rda";
import { RdaValidationTable } from "./RdaValidationTable";
import { RdaEvidenceTab } from "./RdaEvidenceTab";
import { RdaChecklistEstandarizacion } from "./RdaChecklistEstandarizacion";
import { ActionPlanTable } from "@/components/pdca/2.DO/paso18/action-plan-table";
import { StepCard } from "@/components/ui/step-card";

// Pasos de la fase 3 posteriores al Análisis Estadístico:
// 9. Plan de Validación
// 10. Evidencias de Validación
// 11. Checklist de Estandarización y Gestión del Conocimiento
// 12. PDA (Prevención de Recurrencia) = paso 18 del PDCA

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

export function RdaPhase3ValidationSteps({ rda, onChange }: Props) {
  const isStepCompleted = (stepId: string) => rda.completedSteps?.includes(stepId) || false;
  const isStepNa = (stepId: string) => rda.naSteps?.includes(stepId) || false;

  const toggleStep = (stepId: string) => {
    const completed = rda.completedSteps || [];
    const na = rda.naSteps || [];
    if (completed.includes(stepId)) {
      onChange({ ...rda, completedSteps: completed.filter((s) => s !== stepId) });
    } else {
      onChange({ ...rda, completedSteps: [...completed, stepId], naSteps: na.filter((s) => s !== stepId) });
    }
  };

  const toggleNa = (stepId: string) => {
    const na = rda.naSteps || [];
    const completed = rda.completedSteps || [];
    if (na.includes(stepId)) {
      onChange({ ...rda, naSteps: na.filter((s) => s !== stepId) });
    } else {
      onChange({ ...rda, naSteps: [...na, stepId], completedSteps: completed.filter((s) => s !== stepId) });
    }
  };

  const stepProps = (stepId: string) => ({
    defaultExpanded: true,
    isStepCompleted: isStepCompleted(stepId),
    isNa: isStepNa(stepId),
    onToggleStep: () => toggleStep(stepId),
    onToggleNa: () => toggleNa(stepId),
  });

  return (
    <>
      <StepCard title="9. Plan de Validación" {...stepProps("rda-step-9")}>
        <RdaValidationTable
          items={rda.validationActions || []}
          onChange={(newActions) => onChange({ ...rda, validationActions: newActions })}
        />
      </StepCard>

      <StepCard title="10. Evidencias de Validación" {...stepProps("rda-step-10")}>
        <RdaEvidenceTab
          title="Evidencias por acción"
          description="Adjunta las evidencias de cada acción de validación (causa raíz validada o descartada)."
          items={rda.evidenciasValidacion || []}
          onChange={(newEvidencias) => onChange({ ...rda, evidenciasValidacion: newEvidencias })}
        />
      </StepCard>

      <StepCard
        title="11. Checklist de Estandarización y Gestión del Conocimiento"
        {...stepProps("rda-step-11")}
      >
        <div className="overflow-x-auto w-full py-4">
          <RdaChecklistEstandarizacion
            data={rda.checklistEstandarizacion || {}}
            onChange={(newData) => onChange({ ...rda, checklistEstandarizacion: newData })}
          />
        </div>
      </StepCard>

      <div className="overflow-x-auto w-full">
        <ActionPlanTable
          title="12. PDA (Prevención de Recurrencia) - Matriz de Impacto y Plan de Acción"
          items={rda.pda || []}
          onChange={(newItems) => onChange({ ...rda, pda: newItems })}
          isStepCompleted={isStepCompleted("rda-step-12")}
          isNa={isStepNa("rda-step-12")}
          onToggleStep={() => toggleStep("rda-step-12")}
          onToggleNa={() => toggleNa("rda-step-12")}
        />
      </div>
    </>
  );
}
