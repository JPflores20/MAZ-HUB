/**
 * @fileoverview Search input, area/status filter controls, view switcher, and Excel export CTA for `/rda`.
 */

import { FileSpreadsheet, LayoutGrid, Search, Table as TableIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface RdaFiltersBarProps {
  search_term: string;
  on_search_change: (value: string) => void;
  area_filter: string;
  on_area_change: (area_value: string) => void;
  available_areas: string[];
  status_filter: string;
  on_clear_status: () => void;
  view_mode: "table" | "kanban";
  on_change_view_mode: (mode: "table" | "kanban") => void;
  on_export_excel: () => void;
}

/** Toolbar above the RDA table/Kanban list for searching, filtering, switching layout, and exporting. */
export function RdaFiltersBar({
  search_term,
  on_search_change,
  area_filter,
  on_area_change,
  available_areas,
  status_filter,
  on_clear_status,
  view_mode,
  on_change_view_mode,
  on_export_excel,
}: RdaFiltersBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder", "Buscar Folio, Título o Resp...")}
            className="pl-9 pr-4 bg-card"
            value={search_term}
            onChange={(change_event) => on_search_change(change_event.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={area_filter}
          onChange={(change_event) => on_area_change(change_event.target.value)}
        >
          <option value="all">Todas las Áreas</option>
          {available_areas.map((area_label) => (
            <option key={area_label} value={area_label}>
              {area_label}
            </option>
          ))}
        </select>
        {status_filter !== "all" && (
          <Button
            variant="outline"
            size="sm"
            onClick={on_clear_status}
            className="h-10 text-xs gap-1 border-dashed text-primary hover:text-primary shrink-0"
          >
            Estatus: <strong className="ml-1">{status_filter}</strong>
            <span className="ml-1 text-muted-foreground font-normal">✕</span>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
          <button
            type="button"
            onClick={() => on_change_view_mode("table")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              view_mode === "table"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Vista de Tabla"
          >
            <TableIcon className="size-3.5" />
            Tabla
          </button>
          <button
            type="button"
            onClick={() => on_change_view_mode("kanban")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              view_mode === "kanban"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Vista de Tablero Kanban por Estatus"
          >
            <LayoutGrid className="size-3.5" />
            Kanban
          </button>
        </div>

        <Button
          variant="default"
          onClick={on_export_excel}
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white border-none shadow-md transition-all hover:scale-105"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
        </Button>
      </div>
    </div>
  );
}
