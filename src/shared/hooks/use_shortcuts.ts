/**
 * use_shortcuts.ts
 * Hook global para registrar atajos de teclado de productividad (Ctrl+K, Ctrl+S, Alt+N).
 */
import { useEffect } from "react";

/**
 * Registra listeners globales de teclado sobre `window` y los limpia al desmontar.
 */
export function useShortcuts(): void {
  useEffect(() => {
    const handle_key_down = (keyboard_event: KeyboardEvent) => {
      const normalized_key = keyboard_event.key.toLowerCase();

      // Ctrl/Cmd+K: enfocar la barra de búsqueda principal
      if ((keyboard_event.ctrlKey || keyboard_event.metaKey) && normalized_key === "k") {
        keyboard_event.preventDefault();
        const search_input = document.getElementById("search-input");
        if (search_input) {
          search_input.focus();
        }
      }

      // Ctrl/Cmd+S: emitir evento de guardado en el diálogo activo
      if ((keyboard_event.ctrlKey || keyboard_event.metaKey) && normalized_key === "s") {
        keyboard_event.preventDefault();
        document.dispatchEvent(new CustomEvent("shortcut:save"));
      }

      // Alt+N: disparar creación de nuevo elemento
      if (keyboard_event.altKey && normalized_key === "n") {
        keyboard_event.preventDefault();
        document.dispatchEvent(new CustomEvent("shortcut:new"));
      }
    };

    window.addEventListener("keydown", handle_key_down);
    return () => window.removeEventListener("keydown", handle_key_down);
  }, []);
}
