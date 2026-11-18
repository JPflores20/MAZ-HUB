/**
 * @fileoverview Renderizador principal por fase montada dentro del editor PDCA y panel de comentarios/historial.
 */
import React from "react";
import { TabContainer } from "../utils/pdca_tab_container";
import { PdcaPhaseResumen } from "../resumen/pdca_phase_resumen";
import type { UsuarioPlan } from "../plan/phase_plan_types";
import type { EstadoDialogoPdca } from "../hooks/use_pdca_dialog_state";
import type { ControlAutoguardadoPdca } from "../hooks/use_pdca_autosave";
import { TabsPlanAdapter } from "./tabs_plan_adapter";
import { TabsCheckAdapter, TabsDoAdapter } from "./tabs_do_check_adapter";
import { TabsActAdapter, TabsEvaluacionR2d2Adapter } from "./tabs_act_eval_adapter";
import { PdcaBottomFeedbackPanel } from "./pdca_bottom_feedback_panel";

export interface PropiedadesRenderizadorPestanas {
  pestanas_montadas: Set<string>;
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  es_administrador: boolean;
  usuario_autenticado: { name?: string; email?: string } | null;
  usuarios_disponibles: UsuarioPlan[];
  progreso_calculado: number;
  es_editable: boolean;
  al_alternar_paso: (paso_id: string) => void;
  al_alternar_no_aplica: (paso_id: string) => void;
}

/**
 * Monta perezosamente cada fase (Resumen, Plan, Do, Check, Act, Evaluación R2D2) manteniendo estado activo.
 */
export const RenderizadorPestanasPdca: React.FC<PropiedadesRenderizadorPestanas> = ({
  pestanas_montadas,
  estado_dialogo,
  auto_guardado,
  es_administrador,
  usuario_autenticado,
  usuarios_disponibles,
  progreso_calculado,
  es_editable,
  al_alternar_paso,
  al_alternar_no_aplica,
}) => (
  <>
    {pestanas_montadas.has("Resumen") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Resumen"}>
        <PdcaPhaseResumen
          pdca_title={estado_dialogo.title_value || "Reporte PDCA"}
          document_identifier={estado_dialogo.document_identifier || estado_dialogo.id}
          goal_definition={estado_dialogo.definition_goal}
          vpo_checkpoints={estado_dialogo.vpo_checkpoints}
          pareto_data_map={estado_dialogo.pareto_data_map}
          nuevo_pareto_data_map={estado_dialogo.nuevo_pareto_data_map}
          impact_matrix={estado_dialogo.impact_matrix}
          final_time_series_data={estado_dialogo.final_time_series_data}
          progreso={progreso_calculado}
          action_items={estado_dialogo.action_items}
          assigned_users={estado_dialogo.assigned_users}
          flavor_correlation_data={estado_dialogo.flavor_correlation_data}
          nueva_correlacion_data={estado_dialogo.nueva_correlacion_data}
          has_flavor_correlation={estado_dialogo.has_flavor_correlation}
          has_nueva_correlacion={estado_dialogo.has_nueva_correlacion}
          five_whys_tables={estado_dialogo.five_whys_tables}
          conclusiones_causa_raiz={estado_dialogo.conclusiones_causa_raiz}
        />
      </TabContainer>
    )}

    {pestanas_montadas.has("Plan") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Plan"}>
        <TabsPlanAdapter
          estado_dialogo={estado_dialogo}
          auto_guardado={auto_guardado}
          es_administrador={es_administrador}
          usuarios_disponibles={usuarios_disponibles}
          es_editable={es_editable}
          al_alternar_paso={al_alternar_paso}
          al_alternar_no_aplica={al_alternar_no_aplica}
        />
      </TabContainer>
    )}

    {pestanas_montadas.has("Do") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Do"}>
        <TabsDoAdapter
          estado_dialogo={estado_dialogo}
          auto_guardado={auto_guardado}
          al_alternar_paso={al_alternar_paso}
          al_alternar_no_aplica={al_alternar_no_aplica}
        />
      </TabContainer>
    )}

    {pestanas_montadas.has("Check") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Check"}>
        <TabsCheckAdapter
          estado_dialogo={estado_dialogo}
          auto_guardado={auto_guardado}
          al_alternar_paso={al_alternar_paso}
          al_alternar_no_aplica={al_alternar_no_aplica}
        />
      </TabContainer>
    )}

    {pestanas_montadas.has("Act") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Act"}>
        <TabsActAdapter
          estado_dialogo={estado_dialogo}
          auto_guardado={auto_guardado}
          es_editable={es_editable}
          al_alternar_paso={al_alternar_paso}
          al_alternar_no_aplica={al_alternar_no_aplica}
        />
      </TabContainer>
    )}

    {es_administrador && pestanas_montadas.has("Evaluacion") && (
      <TabContainer isActive={estado_dialogo.active_tab === "Evaluacion"}>
        <TabsEvaluacionR2d2Adapter
          estado_dialogo={estado_dialogo}
          auto_guardado={auto_guardado}
          es_editable={es_editable}
          usuario_autenticado={usuario_autenticado}
        />
      </TabContainer>
    )}

    <PdcaBottomFeedbackPanel
      estado_dialogo={estado_dialogo}
      auto_guardado={auto_guardado}
      es_editable={es_editable}
      usuario_autenticado={usuario_autenticado}
    />
  </>
);
