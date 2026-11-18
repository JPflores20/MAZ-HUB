/**
 * @fileoverview Subfase 1.2 de PLAN (Análisis de Causa Raíz): agrupa Pasos 8 al 18 del PDCA.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RendimientoActualStep } from "./paso_14_rendimiento/rendimiento_actual_step";
import { GopThemesSection } from "./paso_15_gop_themes/gop_themes_section";
import { IshikawaSection } from "./paso_16_ishikawa/ishikawa_section";
import { FiveWhysSection } from "./paso_17_five_whys/five_whys_section";
import { ConclusionesCausaRaizTable } from "./paso_18_conclusiones/conclusiones_causa_raiz_table";
import { Subphase2UpperSteps } from "./subphase_2_upper_steps";
import {
  construir_conclusiones_desde_5_porques,
  construir_tablas_5_porques_desde_ishikawa,
} from "./subphase_2_helpers";
import type { PhasePlanProps } from "./phase_plan_types";

/**
 * Orquesta Pasos 8-13 y los pasos de análisis de causa raíz (PIs, GOPs, Ishikawa, 5 Why's y Causas Raíz).
 */
export const Subphase2: React.FC<PhasePlanProps> = (props) => {
  const { t: translate } = useTranslation();
  const {
    completed_steps,
    na_steps,
    on_toggle_step,
    on_toggle_na,
    rendimiento_actual_pis,
    on_rendimiento_actual_pis_change,
    rendimiento_actual_image,
    on_rendimiento_actual_image_change,
    gop_themes_data,
    on_gop_themes_data_change,
    ishikawas,
    on_ishikawas_change,
    five_whys_tables,
    on_five_whys_tables_change,
    conclusiones_causa_raiz,
    on_conclusiones_causa_raiz_change,
    on_send_root_causes_to_action_plan,
  } = props;

  const manejar_envio_ishikawa_5_porques = (causas_priorizadas_texto: string[]) => {
    if (!on_five_whys_tables_change) return;
    const { tablas_actualizadas, cantidad_agregadas } = construir_tablas_5_porques_desde_ishikawa(
      Array.isArray(five_whys_tables) ? five_whys_tables : [],
      causas_priorizadas_texto,
    );
    if (cantidad_agregadas === 0) {
      toast.info("Las causas seleccionadas ya se encuentran en la tabla de 5 Porqués.");
      return;
    }
    on_five_whys_tables_change(tablas_actualizadas);
    toast.success(
      `Se enviaron ${cantidad_agregadas} causa(s) priorizada(s) al Paso 17 (5 Why's).`,
    );
  };

  const manejar_envio_5_porques_conclusiones = (
    hallazgos: { problema: string; causaRaiz: string; accion: string }[],
  ) => {
    if (!on_conclusiones_causa_raiz_change) return;
    const { conclusiones_actualizadas, cantidad_agregadas } =
      construir_conclusiones_desde_5_porques(
        Array.isArray(conclusiones_causa_raiz) ? conclusiones_causa_raiz : [],
        hallazgos,
      );
    if (cantidad_agregadas === 0) {
      toast.info("Estas causas raíz ya fueron agregadas al Paso 18.");
      return;
    }
    on_conclusiones_causa_raiz_change(conclusiones_actualizadas);
    toast.success(`Se enviaron ${cantidad_agregadas} causa(s) raíz al Paso 18.`);
  };

  return (
    <div className="space-y-6">
      <Subphase2UpperSteps {...props} />

      <RendimientoActualStep
        items={rendimiento_actual_pis || []}
        onChange={(indicadores) => on_rendimiento_actual_pis_change?.(indicadores)}
        image={rendimiento_actual_image}
        onImageChange={(imagen_url) => on_rendimiento_actual_image_change?.(imagen_url)}
        isStepCompleted={completed_steps.has("step-13")}
        onToggleStep={() => on_toggle_step("step-13")}
        isNa={na_steps?.has("step-13")}
        onToggleNa={() => on_toggle_na?.("step-13")}
      />

      <GopThemesSection
        data={gop_themes_data || []}
        onChange={(temas) => on_gop_themes_data_change?.(temas)}
        isStepCompleted={completed_steps.has("step-gops")}
        onToggleStep={() => on_toggle_step("step-gops")}
        isNa={na_steps?.has("step-gops")}
        onToggleNa={() => on_toggle_na?.("step-gops")}
      />

      <IshikawaSection
        ishikawas={ishikawas || []}
        onChange={(diagramas) => on_ishikawas_change?.(diagramas)}
        onSendToFiveWhys={manejar_envio_ishikawa_5_porques}
        isStepCompleted={completed_steps.has("step-14")}
        onToggleStep={() => on_toggle_step("step-14")}
        isNa={na_steps?.has("step-14")}
        onToggleNa={() => on_toggle_na?.("step-14")}
      />

      <FiveWhysSection
        tables={five_whys_tables || []}
        onChange={(tablas) => on_five_whys_tables_change?.(tablas)}
        onSendToConclusions={manejar_envio_5_porques_conclusiones}
        isStepCompleted={completed_steps.has("step-15")}
        onToggleStep={() => on_toggle_step("step-15")}
        isNa={na_steps?.has("step-15")}
        onToggleNa={() => on_toggle_na?.("step-15")}
      />

      <ConclusionesCausaRaizTable
        title={translate("pdcaPlan.step18Title")}
        items={conclusiones_causa_raiz || []}
        onChange={(conclusiones) => on_conclusiones_causa_raiz_change?.(conclusiones)}
        onSendToActionPlan={on_send_root_causes_to_action_plan}
        isStepCompleted={completed_steps.has("step-17")}
        onToggleStep={() => on_toggle_step("step-17")}
        isNa={na_steps?.has("step-17")}
        onToggleNa={() => on_toggle_na?.("step-17")}
      />
    </div>
  );
};
