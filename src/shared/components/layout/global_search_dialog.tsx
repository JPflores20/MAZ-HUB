/**
 * @fileoverview Lightweight header trigger button and Ctrl+K shortcut for lazy-loaded GlobalSearchModal.
 */

import type React from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";

const LazyGlobalSearchModal = lazy(() =>
  import("./global_search_modal").then((module) => ({ default: module.GlobalSearchModal })),
);

/**
 * Header trigger button and lazy command palette for instant in-memory cross-module search.
 */
export function GlobalSearchDialog(): React.ReactElement {
  const [is_open, set_is_open] = useState(false);

  useEffect(() => {
    const handle_keydown = (keyboard_event: KeyboardEvent) => {
      if (
        (keyboard_event.ctrlKey || keyboard_event.metaKey) &&
        keyboard_event.key.toLowerCase() === "k"
      ) {
        keyboard_event.preventDefault();
        set_is_open((previous_open) => !previous_open);
      }
    };
    window.addEventListener("keydown", handle_keydown);
    return () => window.removeEventListener("keydown", handle_keydown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => set_is_open(true)}
        className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-blue-100/80 hover:text-white transition-all cursor-pointer"
        title="Buscador global rápido (Ctrl + K)"
      >
        <Search className="size-3.5 text-blue-300" />
        <span className="hidden lg:inline">Buscar PDCA, RDA, acción o usuario...</span>
        <span className="lg:hidden">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-200">
          Ctrl K
        </kbd>
      </button>

      {is_open && (
        <Suspense fallback={null}>
          <LazyGlobalSearchModal is_open={is_open} set_is_open={set_is_open} />
        </Suspense>
      )}
    </>
  );
}
