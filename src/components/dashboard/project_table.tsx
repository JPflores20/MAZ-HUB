/**
 * project_table.tsx
 * Tabla resumen y vista de Tablero Kanban de proyectos PDCA con indicadores de progreso y acceso rápido.
 */
import { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { useTranslation } from "react-i18next";
import { isValid, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  Filter,
  Trash2,
  CalendarClock,
  X,
  Calendar,
  FileSpreadsheet,
  UserPlus,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Lock,
} from "lucide-react";
import * as xlsx from "xlsx";
import { toast } from "sonner";

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
import {
  ResponsibleAvatarStack,
  useDirectoryUsers,
} from "@/components/ui/responsible-profile-card";
import { canUserAccessPdca } from "@/components/ui/access-request-dialog";

import { type Phase, type Pdca } from "@/data/pdca";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/components/pdca/pdca_dialog_header";
import { UserProfile, getEffectivePermissions } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { updatePdcaAssignedUsers } from "@/services/pdca-service";

const PDCA_VIEW_MODE_KEY = "maz_hub_pdca_view_mode";

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

const KANBAN_PHASES: {
  phase: Phase;
  label: string;
  accent: string;
  badgeBg: string;
}[] = [
  {
    phase: "Plan",
    label: "Plan (Planificar)",
    accent: "border-t-blue-500",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    phase: "Do",
    label: "Do (Hacer)",
    accent: "border-t-amber-500",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    phase: "Check",
    label: "Check (Verificar)",
    accent: "border-t-purple-500",
    badgeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    phase: "Act",
    label: "Act (Actuar)",
    accent: "border-t-emerald-500",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
];

/**
 * Componente que renderiza la tabla o tablero Kanban de proyectos con búsqueda
 */
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
  const { t } = useTranslation();
  const { directory: available_users, resolveUser } = useDirectoryUsers();
  const { refresh } = usePdcas();
  const user_permissions = getEffectivePermissions(current_user);
  useShortcuts();

  const [view_mode, set_view_mode] = useState<"table" | "kanban">(() => {
    try {
      return localStorage.getItem(PDCA_VIEW_MODE_KEY) === "kanban" ? "kanban" : "table";
    } catch {
      return "table";
    }
  });

  const handle_change_view_mode = (mode: "table" | "kanban") => {
    set_view_mode(mode);
    try {
      localStorage.setItem(PDCA_VIEW_MODE_KEY, mode);
    } catch {
      // Ignorar errores de almacenamiento
    }
  };

  // Estado local para el popover del calendario
  const [deadline_picker_open_id, set_deadline_picker_open_id] = useState<string | null>(null);
  const [custom_user_by_pdca, set_custom_user_by_pdca] = useState<Record<string, string>>({});

  const handle_toggle_pdca_user = async (
    pdca: Pdca,
    target_user: { name: string; email: string },
  ) => {
    const current_assigned = pdca.asignados || [];
    const exists = current_assigned.some(
      (a) =>
        (target_user.email && a.email.toLowerCase() === target_user.email.toLowerCase()) ||
        a.name.toLowerCase() === target_user.name.toLowerCase(),
    );
    const next_assigned = exists
      ? current_assigned.filter(
          (a) =>
            !(
              (target_user.email && a.email.toLowerCase() === target_user.email.toLowerCase()) ||
              a.name.toLowerCase() === target_user.name.toLowerCase()
            ),
        )
      : [...current_assigned, target_user];

    try {
      await updatePdcaAssignedUsers(pdca.id, next_assigned);
      await refresh();
    } catch (err) {
      console.error("Error al asignar usuarios al PDCA:", err);
      toast.error("No se pudo actualizar la asignación de usuarios.");
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
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
      "Responsables Asignados": (p.asignados || []).map((u) => u.name).join(", ") || "Sin asignar",
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
      {/* Controles de Búsqueda, Toggle de Vista y Filtros */}
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Vista: Tabla vs Kanban */}
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
              <TableIcon className="size-3.5" />
              Tabla
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
              <LayoutGrid className="size-3.5" />
              Kanban
            </button>
          </div>

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

      {view_mode === "kanban" ? (
        /* Vista Tablero Kanban por Fase (Plan, Do, Check, Act) */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pt-1">
          {KANBAN_PHASES.map((col) => {
            const col_items = rows.filter((p) => p.fase === col.phase);
            return (
              <div
                key={col.phase}
                className={`flex flex-col rounded-xl border border-border bg-secondary/20 border-t-4 ${col.accent} min-h-[380px] max-h-[650px]`}
              >
                <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-2.5 bg-card/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${col.badgeBg}`}
                  >
                    {col_items.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {col_items.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      Sin PDCAs en fase {col.phase}
                    </div>
                  ) : (
                    col_items.map((p) => {
                      const has_access = canUserAccessPdca(p, current_user, user_permissions);
                      const progress = getComputedProgress(p);
                      const assigned_list = p.asignados || [];
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
                      const is_expired =
                        deadline_date && !(p.fase === "Act" && progress === 100)
                          ? isBefore(startOfDay(deadline_date), startOfDay(new Date()))
                          : false;

                      return (
                        <div
                          key={p.id}
                          onClick={() => set_selected_id(p.id)}
                          className="group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-muted-foreground">
                              {!has_access && <Lock className="size-3 text-amber-500" />}
                              {p.id}
                            </span>
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[130px]">
                              {p.area}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {p.titulo}
                          </p>

                          {!has_access && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <Lock className="size-2.5" /> Solicitar permiso
                            </span>
                          )}

                          {/* Barra de progreso */}
                          <div className="mt-2.5 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Avance metodológico</span>
                              <span className="font-bold text-foreground">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Pie de tarjeta: Responsables apilados y Fecha límite */}
                          <div
                            className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ResponsibleAvatarStack
                              size="sm"
                              maxVisible={4}
                              assignedUsers={assigned_list.map((person) => resolveUser(person))}
                              availableUsers={available_users}
                              resolveUser={resolveUser}
                              onToggleUser={
                                user_permissions.canManageAssignment && has_access
                                  ? (u) =>
                                      void handle_toggle_pdca_user(p, {
                                        name: u.name,
                                        email: u.email,
                                      })
                                  : undefined
                              }
                              onRemoveUser={
                                user_permissions.canManageAssignment && has_access
                                  ? (u) =>
                                      void handle_toggle_pdca_user(p, {
                                        name: u.name,
                                        email: u.email,
                                      })
                                  : undefined
                              }
                              onAddCustomName={
                                user_permissions.canManageAssignment && has_access
                                  ? (val) =>
                                      void handle_toggle_pdca_user(p, {
                                        name: val.toUpperCase(),
                                        email: `${val.toLowerCase().replace(/\s+/g, ".")}@colaborador.local`,
                                      })
                                  : undefined
                              }
                            />

                            {deadline_str && (
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                                  is_expired
                                    ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                <CalendarClock className="size-2.5" />
                                {deadline_str}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabla Principal */
        <div ref={parentRef} className="max-h-[600px] overflow-auto relative rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                <TableHead className="font-semibold text-foreground/80">
                  {t("table.projectTitle")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.responsible", "RESPONSABLE")}
                </TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-foreground/80">
                  {t("table.author")}
                </TableHead>
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
                <TableHead className="w-32 text-right font-semibold text-foreground/80">
                  {t("table.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {virtualizer.getVirtualItems().length > 0 && (
                <TableRow>
                  <TableCell
                    style={{
                      height: `${virtualizer.getVirtualItems()[0]?.start || 0}px`,
                      padding: 0,
                    }}
                    colSpan={8}
                  />
                </TableRow>
              )}
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const p = rows[virtualItem.index];
                if (!p) return null;
                const has_access = canUserAccessPdca(p, current_user, user_permissions);
                return (
                  <TableRow
                    key={p.id}
                    ref={virtualizer.measureElement}
                    data-index={virtualItem.index}
                    className="cursor-pointer transition-colors hover:bg-secondary/30"
                    onClick={() => set_selected_id(p.id)}
                  >
                    <TableCell>
                      <span className="flex items-center gap-1.5 font-semibold">
                        {!has_access && (
                          <span title="Sin acceso directo: haz clic para solicitar permiso">
                            <Lock className="size-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <span>{p.titulo}</span>
                      </span>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ResponsibleAvatarStack
                        size="md"
                        maxVisible={5}
                        assignedUsers={(p.asignados || []).map((person) => resolveUser(person))}
                        availableUsers={available_users}
                        resolveUser={resolveUser}
                        onToggleUser={
                          user_permissions.canManageAssignment && has_access
                            ? (u) =>
                                void handle_toggle_pdca_user(p, {
                                  name: u.name,
                                  email: u.email,
                                })
                            : undefined
                        }
                        onRemoveUser={
                          user_permissions.canManageAssignment && has_access
                            ? (u) =>
                                void handle_toggle_pdca_user(p, {
                                  name: u.name,
                                  email: u.email,
                                })
                            : undefined
                        }
                        onAddCustomName={
                          user_permissions.canManageAssignment && has_access
                            ? (val) =>
                                void handle_toggle_pdca_user(p, {
                                  name: val.toUpperCase(),
                                  email: `${val.toLowerCase().replace(/\s+/g, ".")}@colaborador.local`,
                                })
                            : undefined
                        }
                      />
                    </TableCell>
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

                        if (user_permissions.canManageAssignment && has_access) {
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

                        // Vista solo lectura para usuarios sin permiso canManageAssignment
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
                          <span className="text-muted-foreground/50 italic text-xs">
                            Sin asignar
                          </span>
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
                        {has_access ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                          >
                            Abrir
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] font-semibold gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          >
                            <Lock className="size-3" />
                            Solicitar permiso
                          </Button>
                        )}
                        {user_permissions.canDelete && has_access && (
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
      )}
    </div>
  );
}
