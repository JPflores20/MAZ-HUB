/**
 * @fileoverview Adaptadores de pestañas ACT y EVALUACIÓN R2D2 conectando el estado del diálogo PDCA.
 */
import React from "react";
import { PdcaPhaseAct } from "../act/pdca_phase_act";
import { PdcaItfR2d2 } from "../evaluacion_rd2d/pdca_itf_r2d2";
import type { EstadoDialogoPdca } from "../hooks/use_pdca_dialog_state";
import type { ControlAutoguardadoPdca } from "../hooks/use_pdca_autosave";

interface PropiedadesAdaptadorAct {
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  es_editable: boolean;
  al_alternar_paso: (paso_id: string) => void;
  al_alternar_no_aplica: (paso_id: string) => void;
}

/**
 * Conecta estandarización VPO, SOPs, lecciones aprendidas y conclusiones finales hacia `PdcaPhaseAct`.
 */
export const TabsActAdapter: React.FC<PropiedadesAdaptadorAct> = ({
  estado_dialogo,
  auto_guardado,
  es_editable,
  al_alternar_paso,
  al_alternar_no_aplica,
}) => {
  const vincular = <TValor,>(actualizar_estado: (valor: TValor) => void) => (valor: TValor) => {
    actualizar_estado(valor);
    auto_guardado.mark_as_modified();
  };

  return (
    <div className="space-y-6">
      <PdcaPhaseAct
        analisis_riesgos_estandarizacion={estado_dialogo.analisis_riesgos_estandarizacion}
        on_analisis_riesgos_estandarizacion_change={vincular(
          estado_dialogo.set_analisis_riesgos_estandarizacion,
        )}
        tabla_estandarizacion={estado_dialogo.tabla_estandarizacion}
        on_tabla_estandarizacion_change={vincular(estado_dialogo.set_tabla_estandarizacion)}
        completed_steps={estado_dialogo.completed_steps}
        na_steps={estado_dialogo.na_steps}
        on_toggle_step={al_alternar_paso}
        on_toggle_na={al_alternar_no_aplica}
        is_editable={es_editable}
        sops_documentos_image={estado_dialogo.sops_documentos_image}
        on_sops_documentos_image_change={vincular(estado_dialogo.set_sops_documentos_image)}
        plan_entrenamiento_image={estado_dialogo.plan_entrenamiento_image}
        on_plan_entrenamiento_image_change={vincular(estado_dialogo.set_plan_entrenamiento_image)}
        plan_control_image={estado_dialogo.plan_control_image}
        on_plan_control_image_change={vincular(estado_dialogo.set_plan_control_image)}
        lecciones_aprendidas={estado_dialogo.lecciones_aprendidas}
        on_lecciones_aprendidas_change={vincular(estado_dialogo.set_lecciones_aprendidas)}
        conclusiones_finales={estado_dialogo.conclusiones_finales}
        conclusiones_storyboard_image={estado_dialogo.conclusiones_storyboard_image}
        on_conclusiones_storyboard_image_change={vincular(
          estado_dialogo.set_conclusiones_storyboard_image,
        )}
        on_conclusiones_finales_change={vincular(estado_dialogo.set_conclusiones_finales)}
        conclusiones_kpi_data={estado_dialogo.conclusiones_kpi_data}
        on_conclusiones_kpi_data_change={vincular(estado_dialogo.set_conclusiones_kpi_data)}
        conclusiones_pi_items={estado_dialogo.conclusiones_pi_items}
        on_conclusiones_pi_items_change={vincular(estado_dialogo.set_conclusiones_pi_items)}
      />
    </div>
  );
};

/**
 * Conecta la evaluación metodológica R2D2 administrada exclusivamente por perfiles admin.
 */
export const TabsEvaluacionR2d2Adapter: React.FC<{
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  es_editable: boolean;
  usuario_autenticado: { name?: string; email?: string } | null;
}> = ({ estado_dialogo, auto_guardado, es_editable, usuario_autenticado }) => (
  <PdcaItfR2d2
    evaluation={estado_dialogo.itf_r2d2_evaluation}
    onChange={(evaluacion_actualizada) => {
      estado_dialogo.set_itf_r2d2_evaluation(evaluacion_actualizada);
      auto_guardado.mark_as_modified();
    }}
    disabled={!es_editable}
    currentUser={usuario_autenticado}
  />
);
