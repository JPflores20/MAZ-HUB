/**
 * @fileoverview Phase 2 (Problem Description) container: general data, 5W+1H, containment, and timeline.
 */

import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import type { Rda } from "@/domain/models/rda";
import { StepCard } from "@/shared/ui/step_card";
import { create_rda_step_controls } from "../utils/rda_step_helpers";
import { RdaContextForm } from "./rda_context_form";
import { RdaProblemDescriptionTab } from "./rda_problem_description_tab";
import { RdaTimelineTab } from "./rda_timeline_tab";

interface RdaPhase2ProblemProps {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

/** Coordinates the four methodological StepCards in RDA Phase 2. */
export function RdaPhase2Problem({ rda, onChange }: RdaPhase2ProblemProps) {
  const { t } = useTranslation();
  const { build_step_props } = create_rda_step_controls(rda, onChange);

  return (
    <div className="space-y-8">
      <StepCard title={t("rdaInternal.generalData")} {...build_step_props("rda-step-1")}>
        <RdaContextForm
          context={rda.context}
          onChange={(new_context) => {
            const assigned_from_context = (new_context.responsable || "")
              .split(",")
              .map((person) => person.trim())
              .filter(Boolean);
            onChange({
              ...rda,
              context: new_context,
              portada: {
                ...(rda.portada || {
                  titulo: rda.title || "Nuevo RDA",
                  area: new_context.area || "",
                  fechaLimite: "",
                  autorOriginal: "",
                  usuariosAsignados: [],
                  descripcionProblema: "",
                }),
                usuariosAsignados: assigned_from_context,
              },
            });
          }}
          disabled={false}
        />
      </StepCard>

      <StepCard title={t("rdaInternal.abnormalityDescription5w1h")} {...build_step_props("rda-step-2")}>
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
          onChange={(next_description) => onChange({ ...rda, problemDescription: next_description })}
        />
      </StepCard>

      <StepCard title={t("rdaInternal.immediateCorrectiveActions")} {...build_step_props("rda-step-3")}>
        <div className="space-y-6">
          <div className="border border-border rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-[#0078D7] border-b border-border px-4 py-2 font-bold text-center text-[10px] text-white uppercase">
              {t("rdaInternal.immediateCorrectiveActionsTitle")}
            </div>
            <TextareaAutosize
              placeholder="Se revisa el reposo que alimentó los BBT's..."
              value={rda.immediateActions?.[0]?.accion || ""}
              onChange={(change_event) => {
                const existing_actions = rda.immediateActions || [];
                const first_action = existing_actions[0] || {
                  id: crypto.randomUUID(),
                  categoria: "Máquina",
                  causaPotencial: "",
                  accion: "",
                  responsable: "",
                  fechaLimite: "",
                  estatus: "Pendiente",
                  esCausaRaiz: "NO",
                };
                onChange({
                  ...rda,
                  immediateActions: [{ ...first_action, accion: change_event.target.value }],
                });
              }}
              minRows={4}
              className="w-full border-none shadow-none focus-visible:ring-0 text-xs text-justify text-blue-700 dark:text-blue-400 font-medium p-3 resize-none outline-none"
            />
          </div>

          <div className="border border-border rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-[#0078D7] border-b border-border px-4 py-2 font-bold text-center text-[10px] text-white uppercase">
              {t("rdaInternal.observationsDetails")}
            </div>
            <TextareaAutosize
              placeholder="Los BBTs llenaron con el reposo 101 que entro desde las 9:30..."
              value={rda.observacionesAdicionales || ""}
              onChange={(change_event) =>
                onChange({ ...rda, observacionesAdicionales: change_event.target.value })
              }
              minRows={4}
              className="w-full border-none shadow-none focus-visible:ring-0 text-xs text-justify text-blue-700 dark:text-blue-400 font-medium p-3 resize-none outline-none"
            />
          </div>
        </div>
      </StepCard>

      <StepCard title={t("rdaInternal.timeline")} {...build_step_props("rda-step-4")}>
        <RdaTimelineTab
          events={rda.timeline || []}
          onChange={(updated_events) => onChange({ ...rda, timeline: updated_events })}
        />
      </StepCard>
    </div>
  );
}
