/**
 * dashboard.tsx
 * Ruta del Dashboard Ejecutivo de MAZ HUB.
 * Consolida en tiempo real los indicadores de proyectos PDCA y reportes RDA (Abiertos, Cerrados, Evaluados),
 * movimientos recientes y próximas tareas por vencer.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Rda } from "@/data/rda";
import { ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { useAuth } from "@/context/auth-context";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/components/pdca/pdca_dialog_header";
import { type Pdca } from "@/data/pdca";

import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { AssignedActionsBoard } from "@/components/dashboard/assigned-actions-board";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getRdaDisplayName } from "@/components/RDA/rda-name";
import { getRdaStatus } from "@/components/RDA/rda-status";

function getRdaComputedProgress(r: Rda): number {
  const st = getRdaStatus(r);
  if (st === "Evaluado") return 100;
  if (st === "Cerrado") return 75;
  if (st === "Abierto") return 25;
  return 0;
}
function getComputedProgress(p: Pdca): number {
  if (!p.completedSteps) return p.progreso || 0;
  const completed_steps = new Set(p.completedSteps);
  const completed_count = ALL_STEP_IDS.filter((id) => completed_steps.has(id)).length;
  return TOTAL_STEPS > 0 ? Math.round((completed_count / TOTAL_STEPS) * 100) : 0;
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de mejora continua · MAZ HUB" },
      {
        name: "description",
        content: "Resumen de avance de los ciclos PDCA del programa de Grupo Modelo.",
      },
      { property: "og:title", content: "Dashboard de mejora continua · MAZ HUB" },
      {
        property: "og:description",
        content: "Indicadores de avance, fases activas y últimos movimientos de tus PDCAs.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { currentUser } = useAuth();
  const { pdcaList: userPdcas, allPdcas, refresh: refreshPdcas } = usePdcas();
  const { rdaList: visibleRdas, refresh: refreshRdas } = useRdas();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const visiblePdcas = isAdmin ? allPdcas : userPdcas;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshPdcas(), refreshRdas()]);
    setIsRefreshing(false);
  };

  const pdcasActivos = visiblePdcas.filter((p) => p.fase !== "Act").length;
  const rdasActivos = visibleRdas.filter((r) => getRdaStatus(r) === "Abierto").length;
  const activos = pdcasActivos + rdasActivos;

  const pdcasCerrados = visiblePdcas.filter((p) => p.fase === "Act").length;
  const rdasCerrados = visibleRdas.filter((r) => getRdaStatus(r) !== "Abierto").length;
  const cerrados = pdcasCerrados + rdasCerrados;

  const totalProyectos = visiblePdcas.length + visibleRdas.length;
  const avance =
    totalProyectos === 0
      ? 0
      : Math.round(
          (visiblePdcas.reduce((a, p) => a + getComputedProgress(p), 0) +
            visibleRdas.reduce((a, r) => a + getRdaComputedProgress(r), 0)) /
            totalProyectos,
        );

  const pdcaTareas = visiblePdcas.flatMap((p) => p.acciones || []);
  const rdaPdaTareas = visibleRdas.flatMap((r) => r.pda || []);
  const rdaImmTareas = visibleRdas.flatMap((r) => r.immediateActions || []);

  const pendientesPdca = pdcaTareas.filter(
    (t) => !t.done && t.status !== "Completada",
  );
  const pendientesRdaPda = rdaPdaTareas.filter(
    (t) => !t.done && t.status !== "Completada",
  );
  const pendientesRdaImm = rdaImmTareas.filter(
    (t) => t.estatus !== "Completa",
  );

  const pendientes =
    pendientesPdca.length + pendientesRdaPda.length + pendientesRdaImm.length;

  const tareas = [
    ...pendientesPdca.map((t) => ({
      id: `pdca-${t.id}`,
      description: t.what || t.accion || t.tema || "Sin descripción",
      deadline: t.when || t.fecha || "Sin fecha",
      owner: t.who || t.responsable || "Sin asignar",
      type: "PDCA",
    })),
    ...pendientesRdaPda.map((t) => ({
      id: `rda-pda-${t.id}`,
      description: t.what || t.accion || t.tema || "Sin descripción",
      deadline: t.when || t.fecha || "Sin fecha",
      owner: t.who || t.responsable || "Sin asignar",
      type: "RDA",
    })),
    ...pendientesRdaImm.map((t) => ({
      id: `rda-imm-${t.id}`,
      description: t.accion || t.causaPotencial || "Sin descripción",
      deadline: t.fechaLimite || "Sin fecha",
      owner: t.responsable || "Sin asignar",
      type: "RDA",
    })),
  ];

  const recientes = [
    ...visiblePdcas.map((p) => ({
      id: p.id,
      title: p.titulo || "Sin título",
      area: p.area,
      date: p.actualizado,
      progress: getComputedProgress(p),
      phase: p.fase,
      type: "PDCA",
    })),
    ...visibleRdas.map((r) => ({
      id: r.id,
      title: getRdaDisplayName(r, "Sin título"),
      area: r.context?.planta || "Otra",
      date: new Date(r.updatedAt || Date.now()).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      progress: getRdaComputedProgress(r),
      phase: getRdaStatus(r),
      type: "RDA",
    })),
  ]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Módulo PDCA & RDA
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buen día,{" "}
            <span className="font-semibold text-foreground">{currentUser?.name || "Usuario"}</span>.
            Este es el estatus de {currentUser?.role === "admin" ? "todos los" : "tus"} proyectos de
            mejora continua.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild variant="outline">
            <Link to="/rda">
              Mis RDAs <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              Ir a Mis PDCAs <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <ErrorBoundary>
        <KpiCards activos={activos} cerrados={cerrados} avance={avance} pendientes={pendientes} />
      </ErrorBoundary>

      <ErrorBoundary>
        <AssignedActionsBoard
          pdcas={visiblePdcas}
          rdas={visibleRdas}
          currentUserName={currentUser?.name}
          currentUserEmail={currentUser?.email}
        />
      </ErrorBoundary>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ErrorBoundary>
          <RecentMovements recientes={recientes} />
        </ErrorBoundary>
        <ErrorBoundary>
          <UpcomingTasks tareas={tareas} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
