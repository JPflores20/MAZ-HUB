/**
 * use_mobile.ts
 * Hook personalizado para detectar si el viewport actual corresponde a un dispositivo móvil (< 768px).
 */
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Suscribe a `window.matchMedia` para indicar de forma reactiva si la pantalla es móvil.
 *
 * @returns `true` cuando el ancho del viewport es menor a 768px.
 */
export function useIsMobile(): boolean {
  const [is_mobile, set_is_mobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const media_query_list = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handle_viewport_change = () => {
      set_is_mobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    media_query_list.addEventListener("change", handle_viewport_change);
    set_is_mobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => media_query_list.removeEventListener("change", handle_viewport_change);
  }, []);

  return Boolean(is_mobile);
}
