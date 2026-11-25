/**
 * @fileoverview Header role filter tabs and text/area/role controls for the registered users table.
 */

import { Search } from "lucide-react";
import type { UserRole } from "@/features/auth/auth_context";
import { ROLE_LABELS } from "@/features/auth/role_permissions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AdminBulkApproveButton } from "./admin_bulk_approve_button";
import { ROLE_FILTER_TABS } from "./user_workload_helpers";

interface AdminUserFiltersBarProps {
  filtered_count: number;
  total_count: number;
  pending_corporate_count: number;
  is_bulk_approving: boolean;
  on_bulk_approve: () => Promise<void>;
  counts_by_role: Record<"all" | UserRole, number>;
  available_areas: string[];
  search_query: string;
  set_search_query: (next_query: string) => void;
  area_filter: string;
  set_area_filter: (next_area: string) => void;
  role_filter: "all" | UserRole;
  set_role_filter: (next_role: "all" | UserRole) => void;
  pending_only: boolean;
  set_pending_only: (next_pending: boolean) => void;
}

/**
 * Renders role pill tabs paired with search input, area filter, and role selector.
 */
export function AdminUserFiltersBar({
  filtered_count,
  total_count,
  pending_corporate_count,
  is_bulk_approving,
  on_bulk_approve,
  counts_by_role,
  available_areas,
  search_query,
  set_search_query,
  area_filter,
  set_area_filter,
  role_filter,
  set_role_filter,
  pending_only,
  set_pending_only,
}: AdminUserFiltersBarProps) {
  const has_active_filters = Boolean(
    search_query || area_filter !== "all" || role_filter !== "all" || pending_only,
  );

  return (
    <div className="flex flex-col gap-3.5 border-b border-border px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold">
            Usuarios Registrados ({filtered_count} de {total_count})
          </h2>
          <p className="text-xs text-muted-foreground">
            Los usuarios que verifican su correo acceden automáticamente; aquí puedes aprobar
            pendientes antes de tiempo o ajustar permisos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminBulkApproveButton
            pending_corporate_count={pending_corporate_count}
            is_bulk_approving={is_bulk_approving}
            on_bulk_approve={on_bulk_approve}
          />
          {has_active_filters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                set_search_query("");
                set_area_filter("all");
                set_role_filter("all");
                set_pending_only(false);
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {ROLE_FILTER_TABS.map((filter_tab) => {
          const is_active = role_filter === filter_tab.id;
          const tab_count = counts_by_role[filter_tab.id] || 0;
          return (
            <button
              key={filter_tab.id}
              type="button"
              onClick={() => set_role_filter(filter_tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                is_active
                  ? `${filter_tab.badgeClass} ring-2 ring-primary/30 shadow-xs`
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <span>{filter_tab.label}</span>
              <span className="rounded-full bg-background/80 px-1.5 py-0 text-[10px] font-bold">
                {tab_count}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => set_pending_only(!pending_only)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            pending_only
              ? "border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30 shadow-xs"
              : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <span>Pendientes</span>
          <span className="rounded-full bg-background/80 px-1.5 py-0 text-[10px] font-bold">
            {pending_corporate_count}
          </span>
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search_query}
            onChange={(change_event) => set_search_query(change_event.target.value)}
            placeholder="Buscar nombre, correo o puesto..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <select
          value={area_filter}
          onChange={(change_event) => set_area_filter(change_event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background"
        >
          <option value="all">Todas las Áreas</option>
          {available_areas.map((area_name) => (
            <option key={area_name} value={area_name}>
              {area_name}
            </option>
          ))}
        </select>

        <select
          value={role_filter}
          onChange={(change_event) =>
            set_role_filter(change_event.target.value as "all" | UserRole)
          }
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background"
        >
          <option value="all">Todos los Roles</option>
          <option value="admin">{ROLE_LABELS.admin}</option>
          <option value="area_lead">{ROLE_LABELS.area_lead}</option>
          <option value="user">{ROLE_LABELS.user}</option>
          <option value="intern">{ROLE_LABELS.intern}</option>
          <option value="viewer">{ROLE_LABELS.viewer}</option>
        </select>
      </div>
    </div>
  );
}
