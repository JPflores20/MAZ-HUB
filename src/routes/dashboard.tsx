import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { subscribeToRdas } from "@/services/rda-service";
import type { Rda } from "@/data/rda";
import { ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePdcas } from "@/context/pdca-context";
import { useAuth } from "@/context/auth-context";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/components/pdca/pdca_dialog_header";
import { type Pdca } from "@/data/pdca";

import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function getRdaComputedProgress(r: Rda): number {
  if (r.status === "Cerrado") return 100;
  if (r.status === "Abierto") return 10;
  if (r.status === "En Progreso") return 50;
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
  const { pdcaList: userPdcas, refresh } = usePdcas();
  const [rdasList, setRdasList] = useState<Rda[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRdas((data) => {
      setRdasList(data);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const pdcasActivos = userPdcas.filter((p) => p.fase !== "Act").length;
  const rdasActivos = rdasList.filter((r) => r.status !== "Cerrado").length;
  const activos = pdcasActivos + rdasActivos;

  const pdcasCerrados = userPdcas.filter((p) => p.fase === "Act").length;
  const rdasCerrados = rdasList.filter((r) => r.status === "Cerrado").length;
  const cerrados = pdcasCerrados + rdasCerrados;

  const totalProyectos = userPdcas.length + rdasList.length;
  const avance =
    totalProyectos === 0
      ? 0
      : Math.round(
          (userPdcas.reduce((a, p) => a + getComputedProgress(p), 0) +
            rdasList.reduce((a, r) => a + getRdaComputedProgress(r), 0)) /
            totalProyectos,
        );

  const pdcaTareas = userPdcas.flatMap((p) => p.acciones || []);
  const rdaTareasVal = rdasList.flatMap((r) => (r as any).validacion || []);
  const rdaTareasPrev = rdasList.flatMap((r) => (r as any).prevencion || []);

  const pendientesPdca = pdcaTareas.filter((t) => !t.done);
  const pendientesRda = [...rdaTareasVal, ...rdaTareasPrev].filter(
    (t) => t.estatus !== "Completa" && t.estatus !== "Completada",
  );

  const pendientes = pendientesPdca.length + pendientesRda.length;

  const tareas = [
    ...pendientesPdca.map((t) => ({
      id: t.id,
      description: t.what || t.accion || t.tema || "Sin descripción",
      deadline: t.when || (t as any).fechaLimite || "Sin fecha",
      owner: t.who || t.responsable || "Sin asignar",
      type: "PDCA",
    })),
    ...pendientesRda.map((t) => ({
      id: t.id,
      description: t.accion || t.asunto || "Sin descripción",
      deadline: t.fechaLimite || "Sin fecha",
      owner: t.responsable || "Sin asignar",
      type: "RDA",
    })),
  ];

  const recientes = [
    ...userPdcas.map((p) => ({
      id: p.id,
      title: p.titulo || "Sin título",
      area: p.area,
      date: p.actualizado,
      progress: getComputedProgress(p),
      phase: p.fase,
      type: "PDCA",
    })),
    ...rdasList.map((r) => ({
      id: r.id,
      title: r.title || "Sin título",
      area: r.context?.planta || "Otra",
      date: new Date(r.updatedAt || Date.now()).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      progress: getRdaComputedProgress(r),
      phase: r.status,
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
            Módulo PDCA
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
            <Link to="/">
              Ir a Mis PDCAs <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <ErrorBoundary>
        <KpiCards activos={activos} cerrados={cerrados} avance={avance} pendientes={pendientes} />
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
