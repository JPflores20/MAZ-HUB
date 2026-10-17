/**
 * resumen-charts.tsx
 * Gráficas estadísticas del Resumen del PDCA renderizadas con Recharts.
 * Incluye la Tendencia del KPI (Actual vs Target), Pareto Antes vs Después (con cálculo de reducción de GAP)
 * y comparativa de Correlación de Pearson Antes (Paso 11) vs Después (Paso 25).
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart as BarChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { ParetoItem } from "@/data/pdca";
import type { DatosCorrelacionSabor } from "../../1.PLAN/paso11/flavor-correlation-utils";

interface Props {
  timeSeries: { mes: string; target: number; actual: number | null }[];
  initialParetoRoot: ParetoItem[];
  newParetoRoot: ParetoItem[];
  initialCorrelation?: DatosCorrelacionSabor | null | undefined;
  newCorrelation?: DatosCorrelacionSabor | null | undefined;
  showCorrelationComparison?: boolean | undefined;
}

export const ResumenCharts: React.FC<Props> = ({
  timeSeries,
  initialParetoRoot,
  newParetoRoot,
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalGapAntes = initialParetoRoot.reduce((acc, item) => acc + (Number(item.gap) || 0), 0);
  const totalGapDespues = newParetoRoot.reduce((acc, item) => acc + (Number(item.gap) || 0), 0);
  const tieneAmbosParetos = initialParetoRoot.length > 0 && newParetoRoot.length > 0 && totalGapAntes > 0;
  const pctReduccionGap = tieneAmbosParetos
    ? Math.round(((totalGapAntes - totalGapDespues) / totalGapAntes) * 100)
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-4 print:gap-3">
        {/* Columna 1: Tendencia del KPI (paso 26) */}
        <Card className="shadow-sm border-border print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-blue-500" />
              {t("pdcaResumen.kpiTrendStep26")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {timeSeries.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={timeSeries} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#0078D7"
                      strokeWidth={2}
                      name={t("pdcaResumen.actual")}
                      connectNulls
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      name={t("pdcaResumen.target")}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center">
                  {t("pdcaResumen.noTimeSeriesDataStep26")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna 2: Pareto Antes (paso 10) */}
        <Card className="shadow-sm border-border print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <BarChartIcon className="size-3.5 text-red-500 dark:text-red-400" />
                {t("pdcaResumen.paretoBeforeStep10")}
              </span>
              {initialParetoRoot.length > 0 && (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                  Total GAP: {Number(totalGapAntes.toFixed(2))}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {initialParetoRoot.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart
                    data={initialParetoRoot}
                    margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="gap"
                      fill="#ef4444"
                      radius={[3, 3, 0, 0]}
                      name={t("pdcaResumen.gap")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center">
                  {t("pdcaResumen.noInitialParetoStep10")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna 3: Pareto Después (paso 24) */}
        <Card className="shadow-sm border-border print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <BarChartIcon className="size-3.5 text-green-500" />
                {t("pdcaResumen.paretoAfterStep24")}
              </span>
              <span className="flex items-center gap-1.5">
                {newParetoRoot.length > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Total GAP: {Number(totalGapDespues.toFixed(2))}
                  </span>
                )}
                {pctReduccionGap !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      pctReduccionGap >= 0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                    }`}
                  >
                    {pctReduccionGap >= 0 ? `-${pctReduccionGap}% GAP` : `+${Math.abs(pctReduccionGap)}% GAP`}
                  </span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {newParetoRoot.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={newParetoRoot} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="gap"
                      fill="#22c55e"
                      radius={[3, 3, 0, 0]}
                      name={t("pdcaResumen.gap")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center px-4">
                  {t("pdcaResumen.noParetoAfter")}
                  <br />
                  {t("pdcaResumen.willBeCompletedInCheckPhaseStep24")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
