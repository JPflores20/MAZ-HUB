/**
 * @fileoverview Fase 3 (CHECK / Verificación) del PDCA: rendimiento posterior, pruebas, nuevo Pareto y evolución KPI.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import type { ParetoItem, PruebaEjecutadaItem, NuevoPerformanceItem } from "@/domain/pdca";
import { ImageUploadSection } from "../image_upload";
import { TimeSeriesYTD } from "../plan/paso_7/time_series_ytd";
import type { ElementoSerieTemporal } from "../plan/paso_7/time_series_table";
import { ParetoSection } from "../plan/paso_10_pareto/pareto_section";
import { FlavorCorrelationSection } from "../plan/paso_11_flavor_correlation/flavor_correlation_section";
import type { DatosCorrelacionSabor } from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";
import { PruebasEjecutadasTable } from "./paso_23/pruebas_ejecutadas_table";

interface PropiedadesFaseCheck {
  final_time_series_data: ElementoSerieTemporal[];
  on_final_time_series_data_change: (nueva_serie: ElementoSerieTemporal[]) => void;
  final_time_series_unit: string;
  on_final_time_series_unit_change: (unidad: string) => void;
  final_time_series_title?: string | undefined;
  on_final_time_series_title_change?: ((titulo: string) => void) | undefined;
  final_time_series_ymin?: number | undefined;
  on_final_time_series_ymin_change?: ((minimo: number) => void) | undefined;
  final_time_series_ymax?: string | undefined;
  on_final_time_series_ymax_change?: ((maximo: string) => void) | undefined;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
  nuevo_performance_image?: string | undefined;
  on_nuevo_performance_image_change?: ((imagen_url?: string) => void) | undefined;
  nuevo_pareto_image?: string | undefined;
  on_nuevo_pareto_image_change?: ((imagen_url?: string) => void) | undefined;
  nueva_correlacion_image?: string | undefined;
  on_nueva_correlacion_image_change?: ((imagen_url?: string) => void) | undefined;
  mapeo_proceso_image?: string | undefined;
  on_mapeo_proceso_image_change?: ((imagen_url?: string) => void) | undefined;
  pruebas_ejecutadas?: PruebaEjecutadaItem[] | undefined;
  on_pruebas_ejecutadas_change?: ((pruebas: PruebaEjecutadaItem[]) => void) | undefined;
  nuevo_performance?: NuevoPerformanceItem[] | undefined;
  on_nuevo_performance_change?: ((items: NuevoPerformanceItem[]) => void) | undefined;
  nuevo_pareto_drill_downs?: string[] | undefined;
  on_nuevo_pareto_drill_downs_change?: ((niveles: string[]) => void) | undefined;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  on_nuevo_pareto_data_map_change?: ((mapa: Record<string, ParetoItem[]>) => void) | undefined;
  nuevo_pareto_unit?: string | undefined;
  on_nuevo_pareto_unit_change?: ((unidad: string) => void) | undefined;
  nuevo_pareto_titles?: Record<string, string> | undefined;
  on_nuevo_pareto_titles_change?: ((titulos: Record<string, string>) => void) | undefined;
  has_nueva_correlacion?: boolean | undefined;
  on_has_nueva_correlacion_change?: ((activo: boolean) => void) | undefined;
  nueva_correlacion_data?: DatosCorrelacionSabor | null | undefined;
  on_nueva_correlacion_data_change?: ((datos: DatosCorrelacionSabor) => void) | undefined;
  on_force_save?: (() => void) | undefined;
}

/**
 * Orquesta los Pasos 22 al 27 correspondientes a la verificación post-implementación (CHECK).
 */
