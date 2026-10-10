import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, RefreshCw, Filter } from "lucide-react";
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

  const handleSave = async (rda: Rda) => {
    try {
      // If it's a new RDA (we don't know if it exists in DB yet, but updateRda uses setDoc with merge)
      // Actually we can just call updateRda which creates or updates it.
      await updateRda(rda);
      setIsDialogOpen(false);
      setSelectedRda(null);
    } catch (error) {
      console.error("Error saving RDA", error);
    }
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
          {["Abierto", "En Progreso", "Cerrado"].map((status) => {
            const color =
              status === "Abierto"
                ? "border-t-phase-plan"
                : status === "En Progreso"
                  ? "border-t-phase-do"
                  : "border-t-phase-check";
            const bgDot =
              status === "Abierto"
                ? "bg-phase-plan"
                : status === "En Progreso"
                  ? "bg-phase-do"
                  : "bg-phase-check";
            const label =
              status === "Abierto"
                ? t("openStatus")
                : status === "En Progreso"
                  ? t("inProgressStatus")
                  : t("closedStatus");
            return (
              <button
                key={status}
                className={`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 ${color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${bgDot}`}></span>
                    <span className="text-sm font-semibold uppercase">{label}</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {rdas.filter((r) => r.status === status).length}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("rdasInStatus")} {label.toLowerCase()}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("searchPlaceholder")} className="pl-9 pr-4 bg-card" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/80 hover:bg-secondary/80 text-xs">
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
            ) : rdas.length === 0 ? (
              <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  {t("rdaTable.noRdas")}
                </TableCell>
              </TableRow>
            ) : (
              rdas.map((rda) => (
                <TableRow
                  key={rda.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/30 text-sm"
                  onClick={() => handleEdit(rda)}
                >
                  <TableCell className="font-medium">{rda.title}</TableCell>
                  <TableCell>
                    {rda.status === "Abierto"
                      ? t("openStatus")
                      : rda.status === "En Progreso"
                        ? t("inProgressStatus")
                        : t("closedStatus")}
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
