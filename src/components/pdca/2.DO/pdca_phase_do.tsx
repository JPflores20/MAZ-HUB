import React from "react";
import { useTranslation } from "react-i18next";
import { ActionPlanTable } from "./paso18/action-plan-table";
import { EvidenciasSolucionStep } from "./paso19/evidencias-solucion-step";
import { ImageUploadSection } from "../image-upload-section";
import type { ActionItem } from "@/data/pdca";

interface PhaseDoProps {
  action_items: ActionItem[];
  on_action_items_change: (items: ActionItem[]) => void;
  evidencias_solucion: any[];
  on_evidencias_solucion_change: (evs: any[]) => void;
  kpi_tree_foco_image?: string | undefined;
  on_kpi_tree_foco_image_change: (img: string | undefined) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: (step_id: string) => void;
}

export const PdcaPhaseDo: React.FC<PhaseDoProps> = ({
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
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* ── PASO 18: Plan de acción ───────────────────────────────────── */}
      <ActionPlanTable
        items={action_items || []}
        onChange={on_action_items_change}
        isStepCompleted={completed_steps.has("step-18")}
        onToggleStep={() => on_toggle_step("step-18")}
        isNa={na_steps?.has("step-18")}
        onToggleNa={() => on_toggle_na?.("step-18")}
      />

      {/* ── PASO 19: Evidencia de soluciones ────────────────────────── */}
      <EvidenciasSolucionStep
        actions={action_items || []}
        evidencias={evidencias_solucion || []}
        onEvidenciasChange={on_evidencias_solucion_change}
        isStepCompleted={completed_steps.has("step-19")}
        onToggleStep={() => on_toggle_step("step-19")}
        isNa={na_steps?.has("step-19")}
        onToggleNa={() => on_toggle_na?.("step-19")}
      />

      {/* ── PASO 20: Árbol del KPI con PIS foco ──────────────────────── */}
      <ImageUploadSection
        image={kpi_tree_foco_image || null}
        onChange={(img) => on_kpi_tree_foco_image_change(img || undefined)}
        title={t("pdcaPhases.do.step20.title")}
        subtitle={t("pdcaPhases.do.step20.subtitle")}
        isStepCompleted={completed_steps.has("step-20")}
        onToggleStep={() => on_toggle_step("step-20")}
        isNa={na_steps?.has("step-20")}
        onToggleNa={() => on_toggle_na?.("step-20")}
      />
    </div>
  );
};

// force vite reload
