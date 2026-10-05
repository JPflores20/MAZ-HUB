import React from "react";
import { TabContainer } from "./utils/pdca-tab-container";
import { PdcaPhaseResumen } from "./RESUMEN/pdca_phase_resumen";
import { PdcaPhasePlan } from "./1.PLAN/pdca_phase_plan";
import { PdcaPhaseDo } from "./2.DO/pdca_phase_do";
import { PdcaPhaseCheck } from "./3.CHECK/pdca_phase_check";
import { PdcaPhaseAct } from "./4.ACT/pdca_phase_act";
import { PdcaItfR2d2 } from "./EVALUACION RD2D/pdca_itf_r2d2";
import { PdcaComments } from "./pdca-comments";
import { PdcaHistory } from "./pdca-history";

export interface PropiedadesRenderizadorPestanas {
  pestañasMontadas: Set<string>;
  estadoDialogo: any;
  autoGuardado: any;
  esAdministrador: boolean;
  usuarioAutenticado: any;
  usuariosDisponibles: any[];
  progresoCalculado: number;
  esEditable: boolean;
  alAlternarPaso: (idPaso: string) => void;
  alAlternarNoAplica: (idPaso: string) => void;
}

export const RenderizadorPestanasPdca: React.FC<PropiedadesRenderizadorPestanas> = ({
  pestañasMontadas,
  estadoDialogo,
  autoGuardado,
  esAdministrador,
  usuarioAutenticado,
  usuariosDisponibles,
  progresoCalculado,
  esEditable,
  alAlternarPaso,
  alAlternarNoAplica,
}) => {
  return (
    <>
      {pestañasMontadas.has("Resumen") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Resumen"}>
          <PdcaPhaseResumen
            goal_definition={estadoDialogo.definition_goal}
            vpo_checkpoints={estadoDialogo.vpo_checkpoints}
            pareto_data_map={estadoDialogo.pareto_data_map}
            nuevo_pareto_data_map={estadoDialogo.nuevo_pareto_data_map}
            impact_matrix={estadoDialogo.impact_matrix}
            final_time_series_data={estadoDialogo.final_time_series_data}
            progreso={progresoCalculado}
            action_items={estadoDialogo.action_items}
          />
        </TabContainer>
      )}

      {pestañasMontadas.has("Plan") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Plan"}>
          <PdcaPhasePlan
            title_value={estadoDialogo.title_value}
            on_title_change={(t) => { estadoDialogo.set_title_value(t); autoGuardado.mark_as_modified(); }}
            area_value={estadoDialogo.area_value}
            on_area_change={(a) => { estadoDialogo.set_area_value(a); autoGuardado.mark_as_modified(); }}
            deadline_date={estadoDialogo.deadline_date || new Date()}
            on_deadline_change={(d) => { estadoDialogo.set_deadline_date(d); autoGuardado.mark_as_modified(); }}
            author_name={estadoDialogo.author_name}
            author_email={estadoDialogo.author_email}
            on_author_change={(email, name) => { estadoDialogo.set_author_email(email); estadoDialogo.set_author_name(name); autoGuardado.mark_as_modified(); }}
            assigned_users={estadoDialogo.assigned_users}
            on_toggle_assigned_user={(u) => {
              const exists = estadoDialogo.assigned_users.some((a: any) => a.email === u.email);
              const next = exists
                ? estadoDialogo.assigned_users.filter((a: any) => a.email !== u.email)
                : [...estadoDialogo.assigned_users, u];
              estadoDialogo.set_assigned_users(next);
              autoGuardado.mark_as_modified();
            }}
            available_users={usuariosDisponibles}
            is_admin_user={esAdministrador}
            team_members_list={estadoDialogo.team_members}
            on_team_members_change={(m) => { estadoDialogo.set_team_members(m); autoGuardado.mark_as_modified(); }}
            problem_description={estadoDialogo.problem_value}
            on_problem_change={(v) => { estadoDialogo.set_problem_value(v); autoGuardado.mark_as_modified(); }}
            goal_definition={estadoDialogo.definition_goal}
            on_goal_definition_change={(g) => { estadoDialogo.set_definition_goal(g); autoGuardado.mark_as_modified(); }}
            participants_info={estadoDialogo.participants_data}
            on_participants_info_change={(p) => { estadoDialogo.set_participants_data(p); autoGuardado.mark_as_modified(); }}
            vpo_checkpoints={estadoDialogo.vpo_checkpoints}
            on_vpo_checkpoints_change={(c) => { estadoDialogo.set_vpo_checkpoints(c); autoGuardado.mark_as_modified(); }}
            completed_steps={estadoDialogo.completed_steps}
            na_steps={estadoDialogo.na_steps}
            on_toggle_step={alAlternarPaso}
            on_toggle_na={alAlternarNoAplica}
            is_editable={esEditable}
            process_mapping_files={estadoDialogo.process_mapping_files}
            on_process_mapping_files_change={(f) => { estadoDialogo.set_process_mapping_files(f); autoGuardado.mark_as_modified(); }}
            sipoc_map_files={estadoDialogo.sipoc_map_files}
            on_sipoc_map_files_change={(f) => { estadoDialogo.set_sipoc_map_files(f); autoGuardado.mark_as_modified(); }}
            baseline_image={estadoDialogo.baseline_image}
            on_baseline_image_change={(img) => { estadoDialogo.set_baseline_image(img); autoGuardado.mark_as_modified(); }}
            coleccion_datos={estadoDialogo.coleccion_datos}
            on_coleccion_datos_change={(d) => { estadoDialogo.set_coleccion_datos(d); autoGuardado.mark_as_modified(); }}
            pareto_drill_downs={estadoDialogo.pareto_drill_downs}
            on_pareto_drill_downs_change={(d) => { estadoDialogo.set_pareto_drill_downs(d); autoGuardado.mark_as_modified(); }}
            pareto_data_map={estadoDialogo.pareto_data_map}
            on_pareto_data_map_change={(m) => { estadoDialogo.set_pareto_data_map(m); autoGuardado.mark_as_modified(); }}
            pareto_unit={estadoDialogo.pareto_unit}
            on_pareto_unit_change={(u) => { estadoDialogo.set_pareto_unit(u); autoGuardado.mark_as_modified(); }}
            pareto_titles={estadoDialogo.pareto_titles}
            on_pareto_titles_change={(t) => { estadoDialogo.set_pareto_titles(t); autoGuardado.mark_as_modified(); }}
            target_vs_actual={estadoDialogo.target_vs_actual}
            on_target_vs_actual_change={(t) => { estadoDialogo.set_target_vs_actual(t); autoGuardado.mark_as_modified(); }}
            target_vs_actual_unit={estadoDialogo.target_vs_actual_unit}
            on_target_vs_actual_unit_change={(u) => { estadoDialogo.set_target_vs_actual_unit(u); autoGuardado.mark_as_modified(); }}
            target_vs_actual_title={estadoDialogo.target_vs_actual_title}
            on_target_vs_actual_title_change={(t) => { estadoDialogo.set_target_vs_actual_title(t); autoGuardado.mark_as_modified(); }}
            target_vs_actual_ymin={estadoDialogo.target_vs_actual_ymin}
            on_target_vs_actual_ymin_change={(y) => { estadoDialogo.set_target_vs_actual_ymin(y); autoGuardado.mark_as_modified(); }}
            target_vs_actual_ymax={estadoDialogo.target_vs_actual_ymax}
            on_target_vs_actual_ymax_change={(y) => { estadoDialogo.set_target_vs_actual_ymax(y); autoGuardado.mark_as_modified(); }}
            ishikawas={estadoDialogo.ishikawas}
            on_ishikawas_change={(i) => { estadoDialogo.set_ishikawas(i); autoGuardado.mark_as_modified(); }}
            five_whys_tables={estadoDialogo.five_whys_tables}
            on_five_whys_tables_change={(w) => { estadoDialogo.set_five_whys_tables(w); autoGuardado.mark_as_modified(); }}
            voz_consumidor={estadoDialogo.voz_consumidor}
            on_voz_consumidor_change={(v) => { estadoDialogo.set_voz_consumidor(v); autoGuardado.mark_as_modified(); }}
            analisis_riesgos_proyecto={estadoDialogo.analisis_riesgos_proyecto}
            on_analisis_riesgos_proyecto_change={(a) => { estadoDialogo.set_analisis_riesgos_proyecto(a); autoGuardado.mark_as_modified(); }}
            especificacion_procesos_image={estadoDialogo.especificacion_procesos_image}
            on_especificacion_procesos_image_change={(img) => { estadoDialogo.set_especificacion_procesos_image(img); autoGuardado.mark_as_modified(); }}
            benchmark_image={estadoDialogo.benchmark_image}
            on_benchmark_image_change={(img) => { estadoDialogo.set_benchmark_image(img); autoGuardado.mark_as_modified(); }}
            conclusiones_causa_raiz={estadoDialogo.conclusiones_causa_raiz}
            on_conclusiones_causa_raiz_change={(c) => { estadoDialogo.set_conclusiones_causa_raiz(c); autoGuardado.mark_as_modified(); }}
            has_flavor_correlation={estadoDialogo.has_flavor_correlation}
            set_has_flavor_correlation={(val) => { estadoDialogo.set_has_flavor_correlation(val); autoGuardado.mark_as_modified(); }}
            flavor_correlation_data={estadoDialogo.flavor_correlation_data}
            on_force_save={() => autoGuardado.handle_save_to_firestore()}
            on_flavor_correlation_data_change={(val) => { estadoDialogo.set_flavor_correlation_data(val); autoGuardado.mark_as_modified(); }}
            rendimiento_actual_pis={estadoDialogo.rendimiento_actual_pis}
            on_rendimiento_actual_pis_change={(val) => { estadoDialogo.set_rendimiento_actual_pis(val); autoGuardado.mark_as_modified(); }}
            rendimiento_actual_image={estadoDialogo.rendimiento_actual_image}
            on_rendimiento_actual_image_change={(val) => { estadoDialogo.set_rendimiento_actual_image(val); autoGuardado.mark_as_modified(); }}
            gop_themes_data={estadoDialogo.gop_themes_data}
            on_gop_themes_data_change={(data) => { estadoDialogo.set_gop_themes_data(data); autoGuardado.mark_as_modified(); }}
          />
        </TabContainer>
      )}

      {pestañasMontadas.has("Do") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Do"}>
          <PdcaPhaseDo
            action_items={estadoDialogo.action_items}
            on_action_items_change={(a) => { estadoDialogo.set_action_items(a); autoGuardado.mark_as_modified(); }}
            evidencias_solucion={estadoDialogo.evidencias_solucion}
            on_evidencias_solucion_change={(evs) => { estadoDialogo.set_evidencias_solucion(evs); autoGuardado.mark_as_modified(); }}
            kpi_tree_foco_image={estadoDialogo.kpi_tree_foco_image}
            on_kpi_tree_foco_image_change={(img) => { estadoDialogo.set_kpi_tree_foco_image(img); autoGuardado.mark_as_modified(); }}
            completed_steps={estadoDialogo.completed_steps}
            na_steps={estadoDialogo.na_steps}
            on_toggle_step={alAlternarPaso}
            on_toggle_na={alAlternarNoAplica}
          />
        </TabContainer>
      )}

      {pestañasMontadas.has("Check") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Check"}>
          <PdcaPhaseCheck
            final_time_series_data={estadoDialogo.final_time_series_data}
            on_final_time_series_data_change={(k) => { estadoDialogo.set_final_time_series_data(k); autoGuardado.mark_as_modified(); }}
            final_time_series_unit={estadoDialogo.final_time_series_unit}
            on_final_time_series_unit_change={(u) => { estadoDialogo.set_final_time_series_unit(u); autoGuardado.mark_as_modified(); }}
            final_time_series_title={estadoDialogo.final_time_series_title}
            on_final_time_series_title_change={(t) => { estadoDialogo.set_final_time_series_title(t); autoGuardado.mark_as_modified(); }}
            final_time_series_ymin={estadoDialogo.final_time_series_ymin}
            on_final_time_series_ymin_change={(y) => { estadoDialogo.set_final_time_series_ymin(y); autoGuardado.mark_as_modified(); }}
            final_time_series_ymax={estadoDialogo.final_time_series_ymax}
            on_final_time_series_ymax_change={(y) => { estadoDialogo.set_final_time_series_ymax(y); autoGuardado.mark_as_modified(); }}
            completed_steps={estadoDialogo.completed_steps}
            na_steps={estadoDialogo.na_steps}
            on_toggle_step={alAlternarPaso}
            on_toggle_na={alAlternarNoAplica}
            mapeo_proceso_image={estadoDialogo.mapeo_proceso_image}
            on_mapeo_proceso_image_change={(img) => { estadoDialogo.set_mapeo_proceso_image(img); autoGuardado.mark_as_modified(); }}
            pruebas_ejecutadas={estadoDialogo.pruebas_ejecutadas}
            on_pruebas_ejecutadas_change={(p) => { estadoDialogo.set_pruebas_ejecutadas(p); autoGuardado.mark_as_modified(); }}
            nuevo_performance_image={estadoDialogo.nuevo_performance_image}
            on_nuevo_performance_image_change={(img) => { estadoDialogo.set_nuevo_performance_image(img); autoGuardado.mark_as_modified(); }}
            nuevo_pareto_drill_downs={estadoDialogo.nuevo_pareto_drill_downs}
            on_nuevo_pareto_drill_downs_change={(d) => { estadoDialogo.set_nuevo_pareto_drill_downs(d); autoGuardado.mark_as_modified(); }}
            nuevo_pareto_data_map={estadoDialogo.nuevo_pareto_data_map}
            on_nuevo_pareto_data_map_change={(m) => { estadoDialogo.set_nuevo_pareto_data_map(m); autoGuardado.mark_as_modified(); }}
            nuevo_pareto_unit={estadoDialogo.nuevo_pareto_unit}
            on_nuevo_pareto_unit_change={(u) => { estadoDialogo.set_nuevo_pareto_unit(u); autoGuardado.mark_as_modified(); }}
            nuevo_pareto_titles={estadoDialogo.nuevo_pareto_titles}
            on_nuevo_pareto_titles_change={(t) => { estadoDialogo.set_nuevo_pareto_titles(t); autoGuardado.mark_as_modified(); }}
            has_nueva_correlacion={estadoDialogo.has_nueva_correlacion}
            on_has_nueva_correlacion_change={(val) => { estadoDialogo.set_has_nueva_correlacion(val); autoGuardado.mark_as_modified(); }}
            nueva_correlacion_data={estadoDialogo.nueva_correlacion_data}
            on_nueva_correlacion_data_change={(d) => { estadoDialogo.set_nueva_correlacion_data(d); autoGuardado.mark_as_modified(); }}
            nuevo_performance={estadoDialogo.nuevo_performance}
            on_nuevo_performance_change={(n) => { estadoDialogo.set_nuevo_performance(n); autoGuardado.mark_as_modified(); }}
          />
        </TabContainer>
      )}

      {pestañasMontadas.has("Act") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Act"}>
          <div className="space-y-6">
            <PdcaPhaseAct
              analisis_riesgos_estandarizacion={estadoDialogo.analisis_riesgos_estandarizacion}
              on_analisis_riesgos_estandarizacion_change={(data) => { estadoDialogo.set_analisis_riesgos_estandarizacion(data); autoGuardado.mark_as_modified(); }}
              tabla_estandarizacion={estadoDialogo.tabla_estandarizacion}
              on_tabla_estandarizacion_change={(data) => { estadoDialogo.set_tabla_estandarizacion(data); autoGuardado.mark_as_modified(); }}
              completed_steps={estadoDialogo.completed_steps}
              na_steps={estadoDialogo.na_steps}
              on_toggle_step={alAlternarPaso}
              on_toggle_na={alAlternarNoAplica}
              is_editable={esEditable}
              sops_documentos_image={estadoDialogo.sops_documentos_image}
              on_sops_documentos_image_change={(img) => { estadoDialogo.set_sops_documentos_image(img); autoGuardado.mark_as_modified(); }}
              plan_entrenamiento_image={estadoDialogo.plan_entrenamiento_image}
              on_plan_entrenamiento_image_change={(img) => { estadoDialogo.set_plan_entrenamiento_image(img); autoGuardado.mark_as_modified(); }}
              plan_control_image={estadoDialogo.plan_control_image}
              on_plan_control_image_change={(img) => { estadoDialogo.set_plan_control_image(img); autoGuardado.mark_as_modified(); }}
              lecciones_aprendidas={estadoDialogo.lecciones_aprendidas}
              on_lecciones_aprendidas_change={(text) => { estadoDialogo.set_lecciones_aprendidas(text); autoGuardado.mark_as_modified(); }}
              conclusiones_finales={estadoDialogo.conclusiones_finales}
              conclusiones_storyboard_image={estadoDialogo.conclusiones_storyboard_image}
              on_conclusiones_storyboard_image_change={(img) => { estadoDialogo.set_conclusiones_storyboard_image(img); autoGuardado.mark_as_modified(); }}
              on_conclusiones_finales_change={(c) => { estadoDialogo.set_conclusiones_finales(c); autoGuardado.mark_as_modified(); }}
              conclusiones_kpi_data={estadoDialogo.conclusiones_kpi_data}
              on_conclusiones_kpi_data_change={(data) => { estadoDialogo.set_conclusiones_kpi_data(data); autoGuardado.mark_as_modified(); }}
              conclusiones_pi_items={estadoDialogo.conclusiones_pi_items}
              on_conclusiones_pi_items_change={(items) => { estadoDialogo.set_conclusiones_pi_items(items); autoGuardado.mark_as_modified(); }}
            />
          </div>
        </TabContainer>
      )}

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md ${estadoDialogo.bottom_tab === "comments" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => estadoDialogo.set_bottom_tab("comments")}
          >
            Comentarios
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md ${estadoDialogo.bottom_tab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => estadoDialogo.set_bottom_tab("history")}
          >
            Historial
          </button>
        </div>
        {estadoDialogo.bottom_tab === "comments" ? (
          <PdcaComments
            comments={estadoDialogo.comments_list}
            onAddComment={(text, stepTitle) => {
              const new_comment = {
                id: crypto.randomUUID(),
                userId: usuarioAutenticado?.email || "anonymous",
                userName: usuarioAutenticado?.name || "Usuario",
                text,
                timestamp: new Date().toISOString(),
                stepTitle,
              };
              estadoDialogo.set_comments_list([...estadoDialogo.comments_list, new_comment]);
              autoGuardado.mark_as_modified();
            }}
            onDeleteComment={(id) => {
              estadoDialogo.set_comments_list(estadoDialogo.comments_list.filter((c: any) => c.id !== id));
              autoGuardado.mark_as_modified();
            }}
          />
        ) : (
          <PdcaHistory history={estadoDialogo.history_events} />
        )}
      </div>

      {esAdministrador && pestañasMontadas.has("Evaluacion") && (
        <TabContainer isActive={estadoDialogo.active_tab === "Evaluacion"}>
          <PdcaItfR2d2
            evaluation={estadoDialogo.itf_r2d2_evaluation}
            onChange={(ev) => { estadoDialogo.set_itf_r2d2_evaluation(ev); autoGuardado.mark_as_modified(); }}
            disabled={!esEditable}
            currentUser={usuarioAutenticado}
          />
        </TabContainer>
      )}
    </>
  );
};
