/**
 * pdca_dialog.tsx
 * Componente contenedor principal del editor de proyectos PDCA con gestión de estado, autoguardado y navegación por fases.
 */
import React, { useMemo, useCallback, useState, useEffect, startTransition } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { use_pdca_dialog_state } from "./hooks/use_pdca_dialog_state";
import { use_pdca_deadline } from "./hooks/use_pdca_deadline";
import { use_pdca_autosave } from "./hooks/use_pdca_autosave";
import { PdcaDialogHeader, ALL_STEP_IDS, TOTAL_STEPS } from "./pdca_dialog_header";
import { PdcaDialogFooter } from "./pdca_dialog_footer";
import { CustomStepper } from "./pdca-dialog-stepper";
import type { Pdca, Phase } from "@/data/pdca";
import { create_empty_pdca_draft } from "./utils/pdca-draft";
import { useConstruirPayloadPdca } from "./hooks/use_pdca_payload_builder";
import { RenderizadorPestanasPdca } from "./pdca_tabs_renderer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PdcaDialog: React.FC<{
  pdca: Pdca | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ pdca, onOpenChange }) => {
  const { t } = useTranslation();
  const current_pdca = useMemo(() => pdca ?? create_empty_pdca_draft(), [pdca]);
  const { currentUser: auth_user, permissions, usersList: available_users } = useAuth();
  const is_admin = auth_user?.role === "admin";

  const is_deadline_locked = use_pdca_deadline(is_admin, current_pdca.fechaFinalizacion);
  const is_editable = permissions.canEdit && (is_admin || !is_deadline_locked);

  const state = use_pdca_dialog_state(current_pdca, auth_user);

  const valid_steps = ALL_STEP_IDS.filter((id) => !state.na_steps.has(id));
  const completed_count = valid_steps.filter((id) => state.completed_steps.has(id)).length;
  const computed_progress =
    valid_steps.length > 0 ? Math.round((completed_count / valid_steps.length) * 100) : 0;

  const get_current_pdca_payload = useConstruirPayloadPdca(current_pdca, state, computed_progress);

  const { updatePdcaInCache } = usePdcas();

  const autosave = use_pdca_autosave(
    current_pdca.id,
    get_current_pdca_payload,
    is_editable,
    auth_user?.name,
    (savedPdca) => {
      updatePdcaInCache?.(savedPdca);
    },
  );

  const [show_close_confirm, set_show_close_confirm] = useState(false);

  const handle_request_close = useCallback(() => {
    if (autosave.has_unsaved_changes && is_editable) {
      set_show_close_confirm(true);
    } else {
      onOpenChange(false);
    }
  }, [autosave.has_unsaved_changes, is_editable, onOpenChange]);

  const [mounted_tabs, set_mounted_tabs] = useState<Set<Phase>>(new Set([state.active_tab]));
  useEffect(() => {
    set_mounted_tabs((prev) => {
      if (prev.has(state.active_tab)) return prev;
      const next = new Set(prev);
      next.add(state.active_tab);
      return next;
    });
  }, [state.active_tab]);

  const handle_toggle_step = useCallback(
    (step_id: string) => {
      if (!is_admin) {
        toast.error(t("pdcaDialog.adminOnlyCompleted"));
        return;
      }
      state.set_completed_steps((prev) => {
        const next_steps = new Set(prev);
        if (next_steps.has(step_id)) next_steps.delete(step_id);
        else next_steps.add(step_id);
        return next_steps;
      });
      autosave.mark_as_modified();
    },
    [is_admin, state, autosave, t],
  );

  const handle_toggle_na = useCallback(
    (step_id: string) => {
      if (!is_admin) {
        toast.error(t("pdcaDialog.adminOnlyNA"));
        return;
      }
      state.set_na_steps((prev) => {
        const next_steps = new Set(prev);
        if (next_steps.has(step_id)) next_steps.delete(step_id);
        else next_steps.add(step_id);
        return next_steps;
      });
      autosave.mark_as_modified();
    },
    [is_admin, state, autosave, t],
  );

  const handle_proceed_next_phase = async () => {
    if (!is_editable) return;
    const phase_order: Phase[] = is_admin
      ? ["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"]
      : ["Resumen", "Plan", "Do", "Check", "Act"];

    const current_idx = phase_order.indexOf(state.active_tab);

    if ((state.active_tab === "Act" && !is_admin) || state.active_tab === "Evaluacion") {
      await autosave.handle_save_to_firestore();
      toast.success(t("pdcaDialog.finished"));
      onOpenChange(false);
    } else if (current_idx >= 0 && current_idx < phase_order.length - 1) {
      const next_phase = phase_order[current_idx + 1]!;
      await autosave.handle_save_to_firestore(next_phase);
      startTransition(() => {
        state.set_active_tab(next_phase);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!open) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-in fade-in zoom-in duration-300">
      {autosave.local_draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div>
            <span className="font-bold">Respaldo local detectado:</span> Se encontró un borrador
            guardado automáticamente en tu navegador que no se había sincronizado con la base de
            datos.
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => autosave.discard_local_draft()}
            >
              Descartar borrador
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
              onClick={async () => {
                await autosave.restore_and_sync_local_draft();
              }}
            >
              Sincronizar borrador con BD
            </Button>
          </div>
        </div>
      )}

      <PdcaDialogHeader
        current_phase={state.active_tab}
        document_identifier={current_pdca.id}
        pdca_title={state.title_value || t("pdcaDialog.untitled")}
        last_updated={current_pdca.actualizado}
        deadline_string={current_pdca.fechaFinalizacion ?? null}
        completed_steps={state.completed_steps}
        na_steps={state.na_steps}
        is_saving_in_progress={autosave.is_saving}
        has_pending_modifications={autosave.has_unsaved_changes}
        is_user_permitted_to_edit={is_editable}
        on_trigger_firestore_save={() => autosave.handle_save_to_firestore()}
        on_go_back={handle_request_close}
      />

      <CustomStepper
        current={state.active_tab}
        completedPhases={state.completed_phases}
        onSelect={(p: Phase) => {
          startTransition(() => {
            state.set_active_tab(p);
          });
        }}
        onToggleComplete={(p: Phase) => {
          if (!is_admin) return;
          state.set_completed_phases((prev) => {
            const next = new Set(prev);
            if (next.has(p)) next.delete(p);
            else next.add(p);
            return next;
          });
          autosave.mark_as_modified();
        }}
        completedSteps={state.completed_steps}
        naSteps={state.na_steps}
        isAdmin={is_admin}
      />

      <RenderizadorPestanasPdca
        pestañasMontadas={mounted_tabs}
        estadoDialogo={state}
        autoGuardado={autosave}
        esAdministrador={is_admin}
        usuarioAutenticado={auth_user}
        usuariosDisponibles={available_users}
        progresoCalculado={computed_progress}
        esEditable={is_editable}
        alAlternarPaso={handle_toggle_step}
        alAlternarNoAplica={handle_toggle_na}
      />

      <PdcaDialogFooter
        current_phase={state.active_tab}
        document_identifier={current_pdca.id}
        is_user_permitted_to_edit={is_editable}
        on_proceed_next_phase={handle_proceed_next_phase}
        on_close_dialog={handle_request_close}
        isAdmin={is_admin}
      />

      <AlertDialog open={show_close_confirm} onOpenChange={set_show_close_confirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tienes cambios sin sincronizar en la base de datos</AlertDialogTitle>
            <AlertDialogDescription>
              Tus cambios ya están respaldados localmente en este navegador (sin consumir lecturas
              ni escrituras de Firestore). ¿Deseas sincronizarlos en la base de datos antes de salir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir editando</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                set_show_close_confirm(false);
                onOpenChange(false);
              }}
            >
              Salir sin sincronizar
            </Button>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={async () => {
                await autosave.handle_save_to_firestore();
                set_show_close_confirm(false);
                onOpenChange(false);
              }}
            >
              Guardar y Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
// force vite reload
