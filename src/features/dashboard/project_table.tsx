/**
 * @fileoverview PDCA project bank container providing search, Table/Kanban view switcher, and Excel export.
 */

import type React from "react";
import { lazy, Suspense, useState } from "react";
import { FileSpreadsheet, Filter, LayoutGrid, Search, Table as TableIcon } from "lucide-react";
import type { Pdca, Phase } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import { get_effective_permissions } from "@/features/auth/role_permissions";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { usePdcas } from "@/shared/context/pdca_context";
import { useShortcuts } from "@/shared/hooks/use_shortcuts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { export_pdcas_to_excel, toggle_pdca_assigned_user } from "./pdca_table_actions";
import { PdcaVirtualTable } from "./pdca_virtual_table";

const LazyPdcaKanbanBoard = lazy(() =>
  import("./pdca_kanban_board").then((kanban_module) => ({
    default: kanban_module.PdcaKanbanBoard,
  })),
);

const PDCA_VIEW_MODE_KEY = "maz_hub_pdca_view_mode";

interface ProjectTableProps {
  rows: Pdca[];
  query: string;
  setQuery: (value: string) => void;
  filter: Phase | "Todas";
  setFilter: (phase: Phase | "Todas") => void;
  current_user: UserProfile | null;
  is_admin: boolean;
  set_selected_id: (id: string) => void;
  request_delete: (click_event: React.MouseEvent, id: string) => void;
  handle_deadline_change: (id: string, date: Date | undefined, is_no_limit?: boolean) => void;
  handle_remove_deadline: (click_event: React.MouseEvent, id: string) => void;
}

/** Coordinates search controls, Excel formula-injection-safe exports, and Table/Kanban rendering. */
export function ProjectTable({
  rows,
  query,
  setQuery,
  filter,
  setFilter,
  current_user,
  set_selected_id,
  request_delete,
  handle_deadline_change,
  handle_remove_deadline,
}: ProjectTableProps) {
  const { directory: available_users, resolve_user } = useDirectoryUsers();
  const { refresh } = usePdcas();
  const user_permissions = get_effective_permissions(current_user);
  useShortcuts();

  const [view_mode, set_view_mode] = useState<"table" | "kanban">(() => {
    try {
      return localStorage.getItem(PDCA_VIEW_MODE_KEY) === "kanban" ? "kanban" : "table";
    } catch {
      return "table";
    }
  });

  const handle_change_view_mode = (next_mode: "table" | "kanban") => {
    set_view_mode(next_mode);
    try {
      localStorage.setItem(PDCA_VIEW_MODE_KEY, next_mode);
    } catch {
      // Ignore storage errors
    }
  };

  const handle_toggle_pdca_user = (
    pdca_entry: Pdca,
    target_user: { name: string; email: string },
  ) => toggle_pdca_assigned_user(pdca_entry, target_user, refresh);

  return (
    <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder={
              current_user?.role === "admin"
                ? "Buscar por título, área o autor..."
                : "Buscar por título o área..."
            }
            value={query}
            onChange={(change_event) => setQuery(change_event.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
            <button
              type="button"
              onClick={() => handle_change_view_mode("table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                view_mode === "table"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vista de Tabla"
            >
              <TableIcon className="size-3.5" /> Tabla
            </button>
            <button
              type="button"
              onClick={() => handle_change_view_mode("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                view_mode === "kanban"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vista de Tablero Kanban por Fase"
            >
              <LayoutGrid className="size-3.5" /> Kanban
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void export_pdcas_to_excel(rows)}
            className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-500 dark:border-green-500 dark:hover:bg-green-950/30"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("Todas")}
            disabled={filter === "Todas"}
          >
            <Filter /> {filter === "Todas" ? "Todas las fases" : `Fase: ${filter}`}
          </Button>
        </div>
      </div>

      {view_mode === "kanban" ? (
        <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-xl" />}>
          <LazyPdcaKanbanBoard
            rows={rows}
            current_user={current_user}
            user_permissions={user_permissions}
            available_users={available_users}
            resolve_user={resolve_user}
            on_select_pdca={set_selected_id}
            on_toggle_pdca_user={handle_toggle_pdca_user}
          />
        </Suspense>
      ) : (
        <PdcaVirtualTable
          rows={rows}
          current_user={current_user}
          user_permissions={user_permissions}
          available_users={available_users}
          resolve_user={resolve_user}
          on_select_pdca={set_selected_id}
          on_request_delete={request_delete}
          on_deadline_change={handle_deadline_change}
          on_remove_deadline={handle_remove_deadline}
          on_toggle_pdca_user={handle_toggle_pdca_user}
        />
      )}
    </div>
  );
}
