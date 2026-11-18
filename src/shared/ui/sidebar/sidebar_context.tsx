/**
 * sidebar_context.tsx
 * Estado global de la barra lateral (`SidebarProvider`), persistencia en cookie y hook `useSidebar`.
 */
import * as React from "react";
import { useIsMobile } from "@/shared/hooks/use_mobile";
import { cn } from "@/shared/utils/class_names";
import { TooltipProvider } from "@/shared/ui/tooltip";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "3rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/**
 * Devuelve el estado y los controles para expandir/colapsar la barra lateral activa.
 *
 * @returns Propiedades de contexto del proveedor `<SidebarProvider />`.
 */
export function useSidebar() {
  const sidebar_context = React.useContext(SidebarContext);
  if (!sidebar_context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return sidebar_context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: controlled_open,
      onOpenChange: set_controlled_open,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const is_mobile = useIsMobile();
    const [open_mobile, set_open_mobile] = React.useState(false);
    const [internal_open, set_internal_open] = React.useState(defaultOpen);
    const open = controlled_open ?? internal_open;

    const set_open = React.useCallback(
      (next_value: boolean | ((previous_open: boolean) => boolean)) => {
        const next_open_state = typeof next_value === "function" ? next_value(open) : next_value;
        if (set_controlled_open) {
          set_controlled_open(next_open_state);
        } else {
          set_internal_open(next_open_state);
        }

        // Persiste la preferencia de apertura entre recargas mediante cookie local
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next_open_state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [set_controlled_open, open],
    );

    const toggle_sidebar = React.useCallback(() => {
      return is_mobile
        ? set_open_mobile((previous_open) => !previous_open)
        : set_open((previous_open) => !previous_open);
    }, [is_mobile, set_open, set_open_mobile]);

    React.useEffect(() => {
      const handle_key_down = (keyboard_event: KeyboardEvent) => {
        if (
          keyboard_event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (keyboard_event.metaKey || keyboard_event.ctrlKey)
        ) {
          keyboard_event.preventDefault();
          toggle_sidebar();
        }
      };

      window.addEventListener("keydown", handle_key_down);
      return () => window.removeEventListener("keydown", handle_key_down);
    }, [toggle_sidebar]);

    const sidebar_state = open ? "expanded" : "collapsed";

    const context_value = React.useMemo<SidebarContextProps>(
      () => ({
        state: sidebar_state,
        open,
        setOpen: set_open,
        isMobile: is_mobile,
        openMobile: open_mobile,
        setOpenMobile: set_open_mobile,
        toggleSidebar: toggle_sidebar,
      }),
      [sidebar_state, open, set_open, is_mobile, open_mobile, set_open_mobile, toggle_sidebar],
    );

    return (
      <SidebarContext.Provider value={context_value}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";
