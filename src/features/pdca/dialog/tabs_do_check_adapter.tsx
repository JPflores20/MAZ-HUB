/**
 * @fileoverview Adaptadores de pestañas DO y CHECK conectando el estado unificado del diálogo PDCA.
 */
import React from "react";
import { PdcaPhaseDo } from "../do/pdca_phase_do";
import { PdcaPhaseCheck } from "../check/pdca_phase_check";
import type { EstadoDialogoPdca } from "../hooks/use_pdca_dialog_state";
import type { ControlAutoguardadoPdca } from "../hooks/use_pdca_autosave";

interface PropiedadesAdaptadorDoCheck {
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  al_alternar_paso: (paso_id: string) => void;
  al_alternar_no_aplica: (paso_id: string) => void;
}

/**
 * Conecta el estado editable de ejecución (DO) marcando cambios locales pendientes.
 */
export const TabsDoAdapter: React.FC<PropiedadesAdaptadorDoCheck> = ({
  estado_dialogo,
  auto_guardado,
  al_alternar_paso,
  al_alternar_no_aplica,
}) => {
  const vincular = <TValor,>(actualizar_estado: (valor: TValor) => void) => (valor: TValor) => {
    actualizar_estado(valor);
    auto_guardado.mark_as_modified();
  };

  return (
    <PdcaPhaseDo
      action_items={estado_dialogo.action_items}
      on_action_items_change={vincular(estado_dialogo.set_action_items)}
      evidencias_solucion={estado_dialogo.evidencias_solucion}
      on_evidencias_solucion_change={vincular(estado_dialogo.set_evidencias_solucion)}
      kpi_tree_foco_image={estado_dialogo.kpi_tree_foco_image}
      on_kpi_tree_foco_image_change={vincular(estado_dialogo.set_kpi_tree_foco_image)}
      completed_steps={estado_dialogo.completed_steps}
      na_steps={estado_dialogo.na_steps}
      on_toggle_step={al_alternar_paso}
      on_toggle_na={al_alternar_no_aplica}
    />
  );
};

/**
 * Conecta el estado editable de verificación (CHECK) incluyendo nuevo Pareto, pruebas y correlación.
 */
export const TabsCheckAdapter: React.FC<PropiedadesAdaptadorDoCheck> = ({
  estado_dialogo,
  auto_guardado,
  al_alternar_paso,
  al_alternar_no_aplica,
}) => {
  const vincular = <TValor,>(actualizar_estado: (valor: TValor) => void) => (valor: TValor) => {
    actualizar_estado(valor);
    auto_guardado.mark_as_modified();
  };

  return (
    <PdcaPhaseCheck
      final_time_series_data={estado_dialogo.final_time_series_data}
      on_final_time_series_data_change={vincular(estado_dialogo.set_final_time_series_data)}
      final_time_series_unit={estado_dialogo.final_time_series_unit}
      on_final_time_series_unit_change={vincular(estado_dialogo.set_final_time_series_unit)}
      final_time_series_title={estado_dialogo.final_time_series_title}
      on_final_time_series_title_change={vincular(estado_dialogo.set_final_time_series_title)}
      final_time_series_ymin={estado_dialogo.final_time_series_ymin}
      on_final_time_series_ymin_change={vincular(estado_dialogo.set_final_time_series_ymin)}
      final_time_series_ymax={estado_dialogo.final_time_series_ymax}
      on_final_time_series_ymax_change={vincular(estado_dialogo.set_final_time_series_ymax)}
      completed_steps={estado_dialogo.completed_steps}
      na_steps={estado_dialogo.na_steps}
      on_toggle_step={al_alternar_paso}
      on_toggle_na={al_alternar_no_aplica}
      mapeo_proceso_image={estado_dialogo.mapeo_proceso_image}
      on_mapeo_proceso_image_change={vincular(estado_dialogo.set_mapeo_proceso_image)}
      pruebas_ejecutadas={estado_dialogo.pruebas_ejecutadas}
      on_pruebas_ejecutadas_change={vincular(estado_dialogo.set_pruebas_ejecutadas)}
      nuevo_performance_image={estado_dialogo.nuevo_performance_image}
      on_nuevo_performance_image_change={vincular(estado_dialogo.set_nuevo_performance_image)}
      nuevo_pareto_drill_downs={estado_dialogo.nuevo_pareto_drill_downs}
      on_nuevo_pareto_drill_downs_change={vincular(estado_dialogo.set_nuevo_pareto_drill_downs)}
      nuevo_pareto_data_map={estado_dialogo.nuevo_pareto_data_map}
      on_nuevo_pareto_data_map_change={vincular(estado_dialogo.set_nuevo_pareto_data_map)}
      nuevo_pareto_unit={estado_dialogo.nuevo_pareto_unit}
      on_nuevo_pareto_unit_change={vincular(estado_dialogo.set_nuevo_pareto_unit)}
      nuevo_pareto_titles={estado_dialogo.nuevo_pareto_titles}
      on_nuevo_pareto_titles_change={vincular(estado_dialogo.set_nuevo_pareto_titles)}
      has_nueva_correlacion={estado_dialogo.has_nueva_correlacion}
      on_has_nueva_correlacion_change={vincular(estado_dialogo.set_has_nueva_correlacion)}
      nueva_correlacion_data={estado_dialogo.nueva_correlacion_data}
      on_nueva_correlacion_data_change={vincular(estado_dialogo.set_nueva_correlacion_data)}
      on_force_save={() => void auto_guardado.handle_save_to_firestore()}
      nuevo_performance={estado_dialogo.nuevo_performance}
      on_nuevo_performance_change={vincular(estado_dialogo.set_nuevo_performance)}
    />
  );
};
