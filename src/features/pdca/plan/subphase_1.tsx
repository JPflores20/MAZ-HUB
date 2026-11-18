/**
 * @fileoverview Subfase 1.1 de PLAN (Identificación del Problema): agrupa Pasos 1 al 7 del PDCA.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { MultiImageUploadSection, ALL_ACCEPT_STRING } from "../image_upload";
import { VpoCheckpointTable } from "./paso_2/vpo_checkpoint_table";
import { VozConsumidorTable } from "./paso_5/voz_consumidor_table";
import { AnalisisRiesgosTable } from "./paso_6/analisis_riesgos_table";
import { TimeSeriesYTD } from "./paso_7/time_series_ytd";
import { Subphase1Step1Card } from "./subphase_1_step1_card";
import type { PhasePlanProps } from "./phase_plan_types";

/**
 * Renderiza la primera subfase de planificación con Declaración, VPO, SIPOC, Mapeo, VOC, Riesgos y Serie YTD.
 */
export const Subphase1: React.FC<PhasePlanProps> = (props) => {
  const { t: translate } = useTranslation();
  const {
    problem_description,
    vpo_checkpoints,
    on_vpo_checkpoints_change,
    completed_steps,
    na_steps,
    on_toggle_step,
    on_toggle_na,
    process_mapping_files,
    sipoc_map_files,
    on_sipoc_map_files_change,
    on_process_mapping_files_change,
    voz_consumidor,
    on_voz_consumidor_change,
    analisis_riesgos_proyecto,
    on_analisis_riesgos_proyecto_change,
    target_vs_actual,
    on_target_vs_actual_change,
    target_vs_actual_unit,
    on_target_vs_actual_unit_change,
    target_vs_actual_title,
    on_target_vs_actual_title_change,
    target_vs_actual_ymin,
    on_target_vs_actual_ymin_change,
    target_vs_actual_ymax,
    on_target_vs_actual_ymax_change,
  } = props;

  return (
    <div className="space-y-6">
      <Subphase1Step1Card {...props} />

      <VpoCheckpointTable
        checkpoints={vpo_checkpoints}
        onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description}
        completedSteps={completed_steps}
        naSteps={na_steps}
        onToggleStep={on_toggle_step}
        onToggleNa={on_toggle_na}
      />

      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(archivos) => on_sipoc_map_files_change?.(archivos)}
        title={translate("pdcaPlan.step3Title")}
        subtitle={translate("pdcaPlan.step3Subtitle")}
        description={translate("pdcaPlan.step3Desc")}
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")}
        onToggleNa={() => on_toggle_na?.("step-3")}
      />

      <MultiImageUploadSection
        images={process_mapping_files || []}
        onChange={(archivos) => on_process_mapping_files_change?.(archivos)}
        title={translate("pdcaPlan.step4Title")}
        subtitle={translate("pdcaPlan.step3Subtitle")}
        description={translate("pdcaPlan.step4Desc")}
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")}
        onToggleNa={() => on_toggle_na?.("step-4")}
      />

      <VozConsumidorTable
        items={voz_consumidor || []}
        onChange={(registros) => on_voz_consumidor_change?.(registros)}
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")}
        onToggleNa={() => on_toggle_na?.("step-5")}
      />

      <AnalisisRiesgosTable
        title={translate("pdcaPlan.step6Title")}
        items={analisis_riesgos_proyecto || []}
        onChange={(registros) => on_analisis_riesgos_proyecto_change?.(registros)}
        isStepCompleted={completed_steps.has("step-6")}
        onToggleStep={() => on_toggle_step("step-6")}
        isNa={na_steps?.has("step-6")}
        onToggleNa={() => on_toggle_na?.("step-6")}
      />

      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title={translate("pdcaPlan.step7Title")}
        chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change}
        yMin={target_vs_actual_ymin}
        onYMinChange={on_target_vs_actual_ymin_change}
        yMax={target_vs_actual_ymax}
        onYMaxChange={on_target_vs_actual_ymax_change}
        isStepCompleted={completed_steps.has("step-12")}
        onToggleStep={() => on_toggle_step("step-12")}
        isNa={na_steps?.has("step-12")}
        onToggleNa={() => on_toggle_na?.("step-12")}
      />
    </div>
  );
};
