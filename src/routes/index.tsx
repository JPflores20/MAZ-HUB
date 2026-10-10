import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { format, isValid, isBefore, startOfDay, parse } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
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

import { deletePdcaFromFirestore, updatePdcaDeadline } from "@/services/pdca-service";
import { type Phase, type Pdca } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { Skeleton } from "@/components/ui/skeleton";
import React, { lazy, Suspense } from "react";

const LazyPdcaDialog = lazy(() =>
  import("@/components/pdca/pdca-dialog-wrapper").then((m) => ({ default: m.PdcaDialog })),
);

// Componentes extraídos
import { DashboardFilters } from "@/components/dashboard/dashboard_filters";
import { ProjectTable } from "@/components/dashboard/project_table";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mis PDCAs · VPO Grupo Modelo" },
      {
        name: "description",
        content: "Crea, da seguimiento y cierra tus reportes PDCA de mejora continua.",
      },
      { property: "og:title", content: "Mis PDCAs · VPO Grupo Modelo" },
      {
        property: "og:description",
        content: "Gestiona tus ciclos Plan-Do-Check-Act de mejora continua en un solo lugar.",
      },
      { property: "og:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
      { property: "og:image:secure_url", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
    ],
  }),
  component: MisPdcas,
});

/**
 * Componente principal de la ruta de dashboard (Mis PDCAs)
 */
function MisPdcas() {
  const { t } = useTranslation();
  const { currentUser: current_user } = useAuth();
  const { pdcaList: pdca_list, allPdcas: all_pdcas, refresh, loading } = usePdcas();

  // Estados de la vista
  const [query, set_query] = useState("");
  const [filter, set_filter] = useState<Phase | "Todas">("Todas");
  const [selected_id, set_selected_id] = useState<string | null>(null);
  const [is_creating_new, set_is_creating_new] = useState(false);
  const [delete_id, set_delete_id] = useState<string | null>(null);
  const [is_refreshing, set_is_refreshing] = useState(false);

  // Manejador de recarga de datos
  const handle_refresh = async () => {
    set_is_refreshing(true);
    await refresh();
    set_is_refreshing(false);
  };

  const is_admin = current_user?.role === "admin";
  const user_pdcas = is_admin ? all_pdcas : pdca_list;

  // PDCA seleccionado actualmente
  const selected = useMemo(() => {
    if (!selected_id) return null;
    return user_pdcas.find((p) => p.id === selected_id) || null;
  }, [selected_id, user_pdcas]);

  // Cálculo de métricas
  const metrics = useMemo(() => {
    let activos = 0;
    let cerrados = 0;
    let bloque_frio = 0;
    let cocimientos = 0;
    let vencidos = 0;
    let a_tiempo = 0;

    const today = startOfDay(new Date());

    user_pdcas.forEach((p) => {
      const is_closed = p.fase === "Act" && p.progreso === 100;
      if (is_closed) {
        cerrados++;
      } else {
        activos++;
        if (p.fechaFinalizacion) {
          try {
            const deadline_date = parse(p.fechaFinalizacion, "dd/MM/yyyy", new Date());
            if (isValid(deadline_date)) {
              if (isBefore(deadline_date, today)) {
                vencidos++;
              } else {
                a_tiempo++;
              }
            }
          } catch (e) {
            // Ignorar errores de parseo de fecha
          }
        }
      }

      const area_str = p.area.toLowerCase();
      if (area_str.includes("frio") || area_str.includes("frío")) {
        bloque_frio++;
      } else if (area_str.includes("cocimiento")) {
        cocimientos++;
      }
    });

    return { activos, cerrados, bloque_frio, cocimientos, vencidos, a_tiempo };
  }, [user_pdcas]);

  // Filtrado de filas para la tabla
  const rows = useMemo(
    () =>
      user_pdcas.filter((p) => {
        const match_phase = filter === "Todas" || p.fase === filter;
        const q = query.toLowerCase();
        const match_query =
          !q ||
          p.titulo.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          (p.autor && p.autor.toLowerCase().includes(q)) ||
          (p.autorEmail && p.autorEmail.toLowerCase().includes(q));

        return match_phase && match_query;
      }),
    [query, filter, user_pdcas],
  );

  // Solicitud de eliminación
  const request_delete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    set_delete_id(id);
  };

  // Confirmación de eliminación
  const confirm_delete = async () => {
    if (delete_id) {
      await deletePdcaFromFirestore(delete_id);
      await refresh();
      set_delete_id(null);
    }
  };

  // Cambio de fecha límite
  const handle_deadline_change = async (
    pdca_id: string,
    date: Date | undefined,
    is_no_limit = false,
  ) => {
    if (is_no_limit) {
      await updatePdcaDeadline(pdca_id, "Sin límite");
    } else {
      const formatted = date && isValid(date) ? format(date, "dd/MM/yyyy", { locale: es }) : "";
      await updatePdcaDeadline(pdca_id, formatted || null);
    }
    await refresh();
  };

  // Eliminar fecha límite
  const handle_remove_deadline = async (e: React.MouseEvent, pdca_id: string) => {
    e.stopPropagation();
    await updatePdcaDeadline(pdca_id, null);
    await refresh();
  };

  // Apertura de modal PDCA
  const open_pdca = (p: Pdca | null) => {
    if (p) {
      set_selected_id(p.id);
      set_is_creating_new(false);
    } else {
      set_selected_id(null);
      set_is_creating_new(true);
    }
  };

  // Mostrar vista de creación/edición de PDCA
  if (selected || is_creating_new) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
          <ErrorBoundary>
            <LazyPdcaDialog
              pdca={selected}
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  set_selected_id(null);
                  set_is_creating_new(false);
                }
              }}
            />
          </ErrorBoundary>
        </Suspense>
      </div>
    );
  }

  // Vista principal del Dashboard
  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("pdcaModule")}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">{t("myPdcas")}</h1>
          <div className="mt-1">
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user_pdcas.length} {t("registeredCycles")}{" "}
                {current_user?.role === "admin"
                  ? t("globalView")
                  : `${t("assignedCycles")} ${current_user?.name || "ti"}.`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handle_refresh}
            disabled={is_refreshing}
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${is_refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="lg"
            className="bg-primary shadow-sm hover:bg-brand-dark"
            onClick={() => open_pdca(null)}
          >
            <Plus /> {t("createNewPdca")}
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-6 mt-6">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Componente de Filtros Superiores */}
          <ErrorBoundary>
            <DashboardFilters
              user_pdcas={user_pdcas}
              filter={filter}
              setFilter={set_filter}
              metrics={metrics}
            />
          </ErrorBoundary>

          {/* Componente de Tabla de Proyectos */}
          <ErrorBoundary>
            <ProjectTable
              rows={rows}
              query={query}
              setQuery={set_query}
              filter={filter}
              setFilter={set_filter}
              current_user={current_user}
              is_admin={is_admin}
              set_selected_id={set_selected_id}
              request_delete={request_delete}
              handle_deadline_change={handle_deadline_change}
              handle_remove_deadline={handle_remove_deadline}
            />
          </ErrorBoundary>
        </>
      )}

      {/* Diálogo de Eliminación */}
      <AlertDialog open={!!delete_id} onOpenChange={(open) => !open && set_delete_id(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar PDCA?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este PDCA y todos sus
              datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirm_delete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
