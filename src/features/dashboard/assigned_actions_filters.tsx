/**
 * @fileoverview Header filters and urgency semaphore status pills for the unified actions board.
 */

import { AlertTriangle, CheckCircle2, Clock, Filter, ListChecks, UserCheck } from "lucide-react";

interface AssignedActionsFiltersProps {
  scope_filter: "mine" | "all";
  set_scope_filter: (next_scope: "mine" | "all") => void;
  module_filter: "ALL" | "PDCA" | "RDA";
  set_module_filter: (next_module: "ALL" | "PDCA" | "RDA") => void;
  status_filter: "pending" | "overdue" | "soon" | "completed";
  set_status_filter: (next_status: "pending" | "overdue" | "soon" | "completed") => void;
  counts: { overdue: number; soon: number; pending: number; completed: number };
}

/** Renders ownership scope tabs, PDCA/RDA module toggles, and urgency filter pills. */
export function AssignedActionsFilters({
  scope_filter,
  set_scope_filter,
  module_filter,
  set_module_filter,
  status_filter,
  set_status_filter,
  counts,
}: AssignedActionsFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Bandeja Unificada de Acciones y Compromisos (PDCA + RDA)
            </h2>
            <p className="text-xs text-muted-foreground">
              Seguimiento consolidado de planes de acción (DO), PDA, contención y validaciones con
              semáforo de vencimiento.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => set_scope_filter("all")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                scope_filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos mis proyectos
            </button>
            <button
              type="button"
              onClick={() => set_scope_filter("mine")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                scope_filter === "mine"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="size-3.5" /> Asignadas a mí
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5 text-xs">
            {(["ALL", "PDCA", "RDA"] as const).map((module_option) => (
              <button
                key={module_option}
                type="button"
                onClick={() => set_module_filter(module_option)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  module_filter === module_option
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {module_option === "ALL" ? "PDCA + RDA" : module_option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1">
          <Filter className="size-3.5" /> Estatus:
        </span>
        <button
          type="button"
          onClick={() => set_status_filter("pending")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            status_filter === "pending"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          Pendientes ({counts.pending})
        </button>
        <button
          type="button"
          onClick={() => set_status_filter("overdue")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            status_filter === "overdue"
              ? "border-red-600 bg-red-600 text-white"
              : "border-red-200 dark:border-red-900/50 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20"
          }`}
        >
          <AlertTriangle className="size-3.5" /> Vencidas ({counts.overdue})
        </button>
        <button
          type="button"
          onClick={() => set_status_filter("soon")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            status_filter === "soon"
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-amber-200 dark:border-amber-900/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          <Clock className="size-3.5" /> Próximas ≤ 7d ({counts.soon})
        </button>
        <button
          type="button"
          onClick={() => set_status_filter("completed")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            status_filter === "completed"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          <CheckCircle2 className="size-3.5" /> Completadas ({counts.completed})
        </button>
      </div>
    </>
  );
}
