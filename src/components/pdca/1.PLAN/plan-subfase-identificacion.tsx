import React from "react";
import { Paso1DeclaracionProyecto } from "./paso1/paso1-declaracion-proyecto";
import { VpoCheckpointTable } from "./paso2/vpo-checkpoint-table";
import { MultiImageUploadSection, ALL_ACCEPT_STRING } from "../image-upload-section";
import { VozConsumidorTable } from "./paso5/voz-consumidor-table";
import { AnalisisRiesgosTable } from "./paso6/analisis-riesgos-table";
import { TimeSeriesYTD } from "./paso7/time-series-ytd";
import type { PropiedadesFasePlan } from "./plan-props";

export type PropiedadesSubfaseIdentificacion = Pick<
  PropiedadesFasePlan,
  | "title_value"
  | "on_title_change"
  | "area_value"
  | "on_area_change"
  | "deadline_date"
  | "on_deadline_change"
  | "author_name"
  | "author_email"
  | "on_author_change"
  | "assigned_users"
  | "on_toggle_assigned_user"
  | "available_users"
  | "is_admin_user"
  | "is_editable"
  | "problem_description"
  | "on_problem_change"
  | "goal_definition"
  | "on_goal_definition_change"
  | "participants_info"
  | "on_participants_info_change"
  | "vpo_checkpoints"
  | "on_vpo_checkpoints_change"
  | "completed_steps"
  | "na_steps"
  | "on_toggle_step"
  | "on_toggle_na"
  | "sipoc_map_files"
  | "on_sipoc_map_files_change"
  | "process_mapping_files"
  | "on_process_mapping_files_change"
  | "voz_consumidor"
  | "on_voz_consumidor_change"
  | "analisis_riesgos_proyecto"
  | "on_analisis_riesgos_proyecto_change"
  | "target_vs_actual"
  | "on_target_vs_actual_change"
  | "target_vs_actual_unit"
  | "on_target_vs_actual_unit_change"
  | "target_vs_actual_title"
  | "on_target_vs_actual_title_change"
  | "target_vs_actual_ymin"
  | "on_target_vs_actual_ymin_change"
  | "target_vs_actual_ymax"
  | "on_target_vs_actual_ymax_change"
>;

/** Subfase 1: Identificación del Problema (Pasos 1-7) */
export const SubfaseIdentificacionProblema: React.FC<PropiedadesSubfaseIdentificacion> = (props) => {
  const {
    problem_description,
    vpo_checkpoints,
    on_vpo_checkpoints_change,
    completed_steps,
    na_steps,
    on_toggle_step,
    on_toggle_na,
    sipoc_map_files,
    on_sipoc_map_files_change,
    process_mapping_files,
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
    <>
      {/* PASO 1: DECLARACIÓN DEL PROYECTO */}
      <Paso1DeclaracionProyecto {...props} />

      {/* PASO 2: VPO */}
      <VpoCheckpointTable
        checkpoints={vpo_checkpoints}
        onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description}
        completedSteps={completed_steps}
        naSteps={na_steps ?? new Set()}
        onToggleStep={on_toggle_step}
        onToggleNa={on_toggle_na}
      />

      {/* PASO 3: SIPOC MAP */}
      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(f) => on_sipoc_map_files_change?.(f)}
        title="PASO 3: SIPOC MAP"
        subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos del SIPOC MAP (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")}
        onToggleNa={() => on_toggle_na?.("step-3")}
      />

      {/* PASO 4: MAPEO DE PROCESOS */}
      <MultiImageUploadSection
        images={process_mapping_files || []}
        onChange={(f) => on_process_mapping_files_change?.(f)}
        title="PASO 4: MAPEO DE PROCESOS"
        subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")}
        onToggleNa={() => on_toggle_na?.("step-4")}
      />

      {/* PASO 5: VOZ DEL CONSUMIDOR */}
      <VozConsumidorTable
        items={voz_consumidor || []}
        onChange={on_voz_consumidor_change!}
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")}
        onToggleNa={() => on_toggle_na?.("step-5")}
      />

      {/* PASO 6: ANÁLISIS DE RIESGOS */}
      <AnalisisRiesgosTable
        title="PASO 6: ANÁLISIS DE RIESGOS DEL PROYECTO"
        items={analisis_riesgos_proyecto || []}
        onChange={on_analisis_riesgos_proyecto_change!}
        isStepCompleted={completed_steps.has("step-6")}
        onToggleStep={() => on_toggle_step("step-6")}
        isNa={na_steps?.has("step-6")}
        onToggleNa={() => on_toggle_na?.("step-6")}
      />

      {/* PASO 7: SITUACIÓN ACTUAL */}
      <TimeSeriesYTD
        value={target_vs_actual ?? []}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title="PASO 7: SITUACIÓN ACTUAL"
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
    </>
  );
};
