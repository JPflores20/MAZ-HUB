import { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { useTranslation } from "react-i18next";
import { format, isValid, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Trash2, CalendarClock, X, Calendar, FileSpreadsheet } from "lucide-react";
import * as xlsx from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { PhaseBadge } from "@/components/pdca/pdca-badge";

import { type Phase, type Pdca } from "@/data/pdca";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/components/pdca/pdca_dialog_header";
import { UserProfile } from "@/context/auth-context";

/**
 * Calcula el progreso de un PDCA
 */
export function getComputedProgress(p: Pdca): number {
  if (!p.completedSteps) return p.progreso || 0;
  const completed_steps = new Set(p.completedSteps);
  const completed_count = ALL_STEP_IDS.filter((id) => completed_steps.has(id)).length;
  return TOTAL_STEPS > 0 ? Math.round((completed_count / TOTAL_STEPS) * 100) : 0;
}

/**
 * Props para la tabla de proyectos
 */
interface ProjectTableProps {
  rows: Pdca[];
  query: string;
  setQuery: (val: string) => void;
  filter: Phase | "Todas";
  setFilter: (phase: Phase | "Todas") => void;
  current_user: UserProfile | null;
  is_admin: boolean;
  set_selected_id: (id: string) => void;
  request_delete: (e: React.MouseEvent, id: string) => void;
  handle_deadline_change: (id: string, date: Date | undefined, is_no_limit?: boolean) => void;
  handle_remove_deadline: (e: React.MouseEvent, id: string) => void;
}

/**
 * Componente que renderiza la tabla de proyectos con búsqueda
 */
export function ProjectTable({
  rows,
  query,
  setQuery,
  filter,
  setFilter,
  current_user,
  is_admin,
  set_selected_id,
  request_delete,
  handle_deadline_change,
  handle_remove_deadline,
}: ProjectTableProps) {
  const { t } = useTranslation();
  useShortcuts();

  // Estado local para el popover del calendario
  const [deadline_picker_open_id, set_deadline_picker_open_id] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Altura estimada de cada fila
    overscan: 5,
  });

  // Manejador del cambio de fecha con cierre de popover
  const on_deadline_select = async (
    pdca_id: string,
    date: Date | undefined,
    is_no_limit = false,
  ) => {
    await handle_deadline_change(pdca_id, date, is_no_limit);
    set_deadline_picker_open_id(null);
  };

  const handleExportExcel = () => {
    const dataToExport = rows.map((p) => ({
      ID: p.id,
      "Título del Proyecto": p.titulo,
      "Autor / Creador": p.autor || "Sin autor",
      "Email del Autor": p.autorEmail || "",
      Área: p.area,
      "Fase Actual": p.fase,
      "Progreso (%)": getComputedProgress(p),
      "Fecha Límite": p.fechaFinalizacion || "Sin asignar",
      "Última Actualización": p.actualizado,
    }));

    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Proyectos");

    xlsx.writeFile(workbook, "Proyectos_PDCA.xlsx");
  };

  return (
    <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      {/* Controles de Búsqueda y Filtros */}
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
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
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

      {/* Tabla Principal */}
      <div ref={parentRef} className="max-h-[600px] overflow-auto relative rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow className="bg-secondary/80 hover:bg-secondary/80">
              <TableHead className="font-semibold text-foreground/80">
                {t("table.projectTitle")}
              </TableHead>
              {current_user?.role === "admin" && (
                <TableHead className="hidden sm:table-cell font-semibold text-foreground/80">
                  {t("table.author")}
                </TableHead>
              )}
              <TableHead className="hidden md:table-cell font-semibold text-foreground/80">
                {t("table.area")}
              </TableHead>
              <TableHead className="w-32 font-semibold text-foreground/80">
                {t("table.currentPhase")}
              </TableHead>
              <TableHead className="hidden w-36 lg:table-cell font-semibold text-foreground/80">
                {t("table.deadline")}
              </TableHead>
              <TableHead className="hidden w-40 lg:table-cell font-semibold text-foreground/80">
                {t("table.updated")}
              </TableHead>
              <TableHead className="w-24 text-right font-semibold text-foreground/80">
                {t("table.action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {virtualizer.getVirtualItems().length > 0 && (
              <TableRow>
                <TableCell
                  style={{ height: `${virtualizer.getVirtualItems()[0]?.start || 0}px`, padding: 0 }}
                  colSpan={7}
                />
              </TableRow>
            )}
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const p = rows[virtualItem.index];
              if (!p) return null;
              return (
                <TableRow
                  key={p.id}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  className="cursor-pointer transition-colors hover:bg-secondary/30"
                  onClick={() => set_selected_id(p.id)}
                >
                  <TableCell>
                    <span className="block font-semibold">{p.titulo}</span>
                    <span className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      {p.id}
                      <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-secondary sm:block">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${getComputedProgress(p)}%` }}
                        />
                      </span>
                      <span className="hidden sm:inline">{getComputedProgress(p)}%</span>
                    </span>
                  </TableCell>
                  {current_user?.role === "admin" && (
                    <TableCell className="hidden sm:table-cell text-xs">
                      <span className="font-medium text-foreground block">
                        {p.autor || "Sin autor"}
                      </span>
                      {p.autorEmail && (
                        <span className="text-[11px] text-muted-foreground block">
                          {p.autorEmail}
                        </span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {p.area}
                  </TableCell>
                  <TableCell>
                    <PhaseBadge phase={p.fase} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {(() => {
                      const deadline_str = p.fechaFinalizacion?.trim();
                      const is_no_limit = deadline_str === "Sin límite";
                      let deadline_date: Date | undefined;
                      if (deadline_str && !is_no_limit) {
                        const parts = deadline_str.split("/");
                        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                          const parsed = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                          if (isValid(parsed)) deadline_date = parsed;
                        }
                      }
                      const is_expired = deadline_date
                        ? isBefore(startOfDay(deadline_date), startOfDay(new Date()))
                        : false;

                      if (is_admin) {
                        return (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Popover
                              open={deadline_picker_open_id === p.id}
                              onOpenChange={(open) =>
                                set_deadline_picker_open_id(open ? p.id : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <button
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary border ${
                                    is_expired
                                      ? "border-red-400/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20/50 dark:bg-red-950/20"
                                      : deadline_date || is_no_limit
                                        ? "border-border text-foreground bg-transparent"
                                        : "border-dashed border-muted-foreground/40 text-muted-foreground/60 italic"
                                  }`}
                                >
                                  <CalendarClock className="size-3.5 shrink-0" />
                                  {is_no_limit ? (
                                    "Sin límite"
                                  ) : deadline_date ? (
                                    <>
                                      {deadline_str}
                                      {is_expired && (
                                        <span className="ml-1 text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">
                                          Vencida
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    "Asignar fecha"
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                <CalendarUI
                                  mode="single"
                                  selected={deadline_date}
                                  onSelect={(date) => on_deadline_select(p.id, date)}
                                  locale={es}
                                  initialFocus
                                />
                                <div className="p-2 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs font-normal text-muted-foreground"
                                    onClick={() => on_deadline_select(p.id, undefined, true)}
                                  >
                                    Sin límite de tiempo
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                            {deadline_date && (
                              <button
                                title="Quitar fecha límite"
                                onClick={(e) => handle_remove_deadline(e, p.id)}
                                className="rounded p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <X className="size-3" />
                              </button>
                            )}
                          </div>
                        );
                      }

                      // Vista solo lectura para usuarios normales
                      return is_no_limit ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <CalendarClock className="size-3.5" />
                          Sin límite
                        </span>
                      ) : deadline_date ? (
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${is_expired ? "text-red-500 dark:text-red-400" : "text-foreground"}`}
                        >
                          <Calendar
                            className={`size-3.5 ${is_expired ? "text-red-500 dark:text-red-400" : "text-brand-yellow"}`}
                          />
                          {deadline_str}
                          {is_expired && (
                            <span className="text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">
                              Vencida
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-xs">Sin asignar</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      {p.actualizado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                      >
                        Abrir
                      </Button>
                      {current_user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={(e) => request_delete(e, p.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <TableRow>
                <TableCell
                  style={{
                    height: `${virtualizer.getTotalSize() - (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end || 0)}px`,
                    padding: 0,
                  }}
                  colSpan={7}
                />
              </TableRow>
            )}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No hay PDCAs que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
