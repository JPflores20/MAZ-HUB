/**
 * @fileoverview Dialog state hook managing RDA autosave serialization, local draft recovery, and exit guards.
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Rda } from "@/domain/models/rda";
import { get_rda_status } from "../utils/rda_status";
import {
  clear_rda_local_draft,
  compute_next_phase_complete_rda,
  load_recoverable_rda_draft,
  normalize_initial_rda,
  type RecoverableRdaDraft,
  save_rda_local_draft,
  should_adopt_saved_rda_state,
} from "./rda_dialog_draft_helpers";
import { describe_rda_save_error, type RdaPhase } from "./rda_dialog_helpers";

const AUTOSAVE_DELAY_MS = 2500;

interface UseRdaDialogStateParams {
  open: boolean;
  rda: Rda | null;
  onSave?: ((rda: Rda) => Promise<Rda>) | undefined;
  onOpenChange: (open: boolean) => void;
  isEditable: boolean;
}

/** Manages local RDA working copy, serialized Firestore saves, draft recovery, and phase toggles. */
export function useRdaDialogState({
  open,
  rda,
  onSave,
  onOpenChange,
  isEditable,
}: UseRdaDialogStateParams) {
  const { t } = useTranslation();
  const [local_rda, set_local_rda] = useState<Rda | null>(null);
  const [active_tab, set_active_tab] = useState<RdaPhase>("1. Resumen");
  const [save_state, set_save_state] = useState<"idle" | "saving" | "error">("idle");
  const [recoverable_draft, set_recoverable_draft] = useState<RecoverableRdaDraft | null>(null);

  const last_saved_json_ref = useRef<string>("");
  const latest_rda_ref = useRef<Rda | null>(null);
  latest_rda_ref.current = local_rda;
  const in_flight_ref = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    if (!rda || !open) return;
    const normalized = normalize_initial_rda(rda);
    const initial_json = JSON.stringify(normalized);
    set_local_rda(normalized);
    last_saved_json_ref.current = initial_json;
    set_save_state("idle");
    set_active_tab("1. Resumen");
    set_recoverable_draft(
      isEditable ? load_recoverable_rda_draft(normalized.id, initial_json) : null,
    );
  }, [rda, open, isEditable]);

  const is_dirty =
    isEditable && local_rda ? JSON.stringify(local_rda) !== last_saved_json_ref.current : false;

  useEffect(() => {
    if (isEditable && local_rda && is_dirty) save_rda_local_draft(local_rda);
  }, [isEditable, local_rda, is_dirty]);

  const persist = useCallback(async (): Promise<boolean> => {
    if (!onSave || !isEditable) return true;
    while (in_flight_ref.current) await in_flight_ref.current;

    const snapshot = latest_rda_ref.current;
    if (!snapshot) return true;
    const snapshot_json = JSON.stringify(snapshot);
    if (snapshot_json === last_saved_json_ref.current) return true;

    set_save_state("saving");
    const save_task = (async () => {
      try {
        const computed_status = get_rda_status(snapshot, { ignoreLegacyStatus: true });
        const payload =
          snapshot.status !== computed_status ? { ...snapshot, status: computed_status } : snapshot;
        const saved = await onSave(payload);
        if (latest_rda_ref.current === snapshot) {
          if (should_adopt_saved_rda_state(snapshot, snapshot_json, saved)) {
            last_saved_json_ref.current = JSON.stringify(saved);
            set_local_rda(saved);
          } else {
            last_saved_json_ref.current = snapshot_json;
          }
          clear_rda_local_draft(snapshot.id);
          set_recoverable_draft(null);
        } else {
          last_saved_json_ref.current = snapshot_json;
        }
        set_save_state("idle");
        return true;
      } catch (save_error) {
        set_save_state("error");
        toast.error(describe_rda_save_error(save_error), { id: "rda-save-error", duration: 10000 });
        return false;
      }
    })();

    in_flight_ref.current = save_task;
    try {
      return await save_task;
    } finally {
      in_flight_ref.current = null;
    }
  }, [onSave, isEditable]);

  useEffect(() => {
    if (!isEditable || !local_rda || !is_dirty) return;
    const timer_id = setTimeout(() => void persist(), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer_id);
  }, [isEditable, local_rda, is_dirty, persist]);

  const persist_ref = useRef(persist);
  persist_ref.current = persist;
  useEffect(() => () => void persist_ref.current(), []);

  useEffect(() => {
    if (!is_dirty && save_state !== "saving") return;
    const handle_before_unload = (unload_event: BeforeUnloadEvent) => {
      unload_event.preventDefault();
      unload_event.returnValue = "";
    };
    window.addEventListener("beforeunload", handle_before_unload);
    return () => window.removeEventListener("beforeunload", handle_before_unload);
  }, [is_dirty, save_state]);

  const handle_save = async () => {
    if (await persist()) {
      toast.success(t("rda.savedOk", "RDA guardado correctamente"));
      onOpenChange(false);
    }
  };

  const handle_back = async () => {
    if (
      (await persist()) ||
      window.confirm(t("rda.leaveWithoutSaving", "No se pudieron guardar los cambios. ¿Salir de todos modos y perderlos?"))
    ) {
      onOpenChange(false);
    }
  };

  const handle_rda_change = (next_rda: Rda) => {
    if (!isEditable) return;
    set_local_rda({ ...next_rda, status: get_rda_status(next_rda, { ignoreLegacyStatus: true }) });
  };

  const toggle_phase_complete = (click_event: React.MouseEvent, phase_id: RdaPhase, phase_number: 1 | 2 | 3 | 4 | 5) => {
    click_event.stopPropagation();
    if (!isEditable) return;
    set_local_rda((previous_rda) =>
      previous_rda ? compute_next_phase_complete_rda(previous_rda, phase_id, phase_number) : previous_rda,
    );
  };

  const sync_status: "saving" | "error" | "dirty" | "saved" =
    save_state === "saving" ? "saving" : save_state === "error" ? "error" : is_dirty ? "dirty" : "saved";

  return {
    local_rda,
    active_tab,
    set_active_tab,
    sync_status,
    recoverable_draft,
    persist,
    handle_restore_draft: () => {
      if (!isEditable || !recoverable_draft) return;
      set_local_rda(recoverable_draft.rda);
      set_recoverable_draft(null);
      toast.success("Borrador local del RDA restaurado");
    },
    handle_discard_draft: () => {
      if (local_rda) clear_rda_local_draft(local_rda.id);
      set_recoverable_draft(null);
    },
    handle_save,
    handle_back,
    handle_rda_change,
    toggle_phase_complete,
  };
}
