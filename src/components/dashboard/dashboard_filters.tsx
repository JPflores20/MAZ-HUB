import { PhaseBadge } from "@/components/pdca/pdca-badge";
import { type Phase, type Pdca, phases } from "@/data/pdca";
import { Target, CheckCircle2, Building, Snowflake, Flame } from "lucide-react";

/**
 * Props para los filtros superiores del dashboard
 */
interface DashboardFiltersProps {
  user_pdcas: Pdca[];
  filter: Phase | "Todas";
  setFilter: (phase: Phase | "Todas") => void;
  metrics: {
    activos: number;
    cerrados: number;
    bloque_frio: number;
    cocimientos: number;
    vencidos: number;
    a_tiempo: number;
  };
}

/**
 * Componente que muestra las tarjetas de fases y métricas principales
 */
export function DashboardFilters({
  user_pdcas,
  filter,
  setFilter,
  metrics,
}: DashboardFiltersProps) {
  // Extraemos las fases principales
  const main_phases = phases.filter((p) => p !== "Resumen" && p !== "Evaluacion");

  return (
    <>
      {/* Tarjetas de Fases */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {main_phases.map((phase) => {
          const border_color: Record<string, string> = {
            Plan: "border-t-phase-plan",
            Do: "border-t-phase-do",
            Check: "border-t-phase-check",
            Act: "border-t-phase-act",
          };
          const color = border_color[phase] || "border-t-gray-500";
          const phase_count = user_pdcas.filter((p) => p.fase === phase).length;

          return (
            <button
              key={phase}
              type="button"
              onClick={() => setFilter(phase)}
              className={`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 ${color} ${
                filter === phase ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <PhaseBadge phase={phase} />
                <span className="text-2xl font-bold">{phase_count}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Proyectos en fase {phase}</p>
            </button>
          );
        })}
      </div>

      {/* Tarjetas de Métricas */}
      {user_pdcas.length > 0 && (
        <div className="mt-8 mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Target className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PDCAs Activos</p>
              <h3 className="text-2xl font-bold">{metrics.activos}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PDCAs Cerrados</p>
              <h3 className="text-2xl font-bold">{metrics.cerrados}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Building className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Por Área (Activos)</p>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <Snowflake className="size-3" /> {metrics.bloque_frio}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Flame className="size-3" /> {metrics.cocimientos}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
