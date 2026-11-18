/**
 * @fileoverview Fase 4 (ACT / Estandarización) del PDCA: SOPs, entrenamiento, control, lecciones y conclusiones.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import type {
  ConclusionesKpiData,
  ConclusionesPiItem,
  TablaEstandarizacionItem,
} from "@/domain/pdca";
import { StepCard } from "@/shared/ui/step_card";
import { RichTextEditor } from "@/shared/ui/rich_text_editor";
import { ImageUploadSection } from "../image_upload";
import {
  AnalisisRiesgosProcesoTable,
  type AnalisisRiesgoProcesoItem,
} from "../plan/paso_6/analisis_riesgos_proceso_table";
import { ConclusionesStep } from "../resumen/conclusiones_step";
import { TablaEstandarizacion } from "./paso_27/tabla_estandarizacion";

interface PropiedadesFaseAct {
  tabla_estandarizacion: TablaEstandarizacionItem[];
  on_tabla_estandarizacion_change: (nuevos_registros: TablaEstandarizacionItem[]) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
  is_editable: boolean;
  sops_documentos_image?: string | undefined;
  on_sops_documentos_image_change?: ((imagen_url?: string) => void) | undefined;
  plan_entrenamiento_image?: string | undefined;
  on_plan_entrenamiento_image_change?: ((imagen_url?: string) => void) | undefined;
  plan_control_image?: string | undefined;
  on_plan_control_image_change?: ((imagen_url?: string) => void) | undefined;
  lecciones_aprendidas?: string | undefined;
  on_lecciones_aprendidas_change?: ((texto: string) => void) | undefined;
  conclusiones_finales?: string | undefined;
  conclusiones_storyboard_image?: string | undefined;
  on_conclusiones_storyboard_image_change?: ((imagen_url?: string) => void) | undefined;
  on_conclusiones_finales_change?: ((texto: string) => void) | undefined;
  conclusiones_kpi_data?: ConclusionesKpiData | undefined;
  on_conclusiones_kpi_data_change?: ((datos: ConclusionesKpiData) => void) | undefined;
  conclusiones_pi_items?: ConclusionesPiItem[] | undefined;
  on_conclusiones_pi_items_change?: ((registros: ConclusionesPiItem[]) => void) | undefined;
  analisis_riesgos_estandarizacion?: AnalisisRiesgoProcesoItem[] | undefined;
  on_analisis_riesgos_estandarizacion_change?:
    | ((registros: AnalisisRiesgoProcesoItem[]) => void)
    | undefined;
}

/**
 * Coordina los Pasos 28 al 34 de estandarización, documentación y cierre ejecutivo (ACT).
 */
export const PdcaPhaseAct: React.FC<PropiedadesFaseAct> = ({
  tabla_estandarizacion,
  on_tabla_estandarizacion_change,
  analisis_riesgos_estandarizacion,
  on_analisis_riesgos_estandarizacion_change,
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
  is_editable,
  sops_documentos_image,
  on_sops_documentos_image_change,
  plan_entrenamiento_image,
  on_plan_entrenamiento_image_change,
  plan_control_image,
  on_plan_control_image_change,
  lecciones_aprendidas,
  on_lecciones_aprendidas_change,
  conclusiones_finales,
  on_conclusiones_finales_change,
  conclusiones_storyboard_image,
  on_conclusiones_storyboard_image_change,
  conclusiones_kpi_data,
  on_conclusiones_kpi_data_change,
  conclusiones_pi_items,
  on_conclusiones_pi_items_change,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <StepCard
        title={translate("pdcaPhases.act.step27.title")}
        isStepCompleted={completed_steps.has("step-28")}
        onToggleStep={() => on_toggle_step("step-28")}
        isNa={na_steps?.has("step-28")}
        onToggleNa={() => on_toggle_na?.("step-28")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={on_tabla_estandarizacion_change}
        />
      </StepCard>

      <StepCard
        title={translate("pdcaPhases.act.step28.title")}
        isStepCompleted={completed_steps.has("step-29")}
        onToggleStep={() => on_toggle_step("step-29")}
        isNa={na_steps?.has("step-29")}
        onToggleNa={() => on_toggle_na?.("step-29")}
      >
        <AnalisisRiesgosProcesoTable
          items={analisis_riesgos_estandarizacion || []}
          onChange={(registros) => on_analisis_riesgos_estandarizacion_change?.(registros)}
        />
      </StepCard>

      <ImageUploadSection
        image={sops_documentos_image || null}
        onChange={(imagen_url) => on_sops_documentos_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPhases.act.step29.title")}
        subtitle={translate("pdcaPhases.act.step29.subtitle")}
        isStepCompleted={completed_steps.has("step-30")}
        onToggleStep={() => on_toggle_step("step-30")}
        isNa={na_steps?.has("step-30")}
        onToggleNa={() => on_toggle_na?.("step-30")}
      />

      <ImageUploadSection
        image={plan_entrenamiento_image || null}
        onChange={(imagen_url) => on_plan_entrenamiento_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPhases.act.step30.title")}
        subtitle={translate("pdcaPhases.act.step30.subtitle")}
        isStepCompleted={completed_steps.has("step-31")}
        onToggleStep={() => on_toggle_step("step-31")}
        isNa={na_steps?.has("step-31")}
        onToggleNa={() => on_toggle_na?.("step-31")}
      />

      <ImageUploadSection
        image={plan_control_image || null}
        onChange={(imagen_url) => on_plan_control_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPhases.act.step31.title")}
        subtitle={translate("pdcaPhases.act.step31.subtitle")}
        isStepCompleted={completed_steps.has("step-32")}
        onToggleStep={() => on_toggle_step("step-32")}
        isNa={na_steps?.has("step-32")}
        onToggleNa={() => on_toggle_na?.("step-32")}
      />

      <StepCard
        title={translate("pdcaPhases.act.step32.title")}
        isStepCompleted={completed_steps.has("step-33")}
        onToggleStep={() => on_toggle_step("step-33")}
        isNa={na_steps?.has("step-33")}
        onToggleNa={() => on_toggle_na?.("step-33")}
      >
        <div className="p-4 space-y-3">
          <RichTextEditor
            value={lecciones_aprendidas || ""}
            onChange={(html) => on_lecciones_aprendidas_change?.(html)}
            disabled={!is_editable}
            placeholder={translate("pdcaPhases.act.step32.placeholder")}
            minHeight="140px"
          />
        </div>
      </StepCard>

      <ConclusionesStep
        isStepCompleted={completed_steps.has("step-34")}
        onToggleStep={() => on_toggle_step("step-34")}
        isNa={na_steps?.has("step-34") ?? false}
        onToggleNa={() => on_toggle_na?.("step-34")}
        isEditable={is_editable}
        kpiData={conclusiones_kpi_data}
        onKpiDataChange={(datos_kpi) => on_conclusiones_kpi_data_change?.(datos_kpi)}
        piItems={conclusiones_pi_items || []}
        onPiItemsChange={(registros_pi) => on_conclusiones_pi_items_change?.(registros_pi)}
        storyboardHtml={conclusiones_finales}
        onStoryboardHtmlChange={(html) => on_conclusiones_finales_change?.(html)}
        storyboardImage={conclusiones_storyboard_image}
        onStoryboardImageChange={(imagen_url) => on_conclusiones_storyboard_image_change?.(imagen_url)}
      />
    </div>
  );
};
