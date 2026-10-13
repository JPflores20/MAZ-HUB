/**
 * rda.tsx
 * Ruta principal del módulo de Reportes de Anomalía (RDA).
 * Muestra las 3 tarjetas de estado (Abierto, Cerrado, Evaluado), filtros por año/mes/planta/proceso/estatus,
 * exportación a Excel (.xlsx), listado tabular y apertura del editor RdaDialog.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, RefreshCw, Filter, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
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
import { subscribeToRdas, createRda, updateRda, deleteRda } from "@/services/rda-service";
import { Rda, defaultRda } from "@/data/rda";
import { AREAS } from "@/data/pdca-defaults";
import { getRdaDisplayName } from "@/components/RDA/rda-name";
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

export const Route = createFileRoute("/rda")({
  component: RdaPage,
});

function RdaPage() {
  const { t } = useTranslation();
  const [rdas, setRdas] = useState<Rda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRda, setSelectedRda] = useState<Rda | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rdaToDelete, setRdaToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const unsubscribe = subscribeToRdas((data) => {
      setRdas(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateNew = () => {
    const newRda: Rda = {
      ...defaultRda,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedRda(newRda);
    setIsDialogOpen(true);
  };

  const handleEdit = (rda: Rda) => {
    setSelectedRda(rda);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRdaToDelete(id);
  };

  const confirmDelete = async () => {
    if (rdaToDelete) {
      await deleteRda(rdaToDelete);
      setRdaToDelete(null);
    }
  };

  // Persiste y devuelve la versión guardada. Los errores se propagan al diálogo,
  // que es quien los muestra al usuario y decide si cerrar.
  const handleSave = (rda: Rda) => updateRda(rda);


  const availableAreas = React.useMemo(() => {
    const areaMap = new Map<string, string>();
    rdas.forEach((r) => {
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
  }, [rdas]);

  const filteredRdas = rdas.filter((rda) => {
    const term = searchTerm.toLowerCase();
    const title = getRdaDisplayName(rda).toLowerCase();
    const folio = (rda.context?.folio || "").toLowerCase();
    const resp = (rda.context?.responsable || "").toLowerCase();
    const matchesSearch = title.includes(term) || folio.includes(term) || resp.includes(term);

    const rdaArea = (rda.context?.area || rda.portada?.area || "").trim().toLowerCase();
    const matchesArea = areaFilter === "all" || rdaArea === areaFilter.trim().toLowerCase();

    const rdaStatus = getRdaStatus(rda);
    const matchesStatus = statusFilter === "all" || rdaStatus === statusFilter;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const exportExcel = () => {
    const data = filteredRdas.map(rda => ({
      Folio: rda.context?.folio || "-",
      Titulo: getRdaDisplayName(rda),
      Estatus: getRdaStatus(rda),
      Planta: rda.context?.planta || "-",
      Area: rda.context?.area || "-",
      Responsable: rda.context?.responsable || "-",
      Autor: rda.portada?.autorOriginal || "-",
      FechaLimite: rda.portada?.fechaLimite ? new Date(rda.portada.fechaLimite).toLocaleDateString("es-ES") : "-",
      Actualizado: rda.updatedAt ? new Date(rda.updatedAt).toLocaleDateString("es-ES") : "-",
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
            onSave={handleSave}
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
                {rdas.length} {t("reportsRegistered")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
            className="hidden sm:flex bg-card mr-2"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            variant="default"
            onClick={handleCreateNew}
            className="bg-primary shadow-sm hover:bg-brand-dark text-primary-foreground"
          >
            <Plus className="mr-1.5 size-4" /> {t("createNewRda")}
          </Button>
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
              count: rdas.filter((r) => getRdaStatus(r) === "Abierto").length,
              color: "border-t-blue-600",
              bgDot: "bg-blue-600",
              description: "RDAs en estatus abierto",
            },
            {
              id: "Cerrado",
              label: t("closedStatus", "Cerrado"),
              count: rdas.filter((r) => getRdaStatus(r) === "Cerrado").length,
              color: "border-t-emerald-600",
              bgDot: "bg-emerald-600",
              description: "Fases 1, 2 y 3 completas",
            },
            {
              id: "Evaluado",
              label: t("evaluatedStatus", "Evaluado"),
              count: rdas.filter((r) => getRdaStatus(r) === "Evaluado").length,
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
                <p className="mt-3 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm flex items-center gap-2">
          <div className="relative w-full">
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
            {availableAreas.map(a => (
              <option key={a} value={a}>{a}</option>
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
        <Button 
          variant="default" 
          onClick={exportExcel} 
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white border-none shadow-md transition-all hover:scale-105"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
        </Button>
      </div>

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
              filteredRdas.map((rda) => (
                <TableRow
                  key={rda.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/30 text-sm"
                  onClick={() => handleEdit(rda)}
                >
                  <TableCell className="font-semibold">{rda.context?.folio || "-"}</TableCell>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
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
                  <TableCell>{rda.context.responsable || "-"}</TableCell>
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
                      // Assuming dateStr might be an ISO string if they used DatePicker, or dd/mm/yyyy.
                      // RDA usually uses DatePicker now which outputs ISO strings
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
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
    </div>
  );
}