export const PdcaPhaseCheck: React.FC<PropiedadesFaseCheck> = ({
  final_time_series_data,
  on_final_time_series_data_change,
  final_time_series_unit,
  on_final_time_series_unit_change,
  final_time_series_title,
  on_final_time_series_title_change,
  final_time_series_ymin,
  on_final_time_series_ymin_change,
  final_time_series_ymax,
  on_final_time_series_ymax_change,
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
  nuevo_performance_image,
  on_nuevo_performance_image_change,
  mapeo_proceso_image,
  on_mapeo_proceso_image_change,
  pruebas_ejecutadas,
  on_pruebas_ejecutadas_change,
  nuevo_pareto_drill_downs,
  on_nuevo_pareto_drill_downs_change,
  nuevo_pareto_data_map,
  on_nuevo_pareto_data_map_change,
  nuevo_pareto_unit,
  on_nuevo_pareto_unit_change,
  nuevo_pareto_titles,
  on_nuevo_pareto_titles_change,
  nueva_correlacion_data,
  on_nueva_correlacion_data_change,
  on_force_save,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <ImageUploadSection
        image={nuevo_performance_image || null}
        onChange={(imagen_url) => on_nuevo_performance_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPhases.check.step21.title")}
        subtitle={translate("pdcaPhases.check.step21.subtitle")}
        isStepCompleted={completed_steps.has("step-22")}
        onToggleStep={() => on_toggle_step("step-22")}
        isNa={na_steps?.has("step-22")}
        onToggleNa={() => on_toggle_na?.("step-22")}
      />

      <ImageUploadSection
        image={mapeo_proceso_image || null}
        onChange={(imagen_url) => on_mapeo_proceso_image_change?.(imagen_url || undefined)}
        title={translate("pdcaPhases.check.step22.title")}
        subtitle={translate("pdcaPhases.check.step22.subtitle")}
        isStepCompleted={completed_steps.has("step-23")}
        onToggleStep={() => on_toggle_step("step-23")}
        isNa={na_steps?.has("step-23")}
        onToggleNa={() => on_toggle_na?.("step-23")}
      />

      <PruebasEjecutadasTable
        items={pruebas_ejecutadas || []}
        onChange={(registros) => on_pruebas_ejecutadas_change?.(registros)}
        isStepCompleted={completed_steps.has("step-24")}
        onToggleStep={() => on_toggle_step("step-24")}
        isNa={na_steps?.has("step-24")}
        onToggleNa={() => on_toggle_na?.("step-24")}
      />

      <ParetoSection
        drill_downs={nuevo_pareto_drill_downs || []}
        set_drill_downs={(niveles) => on_nuevo_pareto_drill_downs_change?.(niveles)}
        data_map={nuevo_pareto_data_map || {}}
        set_data_map={(mapa) => on_nuevo_pareto_data_map_change?.(mapa)}
        unit={nuevo_pareto_unit || ""}
        on_unit_change={on_nuevo_pareto_unit_change}
        is_step_completed={completed_steps.has("step-25")}
        on_toggle_step={() => on_toggle_step("step-25")}
        is_na={na_steps?.has("step-25")}
        on_toggle_na={() => on_toggle_na?.("step-25")}
        pareto_titles={nuevo_pareto_titles}
        on_pareto_titles_change={on_nuevo_pareto_titles_change}
        main_title={translate("pdcaPhases.check.step24.mainTitle")}
        secondary_title_prefix={translate("pdcaPhases.check.step24.secondaryTitlePrefix")}
      />

      <FlavorCorrelationSection
        title={translate("pdcaPhases.check.step25.title")}
        data={nueva_correlacion_data}
        onChange={on_nueva_correlacion_data_change}
        onForceSave={on_force_save}
        isStepCompleted={completed_steps.has("step-26")}
        onToggleStep={() => on_toggle_step("step-26")}
        isNa={na_steps?.has("step-26")}
        onToggleNa={() => on_toggle_na?.("step-26")}
      />

      <TimeSeriesYTD
        value={final_time_series_data}
        onChange={on_final_time_series_data_change}
        unit={final_time_series_unit}
        onUnitChange={on_final_time_series_unit_change}
        title={translate("pdcaPhases.check.step26.title")}
        chartTitle={final_time_series_title}
        onTitleChange={on_final_time_series_title_change}
        yMin={final_time_series_ymin}
        onYMinChange={on_final_time_series_ymin_change}
        yMax={final_time_series_ymax}
        onYMaxChange={on_final_time_series_ymax_change}
        isStepCompleted={completed_steps.has("step-27")}
        onToggleStep={() => on_toggle_step("step-27")}
        isNa={na_steps?.has("step-27")}
        onToggleNa={() => on_toggle_na?.("step-27")}
      />
    </div>
  );
};
