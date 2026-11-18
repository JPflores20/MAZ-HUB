/**
 * @fileoverview Phase 5 (RDA Effectiveness Evaluation) tracking Before vs. After KPI results.
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaEffectivenessEval } from "@/domain/models/rda";
import { DatePicker } from "@/shared/ui/date_picker";
import { RichTextEditor } from "@/shared/ui/rich_text_editor";
import { StepCard } from "@/shared/ui/step_card";
import { create_rda_step_controls } from "../utils/rda_step_helpers";
import { RdaPhase7EvalTable } from "./rda_phase7_eval_table";

interface RdaPhase7EffectivenessEvalProps {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

/** Captures before/after performance comparison during the post-action monitoring period. */
export function RdaPhase7EffectivenessEval({ rda, onChange }: RdaPhase7EffectivenessEvalProps) {
  const { t } = useTranslation();
  const { build_step_props } = create_rda_step_controls(rda, onChange);

  const eval_data: RdaEffectivenessEval = rda.efectividadRda || {
    periodoEvaluado: "",
    periodoEvaluadoInicio: "",
    periodoEvaluadoFin: "",
    indicadorEvaluado: "",
    items: [{ id: crypto.randomUUID(), concepto: "", antes: "", despues: "" }],
    resultado: "",
  };

  const update_eval_data = (updates: Partial<RdaEffectivenessEval>) => {
    onChange({ ...rda, efectividadRda: { ...eval_data, ...updates } });
  };

  return (
    <div className="space-y-8">
      <StepCard title={t("rdaInternal.rdaEffectivenessEval")} {...build_step_props("rda-step-15")}>
        <div className="flex flex-col space-y-6">
          <h3 className="font-bold text-xl">{t("rdaInternal.effectivenessEval")}</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold">{t("rdaInternal.evaluatedPeriod")}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("rdaInternal.start")}</span>
                <DatePicker
                  date={
                    eval_data.periodoEvaluadoInicio
                      ? new Date(eval_data.periodoEvaluadoInicio)
                      : undefined
                  }
                  setDate={(picked_date) =>
                    update_eval_data({
                      periodoEvaluadoInicio: picked_date ? picked_date.toISOString() : "",
                    })
                  }
                  className="w-[160px] h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("rdaInternal.end")}</span>
                <DatePicker
                  date={
                    eval_data.periodoEvaluadoFin
                      ? new Date(eval_data.periodoEvaluadoFin)
                      : undefined
                  }
                  setDate={(picked_date) =>
                    update_eval_data({
                      periodoEvaluadoFin: picked_date ? picked_date.toISOString() : "",
                    })
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
                value={eval_data.indicadorEvaluado}
                onChange={(change_event) =>
                  update_eval_data({ indicadorEvaluado: change_event.target.value })
                }
              />
            </div>
          </div>

          <RdaPhase7EvalTable
            items={eval_data.items}
            on_add_item={() =>
              update_eval_data({
                items: [
                  ...eval_data.items,
                  { id: crypto.randomUUID(), concepto: "", antes: "", despues: "" },
                ],
              })
            }
            on_update_item={(item_id, field_name, value) =>
              update_eval_data({
                items: eval_data.items.map((item_entry) =>
                  item_entry.id === item_id ? { ...item_entry, [field_name]: value } : item_entry,
                ),
              })
            }
            on_remove_item={(item_id) =>
              update_eval_data({
                items: eval_data.items.filter((item_entry) => item_entry.id !== item_id),
              })
            }
          />

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg">{t("rdaInternal.result")}</h3>
            <RichTextEditor
              className="w-full bg-background border border-border rounded-md text-sm"
              placeholder={t("rdaInternal.writeResult")}
              value={eval_data.resultado}
              onChange={(next_result) => update_eval_data({ resultado: next_result })}
            />
          </div>
        </div>
      </StepCard>
    </div>
  );
}
