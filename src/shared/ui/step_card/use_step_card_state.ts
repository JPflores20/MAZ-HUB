/**
 * use_step_card_state.ts
 * Hook personalizado para administrar la expansión persistente y modo pantalla completa de `StepCard`.
 */
import { useEffect, useState } from "react";

/**
 * Controla el estado colapsado (persistido en `localStorage`) y pantalla completa de una tarjeta de paso.
 *
 * @param storage_id - Identificador único opcional para recordar el estado en `localStorage`.
 * @param default_open - Define si el paso inicia expandido cuando no hay estado guardado.
 * @returns Estado actual (`is_expanded`, `is_fullscreen`, `has_mounted`) y conmutadores.
 */
export function useStepCardState(storage_id?: string, default_open = false) {
  const storage_key = storage_id ? `pdca_step_${storage_id}` : null;

  const [is_expanded, set_is_expanded] = useState<boolean>(() => {
    if (!storage_key || typeof window === "undefined") return default_open;
    const saved_value = window.localStorage.getItem(storage_key);
    if (saved_value === null) return default_open;
    return saved_value === "true";
  });

  const [has_mounted, set_has_mounted] = useState<boolean>(is_expanded);
  const [is_fullscreen, set_is_fullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (is_expanded && !has_mounted) {
      set_has_mounted(true);
    }
  }, [is_expanded, has_mounted]);

  // Bloquea el scroll del documento principal mientras la tarjeta está en pantalla completa
  useEffect(() => {
    if (is_fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [is_fullscreen]);

  /** Alterna el estado expandido del contenido y persiste la preferencia local. */
  const toggle_expanded = () => {
    const next_expanded = !is_expanded;
    set_is_expanded(next_expanded);
    if (storage_key && typeof window !== "undefined") {
      window.localStorage.setItem(storage_key, String(next_expanded));
    }
  };

  /** Alterna el modo pantalla completa asegurando que el contenido esté expandido. */
  const toggle_fullscreen = () => {
    const next_fullscreen = !is_fullscreen;
    set_is_fullscreen(next_fullscreen);
    if (next_fullscreen && !is_expanded) {
      set_is_expanded(true);
    }
  };

  return {
    is_expanded,
    has_mounted,
    is_fullscreen,
    toggle_expanded,
    toggle_fullscreen,
  };
}
