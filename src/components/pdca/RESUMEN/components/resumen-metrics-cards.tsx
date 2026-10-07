import React from "react";
import { Activity, TrendingUp, ListChecks } from "lucide-react";

interface Props {
  kpiLabel: string;
  desdeVal: string;
  aVal: string;
  unidad: string;
  gapText: string;
  progreso: number;
  yesCount: number;
  totalValid: number;
  noCount: number;
  prioritizedActionsCount: number;
  totalActionsCount: number;
}

export const ResumenMetricsCards: React.FC<Props> = ({
  kpiLabel,
  desdeVal,
  aVal,
  unidad,
  gapText,
  progreso,
  yesCount,
  totalValid,
  noCount,
  prioritizedActionsCount,
  totalActionsCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Box 1: Target / GAP & Indicador */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Activity className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              Indicador
            </p>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
              GAP: {gapText}
            </span>
          </div>
          <p className="text-sm font-bold truncate mt-0.5">{kpiLabel}</p>
          <p className="text-[11px] text-muted-foreground">
            Target:{" "}
            <strong className="text-foreground font-semibold">
              {desdeVal} → {aVal} {unidad}
            </strong>
          </p>
        </div>
      </div>

      {/* Box 2: Avance PDCA & SDCA Check */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              Avance PDCA & SDCA Check
            </p>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {progreso}%
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>
              SDCA Check:{" "}
              <strong className="text-foreground font-semibold">
                {yesCount}/{totalValid}
              </strong>
            </span>
            <span>{noCount > 0 ? `${noCount} pendientes` : "Al corriente"}</span>
          </div>
        </div>
      </div>

      {/* Box 3: Acciones Plan */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <ListChecks className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground leading-tight">
            Acciones Plan
          </p>
          <p className="text-xl font-bold">
            {prioritizedActionsCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              de {totalActionsCount} totales
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">priorizadas para ejecución</p>
        </div>
      </div>
    </div>
  );
};
