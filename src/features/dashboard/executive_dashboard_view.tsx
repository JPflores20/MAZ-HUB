/**
 * @fileoverview Executive dashboard page consolidating PDCA & RDA metrics, unified actions, and recent updates.
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/auth/auth_context";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import { Button } from "@/shared/ui/button";
import { ErrorBoundary } from "@/shared/ui/error_boundary";
import { AssignedActionsBoard } from "./assigned_actions_board";
import { build_executive_dashboard_summary } from "./executive_dashboard_helpers";
import { KpiCards } from "./kpi_cards";
import { RecentMovements } from "./recent_movements";
import { UpcomingTasks } from "./upcoming_tasks";

/** Renders the `/dashboard` executive view with real-time PDCA and RDA summaries. */
export function ExecutiveDashboardView() {
  const { currentUser } = useAuth();
  const { pdcaList: user_pdcas, allPdcas: all_pdcas, refresh: refresh_pdcas } = usePdcas();
  const { rdaList: visible_rdas, refresh: refresh_rdas } = useRdas();
  const [is_refreshing, set_is_refreshing] = useState(false);

  const visible_pdcas = currentUser?.role === "admin" ? all_pdcas : user_pdcas;

  const handle_refresh = async () => {
    set_is_refreshing(true);
    await Promise.all([refresh_pdcas(), refresh_rdas()]);
    set_is_refreshing(false);
  };

  const {
    active_count,
    closed_count,
    average_progress,
    pending_count,
    upcoming_tasks,
    recent_movements,
  } = build_executive_dashboard_summary(visible_pdcas, visible_rdas);

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
            onClick={() => void handle_refresh()}
            disabled={is_refreshing}
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${is_refreshing ? "animate-spin" : ""}`} />
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
        <KpiCards
          activos={active_count}
          cerrados={closed_count}
          avance={average_progress}
          pendientes={pending_count}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <AssignedActionsBoard
          pdcas={visible_pdcas}
          rdas={visible_rdas}
          currentUserName={currentUser?.name}
          currentUserEmail={currentUser?.email}
        />
      </ErrorBoundary>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ErrorBoundary>
          <RecentMovements recientes={recent_movements} />
        </ErrorBoundary>
        <ErrorBoundary>
          <UpcomingTasks tareas={upcoming_tasks} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
