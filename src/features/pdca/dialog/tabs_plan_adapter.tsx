/**
 * @fileoverview Adaptador entre el estado del diálogo y los subcomponentes de la Fase PLAN (`PdcaPhasePlan`).
 */
import React from "react";
import { toast } from "sonner";
import type { ActionItem, ConclusionCausaRaizItem } from "@/domain/pdca";
import { PdcaPhasePlan } from "../plan/pdca_phase_plan";
import type { UsuarioPlan } from "../plan/phase_plan_types";
import { crear_fila_accion_vacia } from "../do/paso_18/action_plan_utils";
import type { EstadoDialogoPdca } from "../hooks/use_pdca_dialog_state";
import type { ControlAutoguardadoPdca } from "../hooks/use_pdca_autosave";

interface PropiedadesAdaptadorPlan {
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  es_administrador: boolean;
  usuarios_disponibles: UsuarioPlan[];
  es_editable: boolean;
  al_alternar_paso: (paso_id: string) => void;
  al_alternar_no_aplica: (paso_id: string) => void;
}

/**
 * Conecta las propiedades y callbacks con marcado de suciedad hacia `PdcaPhasePlan`.
 */
export const TabsPlanAdapter: React.FC<PropiedadesAdaptadorPlan> = ({
  estado_dialogo,
  auto_guardado,
  es_administrador,
  usuarios_disponibles,
  es_editable,
  al_alternar_paso,
  al_alternar_no_aplica,
}) => {
  const vincular = <TValor,>(actualizar_estado: (valor: TValor) => void) => (valor: TValor) => {
    actualizar_estado(valor);
    auto_guardado.mark_as_modified();
  };

  const alternar_usuario_asignado = (usuario: UsuarioPlan) => {
    const lista_actual = estado_dialogo.assigned_users || [];
    const coincide = (candidato: { name?: string; email?: string }) =>
      (usuario.email && candidato.email?.toLowerCase() === usuario.email.toLowerCase()) ||
      candidato.name?.toLowerCase() === usuario.name.toLowerCase();

    const siguiente_lista = lista_actual.some(coincide)
      ? lista_actual.filter((candidato) => !coincide(candidato))
      : [...lista_actual, usuario];

    estado_dialogo.set_assigned_users(siguiente_lista);
    auto_guardado.mark_as_modified();
  };

  const enviar_causas_a_plan_accion = (causas_raiz: ConclusionCausaRaizItem[]) => {
    const acciones_actuales: ActionItem[] = Array.isArray(estado_dialogo.action_items)
      ? [...estado_dialogo.action_items]
      : [];
    let agregadas = 0;

    causas_raiz.forEach((conclusion) => {
      const causa_texto = String(conclusion?.causaRaiz || "").trim();
      const problema_texto = String(conclusion?.problema || "").trim();
      const conclusion_texto = String(conclusion?.conclusion || "").trim();
      const ya_existe = acciones_actuales.some(
        (accion_item) =>
          String(accion_item?.causaRaiz || "").trim().toLowerCase() === causa_texto.toLowerCase() &&
          String(accion_item?.tema || "").trim().toLowerCase() === problema_texto.toLowerCase(),
      );
      if (!ya_existe) {
        acciones_actuales.push({
          ...crear_fila_accion_vacia(),
          tema: problema_texto,
          causaRaiz: causa_texto,
          accion: conclusion_texto,
          priorizar: "SI",
        });
        agregadas += 1;
      }
    });

    if (agregadas === 0) {
      toast.info("Estas causas raíz ya se encuentran registradas en el Plan de Acción.");
      return;
    }
    estado_dialogo.set_action_items(acciones_actuales);
    auto_guardado.mark_as_modified();
    toast.success(`Se agregaron ${agregadas} acción(es) al Plan de Acción en la Fase 2 (DO).`);
  };

  return (
    <PdcaPhasePlan
      title_value={estado_dialogo.title_value}
      on_title_change={vincular(estado_dialogo.set_title_value)}
      planta_value={estado_dialogo.planta_value}
      on_planta_change={vincular(estado_dialogo.set_planta_value)}
      departamento_value={estado_dialogo.departamento_value}
      on_departamento_change={vincular(estado_dialogo.set_departamento_value)}
      area_value={estado_dialogo.area_value}
      on_area_change={vincular(estado_dialogo.set_area_value)}
      etapa_value={estado_dialogo.etapa_value}
      on_etapa_change={vincular(estado_dialogo.set_etapa_value)}
      deadline_date={estado_dialogo.deadline_date || new Date()}
      on_deadline_change={vincular(estado_dialogo.set_deadline_date)}
      author_name={estado_dialogo.author_name}
      author_email={estado_dialogo.author_email}
      on_author_change={(email, nombre) => {
        estado_dialogo.set_author_email(email);
        estado_dialogo.set_author_name(nombre);
        auto_guardado.mark_as_modified();
      }}
      assigned_users={estado_dialogo.assigned_users}
      on_toggle_assigned_user={alternar_usuario_asignado}
      available_users={usuarios_disponibles}
      is_admin_user={es_administrador}
      team_members_list={estado_dialogo.team_members}
      on_team_members_change={vincular(estado_dialogo.set_team_members)}
      problem_description={estado_dialogo.problem_value}
      on_problem_change={vincular(estado_dialogo.set_problem_value)}
      goal_definition={estado_dialogo.definition_goal}
      on_goal_definition_change={vincular(estado_dialogo.set_definition_goal)}
      participants_info={estado_dialogo.participants_data}
      on_participants_info_change={vincular(estado_dialogo.set_participants_data)}
      vpo_checkpoints={estado_dialogo.vpo_checkpoints}
      on_vpo_checkpoints_change={vincular(estado_dialogo.set_vpo_checkpoints)}
      completed_steps={estado_dialogo.completed_steps}
      na_steps={estado_dialogo.na_steps}
      on_toggle_step={al_alternar_paso}
      on_toggle_na={al_alternar_no_aplica}
      is_editable={es_editable}
      process_mapping_files={estado_dialogo.process_mapping_files}
      on_process_mapping_files_change={vincular(estado_dialogo.set_process_mapping_files)}
      sipoc_map_files={estado_dialogo.sipoc_map_files}
      on_sipoc_map_files_change={vincular(estado_dialogo.set_sipoc_map_files)}
      baseline_image={estado_dialogo.baseline_image}
      on_baseline_image_change={vincular(estado_dialogo.set_baseline_image)}
      coleccion_datos={estado_dialogo.coleccion_datos}
      on_coleccion_datos_change={vincular(estado_dialogo.set_coleccion_datos)}
      pareto_drill_downs={estado_dialogo.pareto_drill_downs}
      on_pareto_drill_downs_change={vincular(estado_dialogo.set_pareto_drill_downs)}
      pareto_data_map={estado_dialogo.pareto_data_map}
      on_pareto_data_map_change={vincular(estado_dialogo.set_pareto_data_map)}
      pareto_unit={estado_dialogo.pareto_unit}
      on_pareto_unit_change={vincular(estado_dialogo.set_pareto_unit)}
      pareto_titles={estado_dialogo.pareto_titles}
      on_pareto_titles_change={vincular(estado_dialogo.set_pareto_titles)}
      target_vs_actual={estado_dialogo.target_vs_actual}
      on_target_vs_actual_change={vincular(estado_dialogo.set_target_vs_actual)}
      target_vs_actual_unit={estado_dialogo.target_vs_actual_unit}
      on_target_vs_actual_unit_change={vincular(estado_dialogo.set_target_vs_actual_unit)}
      target_vs_actual_title={estado_dialogo.target_vs_actual_title}
      on_target_vs_actual_title_change={vincular(estado_dialogo.set_target_vs_actual_title)}
      target_vs_actual_ymin={estado_dialogo.target_vs_actual_ymin}
      on_target_vs_actual_ymin_change={vincular(estado_dialogo.set_target_vs_actual_ymin)}
      target_vs_actual_ymax={estado_dialogo.target_vs_actual_ymax}
      on_target_vs_actual_ymax_change={vincular(estado_dialogo.set_target_vs_actual_ymax)}
      ishikawas={estado_dialogo.ishikawas}
      on_ishikawas_change={vincular(estado_dialogo.set_ishikawas)}
      five_whys_tables={estado_dialogo.five_whys_tables}
      on_five_whys_tables_change={vincular(estado_dialogo.set_five_whys_tables)}
      voz_consumidor={estado_dialogo.voz_consumidor}
      on_voz_consumidor_change={vincular(estado_dialogo.set_voz_consumidor)}
      analisis_riesgos_proyecto={estado_dialogo.analisis_riesgos_proyecto}
      on_analisis_riesgos_proyecto_change={vincular(estado_dialogo.set_analisis_riesgos_proyecto)}
      especificacion_procesos_image={estado_dialogo.especificacion_procesos_image}
      on_especificacion_procesos_image_change={vincular(estado_dialogo.set_especificacion_procesos_image)}
      benchmark_image={estado_dialogo.benchmark_image}
      on_benchmark_image_change={vincular(estado_dialogo.set_benchmark_image)}
      conclusiones_causa_raiz={estado_dialogo.conclusiones_causa_raiz}
      on_conclusiones_causa_raiz_change={vincular(estado_dialogo.set_conclusiones_causa_raiz)}
      on_send_root_causes_to_action_plan={enviar_causas_a_plan_accion}
      has_flavor_correlation={estado_dialogo.has_flavor_correlation}
      set_has_flavor_correlation={vincular(estado_dialogo.set_has_flavor_correlation)}
      flavor_correlation_data={estado_dialogo.flavor_correlation_data}
      on_force_save={() => void auto_guardado.handle_save_to_firestore()}
      on_flavor_correlation_data_change={vincular(estado_dialogo.set_flavor_correlation_data)}
      rendimiento_actual_pis={estado_dialogo.rendimiento_actual_pis}
      on_rendimiento_actual_pis_change={vincular(estado_dialogo.set_rendimiento_actual_pis)}
      rendimiento_actual_image={estado_dialogo.rendimiento_actual_image}
      on_rendimiento_actual_image_change={vincular(estado_dialogo.set_rendimiento_actual_image)}
      gop_themes_data={estado_dialogo.gop_themes_data}
      on_gop_themes_data_change={vincular(estado_dialogo.set_gop_themes_data)}
    />
  );
};
