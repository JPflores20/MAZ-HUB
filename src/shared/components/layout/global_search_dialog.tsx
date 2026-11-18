/**
 * @fileoverview Command palette UI dialog (Ctrl+K / Cmd+K) for searching PDCAs, RDAs, actions, and users.
 */

import type React from "react";
import {
  ClipboardList,
  ExternalLink,
  ListChecks,
  Lock,
  Search,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { type SearchCategory, type SearchResultItem } from "./global_search_builders";
import { useGlobalSearch } from "./use_global_search";

const SEARCH_TABS: ReadonlyArray<{ id: SearchCategory; label: string }> = [
  { id: "ALL", label: "Todo" },
  { id: "PDCA", label: "PDCAs" },
  { id: "RDA", label: "RDAs" },
  { id: "ACTION", label: "Acciones" },
  { id: "USER", label: "Usuarios" },
];

/**
 * Renders the category icon matching a normalized search result item.
 */
function SearchCategoryIcon({
  category,
}: {
  category: SearchResultItem["category"];
}): React.ReactElement {
  if (category === "PDCA") {
    return <ClipboardList className="size-4" />;
  }
  if (category === "RDA") {
    return <ShieldAlert className="size-4" />;
  }
  if (category === "ACTION") {
    return <ListChecks className="size-4" />;
  }
  return <User className="size-4" />;
}

/**
 * Header trigger button and modal command palette for instant in-memory cross-module search.
 *
 * @returns {React.ReactElement} Search trigger button and controlled dialog overlay.
 */
export function GlobalSearchDialog(): React.ReactElement {
  const {
    is_open,
    set_is_open,
    search_query,
    set_search_query,
    selected_category,
    set_selected_category,
    filtered_results,
  } = useGlobalSearch();

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

      <Dialog open={is_open} onOpenChange={set_is_open}>
        <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">Buscador Global MAZ HUB</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <Search className="size-4 text-primary shrink-0" />
            <Input
              autoFocus
              value={search_query}
              onChange={(change_event) => set_search_query(change_event.target.value)}
              placeholder="Escribe folio, título de PDCA/RDA, equipo, causa raíz, acción o usuario..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 text-sm px-1"
            />
            {search_query && (
              <button
                type="button"
                onClick={() => set_search_query("")}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 bg-secondary/20 overflow-x-auto">
            {SEARCH_TABS.map((search_tab) => (
              <button
                key={search_tab.id}
                type="button"
                onClick={() => set_selected_category(search_tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selected_category === search_tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {search_tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60 p-2">
            {filtered_results.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No se encontraron coincidencias para "{search_query}".
              </div>
            ) : (
              filtered_results.map((result_item) => (
                <button
                  key={result_item.id}
                  type="button"
                  onClick={result_item.onSelect}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-secondary/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <SearchCategoryIcon category={result_item.category} />
                    </div>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {result_item.restricted && (
                          <Lock className="size-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{result_item.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {result_item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        result_item.restricted
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : ""
                      }`}
                    >
                      {result_item.badgeText}
                    </Badge>
                    {result_item.restricted ? (
                      <Lock className="size-3.5 text-amber-500" />
                    ) : (
                      <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
