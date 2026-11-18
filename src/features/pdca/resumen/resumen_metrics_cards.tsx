/**
 * @fileoverview Tarjetas superiores de métricas ejecutivas (Indicador/GAP, Avance SDCA y Acciones Priorizadas).
 */
import React from "react";
import { Activity, TrendingUp, ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PropiedadesTarjetasResumen {
  kpi_label: string;
  desde_val: string;
  a_val: string;
  unidad: string;
  gap_text: string;
  progreso: number;
  yes_count: number;
  total_valid: number;
  no_count: number;
  prioritized_actions_count: number;
  total_actions_count: number;
}

/**
 * Presenta las tres tarjetas resumen con meta KPI/GAP, progreso porcentual PDCA y estado de acciones.
 */
export const ResumenMetricsCards: React.FC<PropiedadesTarjetasResumen> = ({
  kpi_label,
  desde_val,
  a_val,
  unidad,
  gap_text,
  progreso,
  yes_count,
  total_valid,
  no_count,
  prioritized_actions_count,
  total_actions_count,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3">
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Activity className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              {translate("pdcaResumen.indicator", "Indicador")}
            </p>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
              {translate("pdcaResumen.gapPrefix", "GAP: ")}
              {gap_text}
            </span>
          </div>
          <p className="text-sm font-bold truncate mt-0.5">{kpi_label}</p>
          <p className="text-[11px] text-muted-foreground">
            Target:{" "}
            <strong className="text-foreground font-semibold">
              {desde_val} → {a_val} {unidad}
            </strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              {translate("pdcaResumen.pdcaAdvanceSdcaCheck")}
            </p>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {progreso}%
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>
              SDCA Check:{" "}
              <strong className="text-foreground font-semibold">
                {yes_count}/{total_valid}
              </strong>
            </span>
            <span>
              {no_count > 0 ? `${no_count} ${translate("pdcaResumen.pending")}` : translate("pdcaResumen.upToDate")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <ListChecks className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground leading-tight">
            {translate("pdcaResumen.planActions")}
          </p>
          <p className="text-xl font-bold">
            {prioritized_actions_count}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {translate("pdcaResumen.of", "de")} {total_actions_count}{" "}
              {translate("pdcaResumen.totals", "totales")}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {translate("pdcaResumen.prioritizedForExecution")}
          </p>
        </div>
      </div>
    </div>
  );
};
