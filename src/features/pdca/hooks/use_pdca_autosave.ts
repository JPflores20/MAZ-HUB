/**
 * @fileoverview Hook para respaldo automático local en localStorage y sincronización segura hacia Firestore.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Pdca, Phase } from "@/domain/pdca";
import { save_pdca_to_firestore } from "@/shared/services/pdca/pdca_firestore_mutations";

const PREFIJO_BORRADOR_LOCAL = "maz_hub_pdca_draft_";

interface BorradorLocalPdca {
  savedAt: string;
  payload: Pdca;
}

/**
 * Respalda ediciones locales sin consumir cuota Firestore hasta que el usuario confirma guardar.
 */
export const use_pdca_autosave = (
  pdca_identifier: string,
  current_payload_getter: () => Pdca,
  is_editable: boolean,
  _current_user_name?: string,
  on_save_success?: (saved_pdca: Pdca) => void | Promise<void>,
) => {
  const [is_saving, set_is_saving] = useState(false);
  const [has_unsaved_changes, set_has_unsaved_changes] = useState(false);
  const [local_draft, set_local_draft] = useState<BorradorLocalPdca | null>(null);
  const last_saved_json_ref = useRef<string>("");
  const debounce_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storage_key = pdca_identifier ? `${PREFIJO_BORRADOR_LOCAL}${pdca_identifier}` : "";

  const limpiar_borrador_local = useCallback(() => {
    if (!storage_key) return;
    try {
      localStorage.removeItem(storage_key);
    } catch {
      // Ignorar errores de cuota de almacenamiento local
    }
    set_local_draft(null);
  }, [storage_key]);

  useEffect(() => {
    const initial_payload = current_payload_getter();
    const initial_json = JSON.stringify(initial_payload);
    last_saved_json_ref.current = initial_json;
    set_has_unsaved_changes(false);

    if (storage_key && is_editable) {
      try {
        const texto_guardado = localStorage.getItem(storage_key);
        if (texto_guardado) {
          const parsed = JSON.parse(texto_guardado) as BorradorLocalPdca;
          if (parsed?.payload && JSON.stringify(parsed.payload) !== initial_json) {
            set_local_draft(parsed);
          } else {
            localStorage.removeItem(storage_key);
            set_local_draft(null);
          }
        } else {
          set_local_draft(null);
        }
      } catch {
        set_local_draft(null);
      }
    }
  }, [pdca_identifier, storage_key, is_editable]);

  useEffect(() => {
    if (!has_unsaved_changes || !is_editable) return;
    const manejar_cierre_navegador = (evento: BeforeUnloadEvent) => {
      try {
        if (storage_key) {
          const payload = current_payload_getter();
          localStorage.setItem(storage_key, JSON.stringify({ savedAt: new Date().toISOString(), payload }));
        }
      } catch {
        // Ignorar errores de almacenamiento local
      }
      evento.preventDefault();
      evento.returnValue = "";
    };
    window.addEventListener("beforeunload", manejar_cierre_navegador);
    return () => window.removeEventListener("beforeunload", manejar_cierre_navegador);
  }, [has_unsaved_changes, is_editable, storage_key, current_payload_getter]);

  useEffect(() => {
    if (!has_unsaved_changes || !is_editable || !storage_key) return;
    if (debounce_timer_ref.current) clearTimeout(debounce_timer_ref.current);
    debounce_timer_ref.current = setTimeout(() => {
      try {
        const payload = current_payload_getter();
        localStorage.setItem(storage_key, JSON.stringify({ savedAt: new Date().toISOString(), payload }));
      } catch {
        // Ignorar si localStorage alcanzó el límite
      }
    }, 1000);

    return () => {
      if (debounce_timer_ref.current) clearTimeout(debounce_timer_ref.current);
    };
  }, [has_unsaved_changes, is_editable, storage_key, current_payload_getter]);

  const handle_save_to_firestore = useCallback(
    async (next_phase_target?: Phase, custom_payload?: Pdca): Promise<boolean> => {
      if (!is_editable || is_saving) return false;
      const payload_to_save = custom_payload ?? current_payload_getter();
      if (next_phase_target) payload_to_save.fase = next_phase_target;

      const current_json = JSON.stringify(payload_to_save);
      if (!next_phase_target && !custom_payload && current_json === last_saved_json_ref.current) {
        set_has_unsaved_changes(false);
        limpiar_borrador_local();
        toast.info("El PDCA ya está sincronizado sin cambios pendientes.");
        return true;
      }

      set_is_saving(true);
      try {
        await save_pdca_to_firestore(payload_to_save);
        last_saved_json_ref.current = current_json;
        set_has_unsaved_changes(false);
        limpiar_borrador_local();
        try {
          if (on_save_success) await on_save_success(payload_to_save);
        } catch {
          // Callback de caché no debe revertir confirmación exitosa
        }
        toast.success("¡PDCA sincronizado con éxito en la base de datos!");
        return true;
      } catch (save_error) {
        console.error("Error al persistir PDCA en Firestore:", save_error);
        toast.error("Error al intentar guardar en la base de datos. Tu borrador sigue seguro localmente.");
        return false;
      } finally {
        set_is_saving(false);
      }
    },
    [is_editable, is_saving, current_payload_getter, limpiar_borrador_local, on_save_success],
  );

  const restore_and_sync_local_draft = useCallback(async () => {
    if (!local_draft?.payload) return false;
    return handle_save_to_firestore(undefined, local_draft.payload);
  }, [local_draft, handle_save_to_firestore]);

  const mark_as_modified = useCallback(() => {
    set_has_unsaved_changes(true);
  }, []);

  return {
    is_saving,
    has_unsaved_changes,
    set_has_unsaved_changes,
    mark_as_modified,
    handle_save_to_firestore,
    local_draft,
    discard_local_draft: limpiar_borrador_local,
    restore_and_sync_local_draft,
  };
};

export type ControlAutoguardadoPdca = ReturnType<typeof use_pdca_autosave>;
