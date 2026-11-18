/**
 * @fileoverview Phase 4 (RDA Quality Evaluation) scoring 5 methodology dimensions from 0 to 5.
 */

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Rda, RdaQualityEval } from "@/domain/models/rda";
import {
  evaluate_rda_methodology,
  MethodologyValidatorCard,
} from "@/shared/components/methodology_validator";
import { Button } from "@/shared/ui/button";
import { RichTextEditor } from "@/shared/ui/rich_text_editor";
import { StepCard } from "@/shared/ui/step_card";
import { create_rda_step_controls } from "../utils/rda_step_helpers";

interface RdaPhase6QualityEvalProps {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

const QUALITY_SCORE_DIMENSIONS: {
  key: Exclude<keyof RdaQualityEval, "conclusion">;
  label_key: string;
}[] = [
  { key: "definicionProblema", label_key: "rdaInternal.problemDefinition" },
  { key: "evidencia", label_key: "rdaInternal.evidence" },
  { key: "causaRaiz", label_key: "rdaInternal.rootCause" },
  { key: "accionesCorrectivas", label_key: "rdaInternal.correctiveActions" },
  { key: "validacionEfectividad", label_key: "rdaInternal.effectivenessValidation" },
];

function ScoreSelector({
  value,
  on_change,
}: {
  value: number;
  on_change: (score: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((score_option) => (
        <button
          key={score_option}
          type="button"
          onClick={() => on_change(score_option)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
            value === score_option
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {score_option}
        </button>
      ))}
    </div>
  );
}

/** Evaluates RDA methodological consistency and overall quality score out of 25 points. */
export function RdaPhase6QualityEval({ rda, onChange }: RdaPhase6QualityEvalProps) {
  const { t } = useTranslation();
  const rda_methodology = useMemo(() => evaluate_rda_methodology(rda), [rda]);
  const { build_step_props } = create_rda_step_controls(rda, onChange);

  const eval_data: RdaQualityEval = rda.calidadRda || {
    definicionProblema: 5,
    evidencia: 5,
    causaRaiz: 4,
    accionesCorrectivas: 5,
    validacionEfectividad: 5,
    conclusion: "",
  };

  const update_eval_data = (updates: Partial<RdaQualityEval>) => {
    onChange({ ...rda, calidadRda: { ...eval_data, ...updates } });
  };

  const handle_apply_suggested_scores = () => {
    update_eval_data(rda_methodology.suggestedQualityEval);
    toast.success("Calificación sugerida aplicada según los datos actuales del RDA");
  };

  const total_score =
    eval_data.definicionProblema +
    eval_data.evidencia +
    eval_data.causaRaiz +
    eval_data.accionesCorrectivas +
    eval_data.validacionEfectividad;
  const percentage = Math.round((total_score / 25) * 100);

  return (
    <div className="space-y-8">
      <MethodologyValidatorCard
        title="Diagnóstico Automático de Consistencia Metodológica RDA"
        criteria={rda_methodology.criteria}
        scorePct={rda_methodology.scorePct}
        actionButton={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handle_apply_suggested_scores}
            className="h-7 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
          >
            <Sparkles className="size-3.5" />
            Aplicar calificación sugerida
          </Button>
        }
      />

      <StepCard title={t("rdaInternal.rdaQualityEval")} {...build_step_props("rda-step-14")}>
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
                {QUALITY_SCORE_DIMENSIONS.map((dimension) => (
                  <tr key={dimension.key}>
                    <td className="px-4 py-3 text-muted-foreground">{t(dimension.label_key)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center w-full">
                        <ScoreSelector
                          value={eval_data[dimension.key]}
                          on_change={(next_score) =>
                            update_eval_data({ [dimension.key]: next_score })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="font-semibold">
            {t("rdaInternal.globalResult")} {total_score}/25 ({percentage}%)
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg">{t("rdaInternal.conclusion")}</h3>
            <RichTextEditor
              className="w-full bg-background border border-border rounded-md text-sm"
              placeholder={t("rdaInternal.writeConclusion")}
              value={eval_data.conclusion}
              onChange={(next_conclusion) => update_eval_data({ conclusion: next_conclusion })}
            />
          </div>
        </div>
      </StepCard>
    </div>
  );
}
