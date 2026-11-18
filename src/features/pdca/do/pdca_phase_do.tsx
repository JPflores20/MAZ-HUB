/**
 * @fileoverview Fase 2 (DO / Ejecución) del PDCA: Plan de Acción, Evidencia de Soluciones y Árbol de KPI.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import type { ActionItem } from "@/domain/pdca";
import { ImageUploadSection } from "../image_upload";
import { ActionPlanTable } from "./paso_18/action_plan_table";
import {
  EvidenciasSolucionStep,
  type MultiEvidenciaSolucionItem,
} from "./paso_19/evidencias_solucion_step";

interface PropiedadesFaseDo {
  action_items: ActionItem[];
  on_action_items_change: (nuevas_acciones: ActionItem[]) => void;
  evidencias_solucion: MultiEvidenciaSolucionItem[];
  on_evidencias_solucion_change: (nuevas_evidencias: MultiEvidenciaSolucionItem[]) => void;
  kpi_tree_foco_image?: string | undefined;
  on_kpi_tree_foco_image_change: (imagen_url: string | undefined) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
}

/**
 * Coordina los pasos de ejecución del PDCA (Pasos 19, 20 y 21).
 */
export const PdcaPhaseDo: React.FC<PropiedadesFaseDo> = ({
  action_items,
  on_action_items_change,
  evidencias_solucion,
  on_evidencias_solucion_change,
  kpi_tree_foco_image,
  on_kpi_tree_foco_image_change,
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <ActionPlanTable
        items={action_items || []}
        onChange={on_action_items_change}
        isStepCompleted={completed_steps.has("step-18")}
        onToggleStep={() => on_toggle_step("step-18")}
        isNa={na_steps?.has("step-18")}
        onToggleNa={() => on_toggle_na?.("step-18")}
      />

      <EvidenciasSolucionStep
        actions={action_items || []}
        evidencias={evidencias_solucion || []}
        onEvidenciasChange={on_evidencias_solucion_change}
        isStepCompleted={completed_steps.has("step-19")}
        onToggleStep={() => on_toggle_step("step-19")}
        isNa={na_steps?.has("step-19")}
        onToggleNa={() => on_toggle_na?.("step-19")}
      />

      <ImageUploadSection
        image={kpi_tree_foco_image || null}
        onChange={(imagen_url) => on_kpi_tree_foco_image_change(imagen_url || undefined)}
        title={translate("pdcaPhases.do.step20.title")}
        subtitle={translate("pdcaPhases.do.step20.subtitle")}
        isStepCompleted={completed_steps.has("step-20")}
        onToggleStep={() => on_toggle_step("step-20")}
        isNa={na_steps?.has("step-20")}
        onToggleNa={() => on_toggle_na?.("step-20")}
      />
    </div>
  );
};
