/**
 * rda.tsx
 * Ruta principal del módulo de Reportes de Anomalía (RDA).
 * Muestra las 3 tarjetas de estado (Abierto, Cerrado, Evaluado), filtros por año/mes/planta/proceso/estatus,
 * exportación a Excel (.xlsx), listado tabular o Tablero Kanban y apertura del editor RdaDialog.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  LayoutGrid,
  Table as TableIcon,
  CalendarClock,
  Lock,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import React, { lazy, Suspense } from "react";
const LazyRdaDialog = lazy(() =>
  import("@/components/RDA/RdaDialog").then((m) => ({ default: m.RdaDialog })),
);
import { updateRda, deleteRda } from "@/services/rda-service";
import { useRdas } from "@/context/rda-context";
import { Rda, defaultRda } from "@/data/rda";
import { AREAS } from "@/data/pdca-defaults";
import { getRdaDisplayName, generateNextRdaFolio } from "@/components/RDA/rda-name";
import { getRdaStatus } from "@/components/RDA/rda-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ResponsibleAvatarStack,
  useDirectoryUsers,
} from "@/components/ui/responsible-profile-card";
import {
  AccessRequestDialog,
  AccessRequestTarget,
  buildRdaAccessTarget,
  canUserAccessRda,
} from "@/components/ui/access-request-dialog";

const RDA_VIEW_MODE_KEY = "maz_hub_rda_view_mode";

export const Route = createFileRoute("/rda")({
  component: RdaPage,
});

function getRdaResponsiblesList(rda: Rda): string[] {
  const fromContext = (rda.context?.responsable || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromContext.length > 0) return fromContext;
  return (rda.portada?.usuariosAsignados || []).map((s) => s.trim()).filter(Boolean);
}

const RDA_KANBAN_COLUMNS = [
  {
    status: "Abierto",
    label: "Abierto (En Análisis / Acción)",
    accent: "border-t-blue-600",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    status: "Cerrado",
    label: "Cerrado (Fases 1-3 Completas)",
    accent: "border-t-emerald-600",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    status: "Evaluado",
    label: "Evaluado (Fases 4-5 Completas)",
    accent: "border-t-purple-600",
    badgeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
] as const;

function RdaPage() {
  const { t } = useTranslation();
  const { currentUser, permissions } = useAuth();
  const { directory: availableUsers, resolveUser } = useDirectoryUsers();
  const {
    rdaList: userRdas,
    allRdas,
    loading,
    refresh,
    updateRdaInCache,
    removeRdaFromCache,
  } = useRdas();
  const [selectedRda, setSelectedRda] = useState<Rda | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rdaToDelete, setRdaToDelete] = useState<string | null>(null);
  const [accessRequestTarget, setAccessRequestTarget] = useState<AccessRequestTarget | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">(() => {
    try {
      return localStorage.getItem(RDA_VIEW_MODE_KEY) === "kanban" ? "kanban" : "table";
    } catch {
      return "table";
    }
  });

  const handleChangeViewMode = (mode: "table" | "kanban") => {
    setViewMode(mode);
    try {
      localStorage.setItem(RDA_VIEW_MODE_KEY, mode);
    } catch {
      // Ignorar errores de almacenamiento
    }
  };

  // Si el usuario viene desde la bandeja de acciones del Dashboard o buscador global, abrir el RDA solicitado
  useEffect(() => {
    if (loading || allRdas.length === 0) return;
    try {
      const targetId = sessionStorage.getItem("maz_hub_open_rda_id");
      if (targetId) {
        sessionStorage.removeItem("maz_hub_open_rda_id");
        const found = allRdas.find((r) => r.id === targetId);
        if (found) {
          if (canUserAccessRda(found, currentUser, permissions)) {
            setSelectedRda(found);
            setIsDialogOpen(true);
          } else {
            setAccessRequestTarget(buildRdaAccessTarget(found));
          }
        }
      }
    } catch {
      // Ignorar errores de sessionStorage
    }
  }, [loading, allRdas, currentUser, permissions]);

  const handleToggleRdaResponsible = async (rda: Rda, personName: string) => {
    if (!permissions.canManageAssignment) return;
    const normalized = personName.trim();
    if (!normalized) return;
    const currentList = getRdaResponsiblesList(rda);
    const exists = currentList.some((p) => p.toLowerCase() === normalized.toLowerCase());
    const nextList = exists
      ? currentList.filter((p) => p.toLowerCase() !== normalized.toLowerCase())
      : [...currentList, normalized];
    const nextString = nextList.join(", ");

    const updatedRda: Rda = {
      ...rda,
      context: {
        ...rda.context,
        responsable: nextString,
      },
      portada: {
        ...(rda.portada || defaultRda.portada!),
        usuariosAsignados: nextList,
      },
    };

    try {
      const saved = await updateRda(updatedRda);
      updateRdaInCache(saved);
    } catch (err) {
      console.error("Error al asignar responsables al RDA:", err);
      toast.error("No se pudo actualizar la asignación de responsables.");
    }
  };

  const handleCreateNew = () => {
    if (!permissions.canCreate) return;
    const nextFolio = generateNextRdaFolio(allRdas);
    const newRda: Rda = {
      ...defaultRda,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      portada: {
        ...defaultRda.portada!,
        autorOriginal: currentUser?.name || "",
        autorEmail: currentUser?.email || "",
        area: currentUser?.area || "",
      },
      context: {
        ...defaultRda.context,
        folio: nextFolio,
        iniciadoPor: currentUser?.name || "",
        area: currentUser?.area || "",
      },
    };
    setSelectedRda(newRda);
    setIsDialogOpen(true);
  };

  const handleEdit = (rda: Rda) => {
    if (!canUserAccessRda(rda, currentUser, permissions)) {
      setAccessRequestTarget(buildRdaAccessTarget(rda));
      return;
    }
    setSelectedRda(rda);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!permissions.canDelete) return;
    setRdaToDelete(id);
  };

  const confirmDelete = async () => {
    if (rdaToDelete && permissions.canDelete) {
      await deleteRda(rdaToDelete);
      removeRdaFromCache(rdaToDelete);
      setRdaToDelete(null);
    }
  };

  // Persiste y actualiza la caché en memoria (0 re-lecturas de colección a Firestore).
  const handleSave = async (rda: Rda) => {
    const saved = await updateRda(rda);
    updateRdaInCache(saved);
    return saved;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const availableAreas = React.useMemo(() => {
    const areaMap = new Map<string, string>();
    allRdas.forEach((r) => {
      const raw = (r.context?.area || r.portada?.area || "").trim().replace(/\s+/g, " ");
      if (raw) {
        const key = raw.toLowerCase();
        if (!areaMap.has(key)) {
          const matched = AREAS.find(
            (a) => a.value.toLowerCase() === key || a.label.toLowerCase() === key,
          );
          areaMap.set(key, matched ? matched.label : raw);
        }
      }
    });
    return Array.from(areaMap.values()).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [allRdas]);

  const filteredRdas = allRdas.filter((rda) => {
    const term = searchTerm.toLowerCase();
    const title = getRdaDisplayName(rda).toLowerCase();
    const folio = (rda.context?.folio || "").toLowerCase();
    const resp = getRdaResponsiblesList(rda).join(", ").toLowerCase();
    const author = (rda.portada?.autorOriginal || "").toLowerCase();
    const matchesSearch =
      title.includes(term) || folio.includes(term) || resp.includes(term) || author.includes(term);

    const rdaArea = (rda.context?.area || rda.portada?.area || "").trim().toLowerCase();
    const matchesArea = areaFilter === "all" || rdaArea === areaFilter.trim().toLowerCase();

    const rdaStatus = getRdaStatus(rda);
    const matchesStatus = statusFilter === "all" || rdaStatus === statusFilter;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const exportExcel = () => {
    const data = filteredRdas.map((rda) => ({
      Folio: rda.context?.folio || "-",
      Titulo: getRdaDisplayName(rda),
      Estatus: getRdaStatus(rda),
      Planta: rda.context?.planta || "-",
      Area: rda.context?.area || "-",
      Responsable: getRdaResponsiblesList(rda).join(", ") || "-",
      Autor: rda.portada?.autorOriginal || "-",
      FechaLimite: rda.portada?.fechaLimite
        ? new Date(rda.portada.fechaLimite).toLocaleDateString("es-ES")
        : "-",
      Actualizado: rda.updatedAt
        ? new Date(rda.updatedAt).toLocaleDateString("es-ES")
        : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mis RDA");
    XLSX.writeFile(wb, "Mis_RDA.xlsx");
  };

  if (selectedRda || isDialogOpen) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
          <LazyRdaDialog
            rda={selectedRda}
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedRda(null);
                setIsDialogOpen(false);
              }
            }}
            onSave={permissions.canEdit ? handleSave : undefined}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("rdaModule")}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">{t("myRdas")}</h1>
          <div className="mt-1">
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {allRdas.length} {t("reportsRegistered")}{" "}
                {permissions.canViewAll
                  ? t("globalView")
                  : `• Banco global de RDAs (${userRdas.length} con acceso directo)`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="hidden sm:flex bg-card mr-2"
            title="Sincronizar con la nube"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          {permissions.canCreate && (
            <Button
              variant="default"
              onClick={handleCreateNew}
              className="bg-primary shadow-sm hover:bg-brand-dark text-primary-foreground"
            >
              <Plus className="mr-1.5 size-4" /> {t("createNewRda")}
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: "Abierto",
              label: t("openStatus", "Abierto"),
              count: allRdas.filter((r) => getRdaStatus(r) === "Abierto").length,
              color: "border-t-blue-600",
              bgDot: "bg-blue-600",
              description: "RDAs en estatus abierto",
            },
            {
              id: "Cerrado",
              label: t("closedStatus", "Cerrado"),
              count: allRdas.filter((r) => getRdaStatus(r) === "Cerrado").length,
              color: "border-t-emerald-600",
              bgDot: "bg-emerald-600",
              description: "Fases 1, 2 y 3 completas",
            },
            {
              id: "Evaluado",
              label: t("evaluatedStatus", "Evaluado"),
              count: allRdas.filter((r) => getRdaStatus(r) === "Evaluado").length,
              color: "border-t-purple-600",
              bgDot: "bg-purple-600",
              description: "Fases 4 y 5 completas",
            },
          ].map((card) => {
            const isSelected = statusFilter === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === card.id ? "all" : card.id))}
                className={`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 cursor-pointer ${card.color} ${
                  isSelected ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${card.bgDot}`}></span>
                    <span className="text-sm font-semibold uppercase">{card.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{card.count}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{card.description}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder", "Buscar Folio, Título o Resp...")}
              className="pl-9 pr-4 bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="all">Todas las Áreas</option>
            {availableAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {statusFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="h-10 text-xs gap-1 border-dashed text-primary hover:text-primary shrink-0"
            >
              Estatus: <strong className="ml-1">{statusFilter}</strong>
              <span className="ml-1 text-muted-foreground font-normal">✕</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Vista: Tabla vs Kanban */}
          <div className="inline-flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
            <button
              type="button"
              onClick={() => handleChangeViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
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
              onClick={() => handleChangeViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "kanban"
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
            onClick={exportExcel}
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white border-none shadow-md transition-all hover:scale-105"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        /* Vista Tablero Kanban por Estatus (Abierto, Cerrado, Evaluado) */
        <div className="grid gap-5 md:grid-cols-3">
          {RDA_KANBAN_COLUMNS.map((col) => {
            const colItems = filteredRdas.filter((r) => getRdaStatus(r) === col.status);
            return (
              <div
                key={col.status}
                className={`flex flex-col rounded-xl border border-border bg-card/60 border-t-4 ${col.accent} min-h-[420px] max-h-[680px] shadow-[var(--shadow-card)]`}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${col.badgeBg}`}
                  >
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {colItems.length === 0 ? (
                    <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      Sin RDAs en estatus {col.status}
                    </div>
                  ) : (
                    colItems.map((rda) => {
                      const hasAccess = canUserAccessRda(rda, currentUser, permissions);
                      const assignedList = getRdaResponsiblesList(rda);
                      const dateStr = rda.portada?.fechaLimite;
                      let formattedDeadline = "";
                      if (dateStr) {
                        const d = new Date(dateStr);
                        formattedDeadline = isNaN(d.getTime())
                          ? dateStr
                          : d.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            });
                      }
                      const totalActions =
                        (rda.validationActions?.length || 0) + (rda.pda?.length || 0);
                      const completedActions =
                        (rda.validationActions?.filter((a) => a.estatus === "Completa").length ||
                          0) +
                        (rda.pda?.filter((a) => a.status === "Completada").length || 0);

                      return (
                        <div
                          key={rda.id}
                          onClick={() => handleEdit(rda)}
                          className={`group cursor-pointer rounded-lg border bg-card p-3.5 shadow-xs transition-all hover:shadow-md ${
                            hasAccess
                              ? "border-border hover:border-primary/50"
                              : "border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                              {!hasAccess && <Lock className="size-3 text-amber-500" />}
                              {rda.context?.folio || `#${rda.id.slice(-5)}`}
                            </span>
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[140px]">
                              {rda.context?.area || rda.portada?.area || rda.context?.planta || "General"}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {getRdaDisplayName(rda)}
                          </p>

                          {!hasAccess ? (
                            <div className="mt-2.5">
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                <Lock className="size-2.5" />
                                Solicitar permiso
                              </span>
                            </div>
                          ) : (
                            totalActions > 0 && (
                              <div className="mt-2.5 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>Acciones (Validación + PDA)</span>
                                  <span className="font-bold text-foreground">
                                    {completedActions}/{totalActions}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{
                                      width: `${Math.round((completedActions / totalActions) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}

                          <div
                            className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ResponsibleAvatarStack
                              size="sm"
                              maxVisible={4}
                              assignedUsers={assignedList.map((person) => resolveUser(person))}
                              availableUsers={availableUsers}
                              resolveUser={resolveUser}
                              onToggleUser={
                                permissions.canManageAssignment && hasAccess
                                  ? (u) => void handleToggleRdaResponsible(rda, u.name)
                                  : undefined
                              }
                              onRemoveUser={
                                permissions.canManageAssignment && hasAccess
                                  ? (u) => void handleToggleRdaResponsible(rda, u.name)
                                  : undefined
                              }
                              onAddCustomName={
                                permissions.canManageAssignment && hasAccess
                                  ? (val) => void handleToggleRdaResponsible(rda, val)
                                  : undefined
                              }
                            />

                            {formattedDeadline && (
                              <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
                                <CalendarClock className="size-2.5" />
                                {formattedDeadline}
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
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/80 hover:bg-secondary/80 text-xs">
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.folio", "Folio")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.title")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.status")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.plant")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.responsible")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.author")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.deadline")}
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">
                  {t("rdaTable.update")}
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">
                  {t("rdaTable.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[60px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredRdas.length === 0 ? (
                <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    {t("rdaTable.noRdas")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRdas.map((rda) => {
                  const hasAccess = canUserAccessRda(rda, currentUser, permissions);
                  return (
                    <TableRow
                      key={rda.id}
                      className={`cursor-pointer transition-colors hover:bg-secondary/30 text-sm ${
                        !hasAccess ? "opacity-90" : ""
                      }`}
                      onClick={() => handleEdit(rda)}
                    >
                      <TableCell className="font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          {!hasAccess && (
                            <Lock
                              className="size-3.5 text-amber-500 shrink-0"
                              aria-label="Sin permiso directo — clic para solicitar acceso"
                            />
                          )}
                          {rda.context?.folio || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{getRdaDisplayName(rda)}</TableCell>
                      <TableCell>
                        {(() => {
                          const st = getRdaStatus(rda);
                          const badgeColor =
                            st === "Evaluado"
                              ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                              : st === "Cerrado"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
                            >
                              {st === "Evaluado"
                                ? t("evaluatedStatus", "Evaluado")
                                : st === "Cerrado"
                                  ? t("closedStatus", "Cerrado")
                                  : t("openStatus", "Abierto")}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{rda.context.planta}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ResponsibleAvatarStack
                          size="md"
                          maxVisible={5}
                          assignedUsers={getRdaResponsiblesList(rda).map((person) =>
                            resolveUser(person),
                          )}
                          availableUsers={availableUsers}
                          resolveUser={resolveUser}
                          onToggleUser={
                            permissions.canManageAssignment && hasAccess
                              ? (u) => void handleToggleRdaResponsible(rda, u.name)
                              : undefined
                          }
                          onRemoveUser={
                            permissions.canManageAssignment && hasAccess
                              ? (u) => void handleToggleRdaResponsible(rda, u.name)
                              : undefined
                          }
                          onAddCustomName={
                            permissions.canManageAssignment && hasAccess
                              ? (val) => void handleToggleRdaResponsible(rda, val)
                              : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium uppercase text-foreground">
                            {rda.portada?.autorOriginal || "-"}
                          </span>
                          {rda.portada?.autorEmail && (
                            <span className="text-[11px] text-muted-foreground">
                              {rda.portada.autorEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const dateStr = rda.portada?.fechaLimite;
                          if (!dateStr) return "-";
                          const d = new Date(dateStr);
                          if (isNaN(d.getTime())) return dateStr;
                          return d.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                        })()}
                      </TableCell>
                      <TableCell>
                        {rda.updatedAt
                          ? new Date(rda.updatedAt).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasAccess ? (
                            <Button
                              variant="link"
                              className="text-primary h-8 px-2 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(rda);
                              }}
                            >
                              {t("rdaTable.openAction")}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAccessRequestTarget(buildRdaAccessTarget(rda));
                              }}
                            >
                              <Lock className="size-3" />
                              Solicitar permiso
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(rda.id);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <AlertDialog open={!!rdaToDelete} onOpenChange={(open) => !open && setRdaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteRdaTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteRdaDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AccessRequestDialog
        open={Boolean(accessRequestTarget)}
        onOpenChange={(open) => {
          if (!open) setAccessRequestTarget(null);
        }}
        target={accessRequestTarget}
      />
    </div>
  );
}
