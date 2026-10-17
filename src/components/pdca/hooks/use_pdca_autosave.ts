/**
 * use_pdca_autosave.ts
 * Hook que coordina el respaldo automático local (localStorage con costo 0 en Firestore),
 * protección contra cierre accidental (beforeunload) y sincronización optimizada con Firestore.
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { savePdcaToFirestore } from "@/services/pdca-service";
import type { Pdca, Phase } from "@/data/pdca";

const PREFIJO_BORRADOR_LOCAL = "maz_hub_pdca_draft_";

interface BorradorLocalPdca {
  savedAt: string;
  payload: Pdca;
}

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

  // Inicialización de la referencia guardada y detección de borrador local previo
  useEffect(() => {
    const initial_payload = current_payload_getter();
    const initial_json = JSON.stringify(initial_payload);
    last_saved_json_ref.current = initial_json;
    set_has_unsaved_changes(false);

    if (storage_key && is_editable) {
      try {
        const raw = localStorage.getItem(storage_key);
        if (raw) {
          const parsed = JSON.parse(raw) as BorradorLocalPdca;
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

  // Protección contra cierre de pestaña o recarga cuando hay cambios sin sincronizar
  useEffect(() => {
    if (!has_unsaved_changes || !is_editable) return;
    const handle_before_unload = (event: BeforeUnloadEvent) => {
      try {
        if (storage_key) {
          const payload = current_payload_getter();
          localStorage.setItem(
            storage_key,
            JSON.stringify({ savedAt: new Date().toISOString(), payload }),
          );
        }
      } catch {
        // Ignorar errores de localStorage
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handle_before_unload);
    return () => window.removeEventListener("beforeunload", handle_before_unload);
  }, [has_unsaved_changes, is_editable, storage_key, current_payload_getter]);

  // Respaldo automático en localStorage con debounce (0 lecturas y 0 escrituras en Firestore)
  useEffect(() => {
    if (!has_unsaved_changes || !is_editable || !storage_key) return;
    if (debounce_timer_ref.current) {
      clearTimeout(debounce_timer_ref.current);
    }
    debounce_timer_ref.current = setTimeout(() => {
      try {
        const payload = current_payload_getter();
        localStorage.setItem(
          storage_key,
          JSON.stringify({ savedAt: new Date().toISOString(), payload }),
        );
      } catch {
        // Ignorar si localStorage está lleno
      }
    }, 1000);

    return () => {
      if (debounce_timer_ref.current) {
        clearTimeout(debounce_timer_ref.current);
      }
    };
  }, [has_unsaved_changes, is_editable, storage_key, current_payload_getter]);

  // Manejo de guardado explícito en base de datos
  const handle_save_to_firestore = useCallback(
    async (next_phase_target?: Phase, custom_payload?: Pdca): Promise<boolean> => {
      if (!is_editable || is_saving) {
        return false;
      }

      const payload_to_save = custom_payload ?? current_payload_getter();

      if (next_phase_target) {
        payload_to_save.fase = next_phase_target;
      }

      const current_json = JSON.stringify(payload_to_save);

      // Si no hubo cambios reales respecto al último estado sincronizado, evitamos la escritura a Firestore
      if (!next_phase_target && !custom_payload && current_json === last_saved_json_ref.current) {
        set_has_unsaved_changes(false);
        limpiar_borrador_local();
        toast.info("El PDCA ya está sincronizado sin cambios pendientes.");
        return true;
      }

      set_is_saving(true);

      try {
        await savePdcaToFirestore(payload_to_save);
        last_saved_json_ref.current = current_json;
        set_has_unsaved_changes(false);
        limpiar_borrador_local();
        try {
          if (on_save_success) {
            await on_save_success(payload_to_save);
          }
        } catch {}
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

  // Sincronizar un borrador local recuperado
  const restore_and_sync_local_draft = useCallback(async () => {
    if (!local_draft?.payload) return false;
    return await handle_save_to_firestore(undefined, local_draft.payload);
  }, [local_draft, handle_save_to_firestore]);

  // Autosave local y detección de modificaciones
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

