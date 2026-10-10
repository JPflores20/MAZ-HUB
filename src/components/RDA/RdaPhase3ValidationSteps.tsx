import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { RdaValidationTable } from "./RdaValidationTable";
import { RdaEvidenceTab } from "./RdaEvidenceTab";
import { RdaChecklistEstandarizacion } from "./RdaChecklistEstandarizacion";
import { ActionPlanTable } from "@/components/pdca/2.DO/paso18/action-plan-table";
import { EvidenciasSolucionStep } from "@/components/pdca/2.DO/paso19/evidencias-solucion-step";
import type { RdaEvidenceItem } from "@/data/rda";
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
  const { t } = useTranslation();

  const isStepCompleted = (stepId: string) => rda.completedSteps?.includes(stepId) || false;
  const isStepNa = (stepId: string) => rda.naSteps?.includes(stepId) || false;

  const toggleStep = (stepId: string) => {
    const completed = rda.completedSteps || [];
    const na = rda.naSteps || [];
    if (completed.includes(stepId)) {
      onChange({ ...rda, completedSteps: completed.filter((s) => s !== stepId) });
    } else {
      onChange({
        ...rda,
        completedSteps: [...completed, stepId],
        naSteps: na.filter((s) => s !== stepId),
      });
    }
  };

  const toggleNa = (stepId: string) => {
    const na = rda.naSteps || [];
    const completed = rda.completedSteps || [];
    if (na.includes(stepId)) {
      onChange({ ...rda, naSteps: na.filter((s) => s !== stepId) });
    } else {
      onChange({
        ...rda,
        naSteps: [...na, stepId],
        completedSteps: completed.filter((s) => s !== stepId),
      });
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
      <StepCard title={t("rdaInternal.validationPlan")} {...stepProps("rda-step-9")}>
        <RdaValidationTable
          items={rda.validationActions || []}
          onChange={(newActions) => onChange({ ...rda, validationActions: newActions })}
        />

        <div className="mt-8 border-t pt-8">
          <RdaEvidenceTab
            title={t("rdaInternal.evidenceByAction")}
            description={t("rdaInternal.evidenceDesc")}
            items={rda.evidenciasValidacion || []}
            onChange={(newEvidencias) => onChange({ ...rda, evidenciasValidacion: newEvidencias })}
            validationActions={rda.validationActions || []}
          />
        </div>
      </StepCard>

      <StepCard
        title={t("rdaInternal.standardizationChecklist")}
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
          title={t("rdaInternal.pdaRecurrencePrevention")}
          items={rda.pda || []}
          onChange={(newItems) => onChange({ ...rda, pda: newItems })}
          isStepCompleted={isStepCompleted("rda-step-12")}
          isNa={isStepNa("rda-step-12")}
          onToggleStep={() => toggleStep("rda-step-12")}
          onToggleNa={() => toggleNa("rda-step-12")}
          bottomContent={
            <div className="mt-8 border-t pt-8">
              <EvidenciasSolucionStep
                title={t("rdaInternal.pdaEvidence")}
                actions={rda.pda || []}
                evidencias={(rda.evidenciasEliminacionCausa || []).map((e) => ({
                  actionId: e.id,
                  image: e.images?.[0],
                }))}
                onEvidenciasChange={(newEvs) =>
                  onChange({
                    ...rda,
                    evidenciasEliminacionCausa: newEvs.map((ev) => ({
                      id: ev.actionId,
                      title: "",
                      description: "",
                      images: ev.image ? [ev.image] : [],
                    })) as RdaEvidenceItem[],
                  })
                }
                hideStepCard={true}
              />
            </div>
          }
        />
      </div>
    </>
  );
}
