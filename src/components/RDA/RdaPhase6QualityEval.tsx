import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda, RdaQualityEval } from "@/data/rda";
import { StepCard } from "@/components/ui/step-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

const ScoreSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
            value === v
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
};

export function RdaPhase6QualityEval({ rda, onChange }: Props) {
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

  const evalData: RdaQualityEval = rda.calidadRda || {
    definicionProblema: 5,
    evidencia: 5,
    causaRaiz: 4,
    accionesCorrectivas: 5,
    validacionEfectividad: 5,
    conclusion: "",
  };

  const updateData = (updates: Partial<RdaQualityEval>) => {
    onChange({ ...rda, calidadRda: { ...evalData, ...updates } });
  };

  const totalScore =
    evalData.definicionProblema +
    evalData.evidencia +
    evalData.causaRaiz +
    evalData.accionesCorrectivas +
    evalData.validacionEfectividad;
  const percentage = Math.round((totalScore / 25) * 100);

  return (
    <div className="space-y-8">
      <StepCard
        title={t("rdaInternal.rdaQualityEval")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-14")}
        isNa={isStepNa("rda-step-14")}
        onToggleStep={() => toggleStep("rda-step-14")}
        onToggleNa={() => toggleNa("rda-step-14")}
      >
        <div className="flex flex-col space-y-6">
          <h3 className="font-bold text-lg uppercase">{t("rdaInternal.rating")}</h3>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0078D7] text-white">
                <tr>
                  <th className="px-4 py-3 w-[70%] font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
                    {t("rdaInternal.element")}
                  </th>
                  <th className="px-4 py-3 w-[30%] font-bold uppercase text-[10px] tracking-wider text-center">
                    {t("rdaInternal.evaluation")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">{t("rdaInternal.problemDefinition")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center w-full">
                      <ScoreSelector
                        value={evalData.definicionProblema}
                        onChange={(v) => updateData({ definicionProblema: v })}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">{t("rdaInternal.evidence")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center w-full">
                      <ScoreSelector
                        value={evalData.evidencia}
                        onChange={(v) => updateData({ evidencia: v })}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">{t("rdaInternal.rootCause")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center w-full">
                      <ScoreSelector
                        value={evalData.causaRaiz}
                        onChange={(v) => updateData({ causaRaiz: v })}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">{t("rdaInternal.correctiveActions")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center w-full">
                      <ScoreSelector
                        value={evalData.accionesCorrectivas}
                        onChange={(v) => updateData({ accionesCorrectivas: v })}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">{t("rdaInternal.effectivenessValidation")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center w-full">
                      <ScoreSelector
                        value={evalData.validacionEfectividad}
                        onChange={(v) => updateData({ validacionEfectividad: v })}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="font-semibold">
            {t("rdaInternal.globalResult")} {totalScore}/25 ({percentage}%)
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg">{t("rdaInternal.conclusion")}</h3>
            <RichTextEditor
              className="w-full bg-background border border-border rounded-md text-sm"
              placeholder={t("rdaInternal.writeConclusion")}
              value={evalData.conclusion}
              onChange={(val) => updateData({ conclusion: val })}
            />
          </div>
        </div>
      </StepCard>
    </div>
  );
}
