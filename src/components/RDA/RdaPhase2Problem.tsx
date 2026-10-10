import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { RdaContextForm } from "./RdaContextForm";
import { RdaProblemDescriptionTab } from "./RdaProblemDescriptionTab";
import { RdaTimelineTab } from "./RdaTimelineTab";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepCard } from "@/components/ui/step-card";

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

export function RdaPhase2Problem({ rda, onChange }: Props) {
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

  return (
    <div className="space-y-8">
      {/* 1. Datos Generales */}
      <StepCard
        title={t("rdaInternal.generalData")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-1")}
        isNa={isStepNa("rda-step-1")}
        onToggleStep={() => toggleStep("rda-step-1")}
        onToggleNa={() => toggleNa("rda-step-1")}
      >
        <RdaContextForm
          context={rda.context}
          onChange={(newContext) => onChange({ ...rda, context: newContext })}
          disabled={false}
        />
      </StepCard>

      {/* 2. Descripción de Anormalidad (5W + 1H) */}
      <StepCard
        title={t("rdaInternal.abnormalityDescription5w1h")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-2")}
        isNa={isStepNa("rda-step-2")}
        onToggleStep={() => toggleStep("rda-step-2")}
        onToggleNa={() => toggleNa("rda-step-2")}
      >
        <RdaProblemDescriptionTab
          data={
            rda.problemDescription || {
              que: "",
              como: "",
              cuando: "",
              donde: "",
              quien: "",
              cual: "",
            }
          }
          onChange={(newData) => onChange({ ...rda, problemDescription: newData })}
        />
      </StepCard>

      {/* 3. Acciones Correctivas Inmediatas */}
      <StepCard
        title={t("rdaInternal.immediateCorrectiveActions")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-3")}
        isNa={isStepNa("rda-step-3")}
        onToggleStep={() => toggleStep("rda-step-3")}
        onToggleNa={() => toggleNa("rda-step-3")}
      >
        <div className="space-y-6">
          {/* Box 1: Acciones correctivas inmediatas */}
          <div className="border border-border rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-[#0078D7] border-b border-border px-4 py-2 font-bold text-center text-[10px] text-white uppercase">
              {t("rdaInternal.immediateCorrectiveActionsTitle")}
            </div>
            <Textarea
              placeholder="Se revisa el reposo que alimentó los BBT's..."
              value={rda.immediateActions?.[0]?.accion || ""}
              onChange={(e) => {
                const current = rda.immediateActions || [];
                const first = current[0] || { id: crypto.randomUUID(), accion: "" };
                onChange({ ...rda, immediateActions: [{ ...first, accion: e.target.value }] });
              }}
              className="min-h-[100px] w-full border-none shadow-none focus-visible:ring-0 resize-y text-xs text-blue-700 dark:text-blue-400 font-medium"
            />
          </div>

          {/* Box 2: Observaciones */}
          <div className="border border-border rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-[#0078D7] border-b border-border px-4 py-2 font-bold text-center text-[10px] text-white uppercase">
              {t("rdaInternal.observationsDetails")}
            </div>
            <Textarea
              placeholder="Los BBTs llenaron con el reposo 101 que entro desde las 9:30..."
              value={rda.observacionesAdicionales || ""}
              onChange={(e) => onChange({ ...rda, observacionesAdicionales: e.target.value })}
              className="min-h-[100px] w-full border-none shadow-none focus-visible:ring-0 resize-y text-xs text-blue-700 dark:text-blue-400 font-medium"
            />
          </div>
        </div>
      </StepCard>

      {/* 4. Línea de Tiempo */}
      <StepCard
        title={t("rdaInternal.timeline")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-4")}
        isNa={isStepNa("rda-step-4")}
        onToggleStep={() => toggleStep("rda-step-4")}
        onToggleNa={() => toggleNa("rda-step-4")}
      >
        <RdaTimelineTab
          events={rda.timeline || []}
          onChange={(newEvents) => onChange({ ...rda, timeline: newEvents })}
        />
      </StepCard>
    </div>
  );
}
