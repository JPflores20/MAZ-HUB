import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { subscribeToRdas } from "@/services/rda-service";
import type { Rda } from "@/data/rda";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca/pdca-badge";
import { usePdcas } from "@/context/pdca-context";
import { useAuth } from "@/context/auth-context";
import { ALL_STEP_IDS, TOTAL_STEPS } from "@/components/pdca/pdca_dialog_header";
import { type Pdca } from "@/data/pdca";

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

  const kpis = [
    {
      label: "Proyectos activos",
      value: activos,
      icon: ClipboardList,
      hint: "PDCAs y RDAs en curso",
    },
    {
      label: "Proyectos en cierre",
      value: cerrados,
      icon: CheckCircle2,
      hint: "Listos para estandarizar / cerrar",
    },
    { label: "Avance promedio", value: `${avance}%`, icon: Target, hint: "Todos los ciclos" },
    {
      label: "Tareas pendientes",
      value: pendientes,
      icon: Clock,
      hint: "Planes de acción abiertos",
    },
  ];

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </span>
              <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-4xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Movimientos recientes
          </h2>
          <ul className="mt-4 space-y-3">
            {recientes.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {p.type}
                    </span>
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.area} • actualizado {p.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:block">
                    <span
                      className="block h-full rounded-full bg-brand-yellow"
                      style={{ width: `${p.progress}%` }}
                    />
                  </span>
                  {p.type === "PDCA" ? (
                    <PhaseBadge phase={p.phase as any} />
                  ) : (
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-current text-blue-600 bg-blue-500/10">
                      {p.phase}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {recientes.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay registros para mostrar.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Próximos compromisos
          </h2>
          <ul className="mt-4 space-y-3">
            {tareas.slice(0, 6).map((t) => (
              <li key={t.id} className="border-l-2 border-brand-yellow pl-3 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    {t.type}
                  </span>
                  <p className="text-sm font-medium truncate">{t.description}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.owner} • {t.deadline}
                </p>
              </li>
            ))}
            {tareas.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay compromisos pendientes.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
