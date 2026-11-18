/**
 * @fileoverview Bloque superior de la Subfase 1.2 (Pasos 8 al 13: Línea Base, Datos, Pareto, Correlación, Specs y Benchmark).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageUploadSection } from "../image_upload";
import { ColeccionDatosTable } from "./paso_9/coleccion_datos_table";
import { ParetoSection } from "./paso_10_pareto/pareto_section";
import { Subphase2FlavorToggle } from "./subphase_2_flavor_toggle";
import type { PhasePlanProps } from "./phase_plan_types";

/**
 * Agrupa los pasos de análisis cuantitativo previo y referencias de proceso (Pasos 8 a 13).
 */
export const Subphase2UpperSteps: React.FC<PhasePlanProps> = ({
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
  is_admin_user,
  is_editable = true,
  baseline_image,
  on_baseline_image_change,
  coleccion_datos,
  on_coleccion_datos_change,
  pareto_drill_downs,
  on_pareto_drill_downs_change,
  pareto_data_map,
  on_pareto_data_map_change,
  pareto_unit,
  on_pareto_unit_change,
  pareto_titles,
  on_pareto_titles_change,
  has_flavor_correlation,
  set_has_flavor_correlation,
  flavor_correlation_data,
  on_flavor_correlation_data_change,
  on_force_save,
  especificacion_procesos_image,
  on_especificacion_procesos_image_change,
  benchmark_image,
  on_benchmark_image_change,
}) => {
  const { t: translate } = useTranslation();
  const puede_editar_correlacion = is_admin_user || is_editable !== false;

  return (
    <>
      <ImageUploadSection
        image={baseline_image || null}
        onChange={(imagen_url) => on_baseline_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPlan.step8Title")}
        subtitle={translate("pdcaPlan.step8Subtitle")}
        isStepCompleted={completed_steps.has("step-7")}
        onToggleStep={() => on_toggle_step("step-7")}
        isNa={na_steps?.has("step-7")}
        onToggleNa={() => on_toggle_na?.("step-7")}
      />

      <ColeccionDatosTable
        items={coleccion_datos || []}
        onChange={(registros) => on_coleccion_datos_change?.(registros)}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
        isNa={na_steps?.has("step-8")}
        onToggleNa={() => on_toggle_na?.("step-8")}
      />

      <ParetoSection
        drill_downs={pareto_drill_downs || []}
        set_drill_downs={(niveles) => on_pareto_drill_downs_change?.(niveles)}
        data_map={pareto_data_map || {}}
        set_data_map={(mapa) => on_pareto_data_map_change?.(mapa)}
        unit={pareto_unit || ""}
        on_unit_change={on_pareto_unit_change}
        pareto_titles={pareto_titles}
        on_pareto_titles_change={on_pareto_titles_change}
        is_step_completed={completed_steps.has("step-9")}
        on_toggle_step={() => on_toggle_step("step-9")}
        is_na={na_steps?.has("step-9")}
        on_toggle_na={() => on_toggle_na?.("step-9")}
      />

      <Subphase2FlavorToggle
        has_flavor_correlation={has_flavor_correlation}
        set_has_flavor_correlation={set_has_flavor_correlation}
        flavor_correlation_data={flavor_correlation_data}
        on_flavor_correlation_data_change={on_flavor_correlation_data_change}
        on_force_save={on_force_save}
        can_edit_correlation={puede_editar_correlacion}
        is_step_completed={completed_steps.has("step-flavor")}
        is_na={na_steps?.has("step-flavor")}
        on_toggle_step={() => on_toggle_step("step-flavor")}
        on_toggle_na={() => on_toggle_na?.("step-flavor")}
      />

      <ImageUploadSection
        image={especificacion_procesos_image || null}
        onChange={(imagen_url) =>
          on_especificacion_procesos_image_change?.(imagen_url || undefined)
        }
        title={translate("pdcaPlan.step12Title")}
        subtitle={translate("pdcaPlan.step12Subtitle")}
        isStepCompleted={completed_steps.has("step-10")}
        onToggleStep={() => on_toggle_step("step-10")}
        isNa={na_steps?.has("step-10")}
        onToggleNa={() => on_toggle_na?.("step-10")}
      />

      <ImageUploadSection
        image={benchmark_image || null}
        onChange={(imagen_url) => on_benchmark_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPlan.step13Title")}
        subtitle={translate("pdcaPlan.step13Subtitle")}
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
        isNa={na_steps?.has("step-11")}
        onToggleNa={() => on_toggle_na?.("step-11")}
      />
    </>
  );
};
