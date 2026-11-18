/**
 * @fileoverview Header role filter tabs and text/area/role controls for the registered users table.
 */

import { Search } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/features/auth/auth_context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ROLE_FILTER_TABS } from "./user_workload_helpers";

interface AdminUserFiltersBarProps {
  filtered_count: number;
  total_count: number;
  counts_by_role: Record<"all" | UserRole, number>;
  available_areas: string[];
  search_query: string;
  set_search_query: (next_query: string) => void;
  area_filter: string;
  set_area_filter: (next_area: string) => void;
  role_filter: "all" | UserRole;
  set_role_filter: (next_role: "all" | UserRole) => void;
}

/**
 * Renders role pill tabs paired with search input, area filter, and role selector.
 */
export function AdminUserFiltersBar({
  filtered_count,
  total_count,
  counts_by_role,
  available_areas,
  search_query,
  set_search_query,
  area_filter,
  set_area_filter,
  role_filter,
  set_role_filter,
}: AdminUserFiltersBarProps) {
  const has_active_filters = Boolean(search_query || area_filter !== "all" || role_filter !== "all");

  return (
    <div className="flex flex-col gap-3.5 border-b border-border px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold">
            Usuarios Registrados ({filtered_count} de {total_count})
          </h2>
          <p className="text-xs text-muted-foreground">
            Filtra por categoría de usuario, aprueba cuentas, personaliza permisos o envía enlaces
            de recuperación por correo
          </p>
        </div>
        {has_active_filters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              set_search_query("");
              set_area_filter("all");
              set_role_filter("all");
            }}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
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
          onChange={(change_event) => set_role_filter(change_event.target.value as "all" | UserRole)}
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
