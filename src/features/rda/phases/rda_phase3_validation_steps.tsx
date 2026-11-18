/**
 * @fileoverview Phase 3 Steps 9-12: Root-cause validation, evidence, VPO checklist, PDA plan, and closure bar.
 */

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionPlanTable } from "@/features/pdca/do/paso_18/action_plan_table";
import { EvidenciasSolucionStep } from "@/features/pdca/do/paso_19/evidencias_solucion_step";
import type { Rda, RdaEvidenceItem, RdaValidationAction } from "@/domain/models/rda";
import { StepCard } from "@/shared/ui/step_card";
import { get_rda_name } from "../utils/rda_name";
import {
  import_ishikawa_causes_to_validation,
  sync_root_causes_to_pda,
} from "../utils/rda_root_cause_sync";
import { create_rda_step_controls } from "../utils/rda_step_helpers";
import { RdaChecklistEstandarizacion } from "./rda_checklist_estandarizacion";
import { RdaClosureBar } from "./rda_closure_bar";
import { RdaEvidenceTab } from "./rda_evidence_tab";
import { RdaValidationTable } from "./rda_validation_table";

interface RdaPhase3ValidationStepsProps {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

/** Coordinates validation actions, PDA recurrence synchronization, evidence uploads, and closure controls. */
export function RdaPhase3ValidationSteps({ rda, onChange }: RdaPhase3ValidationStepsProps) {
  const { t } = useTranslation();
  const { is_step_completed, is_step_na, toggle_step, toggle_na, build_step_props } =
    create_rda_step_controls(rda, onChange);

  const handle_import_from_ishikawa = () => {
    const { next_actions, added_count } = import_ishikawa_causes_to_validation(rda);
    if (added_count === 0) {
      toast.info("No se encontraron causas nuevas en el Diagrama de Ishikawa para importar.");
      return;
    }
    onChange({ ...rda, validationActions: next_actions });
    toast.success(`Se importaron ${added_count} causa(s) del Ishikawa al Plan de Validación.`);
  };

  const problem_effect_topic = get_rda_name(rda) || rda.title || "Anomalía RDA";
  const initial_sync_done_id_ref = useRef<string | null>(null);

  useEffect(() => {
    if (initial_sync_done_id_ref.current === rda.id) return;
    initial_sync_done_id_ref.current = rda.id;

    if (Array.isArray(rda.pda) && rda.pda.length > 0) return;

    const { nextPda, changed } = sync_root_causes_to_pda(
      rda.validationActions || [],
      rda.pda || [],
      problem_effect_topic,
    );
    if (changed) {
      onChange({ ...rda, pda: nextPda });
    }
  }, [rda.id]);

  const handle_validation_actions_change = (updated_actions: RdaValidationAction[]) => {
    const { nextPda } = sync_root_causes_to_pda(
      updated_actions,
      rda.pda || [],
      problem_effect_topic,
      rda.validationActions || [],
    );
    onChange({ ...rda, validationActions: updated_actions, pda: nextPda });
  };

  return (
    <>
      <StepCard title={t("rdaInternal.validationPlan")} {...build_step_props("rda-step-9")}>
        <RdaValidationTable
          items={rda.validationActions || []}
          onChange={handle_validation_actions_change}
          onImportFromIshikawa={handle_import_from_ishikawa}
        />

        <div className="mt-8 border-t pt-8">
          <RdaEvidenceTab
            title={t("rdaInternal.evidenceByAction")}
            description={t("rdaInternal.evidenceDesc")}
            items={rda.evidenciasValidacion || []}
            onChange={(updated_evidence) =>
              onChange({ ...rda, evidenciasValidacion: updated_evidence })
            }
            validationActions={rda.validationActions || []}
          />
        </div>
      </StepCard>

      <StepCard title={t("rdaInternal.standardizationChecklist")} {...build_step_props("rda-step-11")}>
        <div className="overflow-x-auto w-full py-4">
          <RdaChecklistEstandarizacion
            data={rda.checklistEstandarizacion || {}}
            onChange={(updated_checklist) =>
              onChange({ ...rda, checklistEstandarizacion: updated_checklist })
            }
          />
        </div>
      </StepCard>

      <div className="overflow-x-auto w-full">
        <ActionPlanTable
          title={t("rdaInternal.pdaRecurrencePrevention")}
          items={rda.pda || []}
          onChange={(updated_pda) => onChange({ ...rda, pda: updated_pda })}
          isStepCompleted={is_step_completed("rda-step-12")}
          isNa={is_step_na("rda-step-12")}
          onToggleStep={() => toggle_step("rda-step-12")}
          onToggleNa={() => toggle_na("rda-step-12")}
          defaultExpanded={true}
          bottomContent={
            <div className="mt-8 border-t pt-8">
              <EvidenciasSolucionStep
                title={t("rdaInternal.pdaEvidence")}
                actions={rda.pda || []}
                evidencias={(rda.evidenciasEliminacionCausa || []).map((evidence_item) => ({
                  actionId: evidence_item.id,
                  image: evidence_item.images?.[0] || "",
                  images: evidence_item.images || [],
                }))}
                onEvidenciasChange={(updated_evidences) =>
                  onChange({
                    ...rda,
                    evidenciasEliminacionCausa: updated_evidences.map((evidence_entry) => ({
                      id: evidence_entry.actionId,
                      title: "",
                      description: "",
                      images:
                        Array.isArray(evidence_entry.images) && evidence_entry.images.length > 0
                          ? evidence_entry.images
                          : evidence_entry.image
                            ? [evidence_entry.image]
                            : [],
                    })) as RdaEvidenceItem[],
                  })
                }
                hideStepCard={true}
              />
            </div>
          }
        />
      </div>

      <RdaClosureBar rda={rda} on_change={onChange} />
    </>
  );
}
