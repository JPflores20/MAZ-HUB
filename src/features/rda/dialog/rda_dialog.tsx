/**
 * @fileoverview Main RDA multi-phase editor container integrating autosave, draft banners, and phase views.
 */

import { AlertTriangle } from "lucide-react";
import type { Rda } from "@/domain/models/rda";
import { Button } from "@/shared/ui/button";
import { RdaPhase2Problem } from "../phases/rda_phase2_problem";
import { RdaPhase3Analysis } from "../phases/rda_phase3_analysis";
import { RdaPhase6QualityEval } from "../phases/rda_phase6_quality_eval";
import { RdaPhase7EffectivenessEval } from "../phases/rda_phase7_effectiveness_eval";
import { RdaPhase1Resumen } from "../resumen/rda_phase1_resumen";
import { RdaDialogHeader } from "./rda_dialog_header";
import { RdaDialogStepper } from "./rda_dialog_stepper";
import { useRdaDialogState } from "./use_rda_dialog_state";

interface RdaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rda: Rda | null;
  onSave?: ((rda: Rda) => Promise<Rda>) | undefined;
  isEditable?: boolean;
}

/** Coordinates editing across the 5 RDA phases with local backup recovery and Firestore persistence. */
export function RdaDialog({
  open,
  onOpenChange,
  rda,
  onSave,
  isEditable = true,
}: RdaDialogProps) {
  const {
    local_rda,
    active_tab,
    set_active_tab,
    sync_status,
    recoverable_draft,
    persist,
    handle_restore_draft,
    handle_discard_draft,
    handle_save,
    handle_back,
    handle_rda_change,
    toggle_phase_complete,
  } = useRdaDialogState({ open, rda, onSave, onOpenChange, isEditable });

  if (!local_rda) return null;

  return (
    <div id="rda-content" className="space-y-6">
      {!isEditable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-300">
          Modo solo lectura: no cuentas con permisos de edición sobre este RDA.
        </div>
      )}

      {isEditable && recoverable_draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Se encontró un borrador local sin guardar en la nube (
              {new Date(recoverable_draft.savedAt).toLocaleString()}). ¿Deseas restaurarlo?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handle_discard_draft}
              className="h-7 px-2.5 text-xs border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
            >
              Descartar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handle_restore_draft}
              className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              Restaurar borrador
            </Button>
          </div>
        </div>
      )}

      <RdaDialogHeader
        local_rda={local_rda}
        active_tab={active_tab}
        sync_status={sync_status}
        is_editable={isEditable}
        on_back={handle_back}
        on_save={handle_save}
        on_change_rda={handle_rda_change}
      />

      <RdaDialogStepper
        local_rda={local_rda}
        active_tab={active_tab}
        on_select_tab={set_active_tab}
        on_toggle_phase_complete={toggle_phase_complete}
      />

      <div className="mt-8">
        {active_tab === "1. Resumen" && (
          <RdaPhase1Resumen rda={local_rda} onChange={handle_rda_change} />
        )}
        {active_tab === "2. Descripción del Problema" && (
          <RdaPhase2Problem rda={local_rda} onChange={handle_rda_change} />
        )}
        {active_tab === "3. Análisis de Causas Raíz" && (
          <RdaPhase3Analysis
            rda={local_rda}
            onChange={handle_rda_change}
            onForceSave={() => void persist()}
          />
        )}
        {active_tab === "4. Evaluación de Calidad RDA" && (
          <RdaPhase6QualityEval rda={local_rda} onChange={handle_rda_change} />
        )}
        {active_tab === "5. Evaluación de Efectividad de RDA" && (
          <RdaPhase7EffectivenessEval rda={local_rda} onChange={handle_rda_change} />
        )}
      </div>
    </div>
  );
}
