import { useTranslation } from "react-i18next";
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Rda, RdaEffectivenessEval } from "@/data/rda";
import { StepCard } from "@/components/ui/step-card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

export function RdaPhase7EffectivenessEval({ rda, onChange }: Props) {
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

  const evalData: RdaEffectivenessEval = rda.efectividadRda || {
    periodoEvaluado: "",
    periodoEvaluadoInicio: "",
    periodoEvaluadoFin: "",
    indicadorEvaluado: "",
    items: [{ id: crypto.randomUUID(), concepto: "", antes: "", despues: "" }],
    resultado: "",
  };

  const updateData = (updates: Partial<RdaEffectivenessEval>) => {
    onChange({ ...rda, efectividadRda: { ...evalData, ...updates } });
  };

  const addItem = () => {
    updateData({
      items: [...evalData.items, { id: crypto.randomUUID(), concepto: "", antes: "", despues: "" }],
    });
  };

  const updateItem = (id: string, field: keyof (typeof evalData.items)[0], value: string) => {
    updateData({
      items: evalData.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const removeItem = (id: string) => {
    updateData({ items: evalData.items.filter((item) => item.id !== id) });
  };

  return (
    <div className="space-y-8">
      <StepCard
        title={t("rdaInternal.rdaEffectivenessEval")}
        defaultExpanded={true}
        isStepCompleted={isStepCompleted("rda-step-15")}
        isNa={isStepNa("rda-step-15")}
        onToggleStep={() => toggleStep("rda-step-15")}
        onToggleNa={() => toggleNa("rda-step-15")}
      >
        <div className="flex flex-col space-y-6">
          <h3 className="font-bold text-xl">{t("rdaInternal.effectivenessEval")}</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold">{t("rdaInternal.evaluatedPeriod")}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("rdaInternal.start")}</span>
                <DatePicker
                  date={
                    evalData.periodoEvaluadoInicio
                      ? new Date(evalData.periodoEvaluadoInicio)
                      : undefined
                  }
                  setDate={(date) =>
                    updateData({ periodoEvaluadoInicio: date ? date.toISOString() : "" })
                  }
                  className="w-[160px] h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("rdaInternal.end")}</span>
                <DatePicker
                  date={
                    evalData.periodoEvaluadoFin ? new Date(evalData.periodoEvaluadoFin) : undefined
                  }
                  setDate={(date) =>
                    updateData({ periodoEvaluadoFin: date ? date.toISOString() : "" })
                  }
                  className="w-[160px] h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t("rdaInternal.evaluatedIndicator")}</span>
              <input
                type="text"
                className="bg-background border-b border-border px-2 py-1 outline-none flex-1 max-w-sm"
                placeholder={t("rdaInternal.exAverageFiltrationTime")}
                value={evalData.indicadorEvaluado}
                onChange={(e) => updateData({ indicadorEvaluado: e.target.value })}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0078D7] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
                    {t("rdaInternal.concept")}
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
                    {t("rdaInternal.beforeAction")}
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
                    {t("rdaInternal.afterAction")}
                  </th>
                  <th className="px-2 py-3 w-10 border-none"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evalData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-2">
                      <input
                        className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                        placeholder={t("rdaInternal.conceptPlaceholder")}
                        value={item.concepto}
                        onChange={(e) => updateItem(item.id, "concepto", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                        placeholder={t("rdaInternal.beforePlaceholder")}
                        value={item.antes}
                        onChange={(e) => updateItem(item.id, "antes", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                        placeholder={t("rdaInternal.afterPlaceholder")}
                        value={item.despues}
                        onChange={(e) => updateItem(item.id, "despues", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 bg-secondary/20 border-t border-border">
              <Button variant="outline" size="sm" onClick={addItem} className="h-8 text-xs gap-1">
                <Plus className="size-3" />
                {t("rdaInternal.addRow")}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg">{t("rdaInternal.result")}</h3>
            <RichTextEditor
              className="w-full bg-background border border-border rounded-md text-sm"
              placeholder={t("rdaInternal.writeResult")}
              value={evalData.resultado}
              onChange={(val) => updateData({ resultado: val })}
            />
          </div>
        </div>
      </StepCard>
    </div>
  );
}
