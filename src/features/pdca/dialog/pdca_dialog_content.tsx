/**
 * @fileoverview Contenido activo y controles de navegación del editor de proyectos PDCA.
 */
import React, { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/auth_context";
import { usePdcas } from "@/shared/context/pdca_context";
import type { Pdca, Phase } from "@/domain/pdca";
import { use_pdca_dialog_state } from "../hooks/use_pdca_dialog_state";
import { use_pdca_deadline } from "../hooks/use_pdca_deadline";
import { use_pdca_autosave } from "../hooks/use_pdca_autosave";
import { use_construir_payload_pdca } from "../hooks/use_pdca_payload_builder";
import { CustomStepper } from "../stepper/pdca_dialog_stepper";
import { PdcaDialogHeader } from "./pdca_dialog_header";
import { PdcaDialogFooter } from "./pdca_dialog_footer";
import { RenderizadorPestanasPdca } from "./pdca_tabs_renderer";
import { PdcaCloseConfirmDialog, PdcaDialogStatusBanners } from "./pdca_dialog_banners";
import { calcular_progreso_pdca, verificar_permiso_edicion_pdca } from "./pdca_dialog_helpers";

interface PropiedadesContenidoDialogo {
  current_pdca: Pdca;
  is_new_draft: boolean;
  onOpenChange: (open: boolean) => void;
  on_restore_draft: (payload_borrador: Pdca) => void;
}

/**
 * Orquesta permisos de edición, autoguardado local, pestañas por fase y confirmaciones del PDCA activo.
 */
export const PdcaDialogContent: React.FC<PropiedadesContenidoDialogo> = ({
  current_pdca,
  is_new_draft,
  onOpenChange,
  on_restore_draft,
}) => {
  const { t: translate } = useTranslation();
  const { currentUser: usuario_autenticado, permissions, usersList: usuarios_disponibles } = useAuth();
  const es_administrador = usuario_autenticado?.role === "admin";
  const esta_bloqueado_por_fecha = use_pdca_deadline(es_administrador, current_pdca.fechaFinalizacion);
  const es_editable = verificar_permiso_edicion_pdca(
    usuario_autenticado,
    permissions,
    current_pdca,
    is_new_draft,
    esta_bloqueado_por_fecha,
  );

  const estado_dialogo = use_pdca_dialog_state(current_pdca, usuario_autenticado);
  const progreso_calculado = calcular_progreso_pdca(
    estado_dialogo.completed_steps,
    estado_dialogo.na_steps,
  );

  const construir_payload = use_construir_payload_pdca(current_pdca, estado_dialogo, progreso_calculado);
  const { updatePdcaInCache } = usePdcas();
  const auto_guardado = use_pdca_autosave(
    current_pdca.id,
    construir_payload,
    es_editable,
    usuario_autenticado?.name,
    (pdca_guardado) => {
      updatePdcaInCache?.(pdca_guardado);
    },
  );

  const [confirmacion_cierre, set_confirmacion_cierre] = useState(false);
  const solicitar_cierre = useCallback(() => {
    if (auto_guardado.has_unsaved_changes && es_editable) set_confirmacion_cierre(true);
    else onOpenChange(false);
  }, [auto_guardado.has_unsaved_changes, es_editable, onOpenChange]);

  const [pestanas_montadas, set_pestanas_montadas] = useState<Set<Phase>>(
    new Set([estado_dialogo.active_tab]),
  );
  useEffect(() => {
    set_pestanas_montadas((previas) =>
      previas.has(estado_dialogo.active_tab) ? previas : new Set(previas).add(estado_dialogo.active_tab),
    );
  }, [estado_dialogo.active_tab]);

  const alternar_conjunto = useCallback(
    (actualizar_set: React.Dispatch<React.SetStateAction<Set<string>>>, clave: string) => {
      if (!es_editable) return;
      actualizar_set((previo) => {
        const siguiente = new Set(previo);
        if (siguiente.has(clave)) siguiente.delete(clave);
        else siguiente.add(clave);
        return siguiente;
      });
      auto_guardado.mark_as_modified();
    },
    [es_editable, auto_guardado],
  );

  const avanzar_siguiente_fase = async () => {
    if (!es_editable) return;
    const orden_fases: Phase[] = es_administrador
      ? ["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"]
      : ["Resumen", "Plan", "Do", "Check", "Act"];
    const indice_actual = orden_fases.indexOf(estado_dialogo.active_tab);

    if ((estado_dialogo.active_tab === "Act" && !es_administrador) || estado_dialogo.active_tab === "Evaluacion") {
      await auto_guardado.handle_save_to_firestore();
      toast.success(translate("pdcaDialog.finished"));
      onOpenChange(false);
      return;
    }
    if (indice_actual >= 0 && indice_actual < orden_fases.length - 1) {
      const siguiente_fase = orden_fases[indice_actual + 1]!;
      await auto_guardado.handle_save_to_firestore(siguiente_fase);
      startTransition(() => estado_dialogo.set_active_tab(siguiente_fase));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-in fade-in zoom-in duration-300">
      <PdcaDialogStatusBanners
        is_editable={es_editable}
        local_draft={auto_guardado.local_draft}
        on_discard_draft={auto_guardado.discard_local_draft}
        on_restore_and_sync={auto_guardado.restore_and_sync_local_draft}
        on_draft_restored={on_restore_draft}
      />
      <PdcaDialogHeader
        current_phase={estado_dialogo.active_tab}
        document_identifier={current_pdca.id}
        pdca_title={estado_dialogo.title_value || translate("pdcaDialog.untitled")}
        last_updated={current_pdca.actualizado}
        deadline_string={current_pdca.fechaFinalizacion ?? null}
        completed_steps={estado_dialogo.completed_steps}
        na_steps={estado_dialogo.na_steps}
        is_saving_in_progress={auto_guardado.is_saving}
        has_pending_modifications={auto_guardado.has_unsaved_changes}
        is_user_permitted_to_edit={es_editable}
        on_trigger_firestore_save={() => auto_guardado.handle_save_to_firestore()}
        on_go_back={solicitar_cierre}
      />
      <CustomStepper
        current={estado_dialogo.active_tab}
        completedPhases={estado_dialogo.completed_phases}
        onSelect={(fase) => startTransition(() => estado_dialogo.set_active_tab(fase))}
        onToggleComplete={(fase) => alternar_conjunto(estado_dialogo.set_completed_phases, fase)}
        completedSteps={estado_dialogo.completed_steps}
        naSteps={estado_dialogo.na_steps}
        isAdmin={es_administrador}
      />
      <RenderizadorPestanasPdca
        pestanas_montadas={pestanas_montadas}
        estado_dialogo={estado_dialogo}
        auto_guardado={auto_guardado}
        es_administrador={es_administrador}
        usuario_autenticado={usuario_autenticado}
        usuarios_disponibles={usuarios_disponibles}
        progreso_calculado={progreso_calculado}
        es_editable={es_editable}
        al_alternar_paso={(paso_id) => alternar_conjunto(estado_dialogo.set_completed_steps, paso_id)}
        al_alternar_no_aplica={(paso_id) => alternar_conjunto(estado_dialogo.set_na_steps, paso_id)}
      />
      <PdcaDialogFooter
        current_phase={estado_dialogo.active_tab}
        document_identifier={current_pdca.id}
        is_user_permitted_to_edit={es_editable}
        on_proceed_next_phase={avanzar_siguiente_fase}
        on_close_dialog={solicitar_cierre}
        isAdmin={es_administrador}
      />
      <PdcaCloseConfirmDialog
        open={confirmacion_cierre}
        on_open_change={set_confirmacion_cierre}
        on_exit_without_sync={() => {
          set_confirmacion_cierre(false);
          onOpenChange(false);
        }}
        on_save_and_exit={async () => {
          await auto_guardado.handle_save_to_firestore();
          set_confirmacion_cierre(false);
          onOpenChange(false);
        }}
      />
    </div>
  );
};
