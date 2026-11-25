/**
 * @fileoverview Cuadrícula de gráficas ejecutivas del Resumen PDCA (Tendencia KPI + Pareto Antes vs Después).
 */
import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { ParetoItem } from "@/domain/pdca";
import type { DatosCorrelacionSabor } from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";
import { ResumenParetoCard } from "./resumen_pareto_card";

interface PropiedadesGraficasResumen {
  time_series: { mes: string; target: number; actual: number | null }[];
  initial_pareto_root: ParetoItem[];
  new_pareto_root: ParetoItem[];
  initial_correlation?: DatosCorrelacionSabor | null | undefined;
  new_correlation?: DatosCorrelacionSabor | null | undefined;
  show_correlation_comparison?: boolean | undefined;
}

/**
 * Renderiza la fila comparativa de Tendencia KPI YTD y reducción de GAP en Paretos.
 */
export const ResumenCharts: React.FC<PropiedadesGraficasResumen> = ({
  time_series,
  initial_pareto_root,
  new_pareto_root,
}) => {
  const { t: translate } = useTranslation();
  const [montado, set_montado] = useState(false);

  useEffect(() => {
    set_montado(true);
  }, []);

  const total_gap_antes = initial_pareto_root.reduce(
    (acumulado, fila) => acumulado + (Number(fila.gap) || 0),
    0,
  );
  const total_gap_despues = new_pareto_root.reduce(
    (acumulado, fila) => acumulado + (Number(fila.gap) || 0),
    0,
  );
  const tiene_ambos_paretos =
    initial_pareto_root.length > 0 && new_pareto_root.length > 0 && total_gap_antes > 0;
  const porcentaje_reduccion_gap = tiene_ambos_paretos
    ? Math.round(((total_gap_antes - total_gap_despues) / total_gap_antes) * 100)
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-4 print:gap-3">
        <Card className="shadow-sm border-border print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-blue-500" />
              {translate("pdcaResumen.kpiTrendStep26")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {time_series.length > 0 && montado ? (
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={time_series} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis width={42} tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#0078D7"
                      strokeWidth={2}
                      name={translate("pdcaResumen.actual")}
                      connectNulls
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      name={translate("pdcaResumen.target")}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[230px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center">
                  {translate("pdcaResumen.noTimeSeriesDataStep26")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <ResumenParetoCard
          titulo={translate("pdcaResumen.paretoBeforeStep10")}
          datos_pareto={initial_pareto_root}
          total_gap={total_gap_antes}
          color_icono="text-red-500 dark:text-red-400"
          color_total="text-red-600 dark:text-red-400"
          color_barra="#ef4444"
          mounted={montado}
          etiqueta_vacia={translate("pdcaResumen.noInitialParetoStep10")}
        />

        <ResumenParetoCard
          titulo={translate("pdcaResumen.paretoAfterStep24")}
          datos_pareto={new_pareto_root}
          total_gap={total_gap_despues}
          color_icono="text-green-500"
          color_total="text-emerald-600 dark:text-emerald-400"
          color_barra="#22c55e"
          mounted={montado}
          badge_reduccion_gap={porcentaje_reduccion_gap}
          etiqueta_vacia={
            <>
              {translate("pdcaResumen.noParetoAfter")}
              <br />
              {translate("pdcaResumen.willBeCompletedInCheckPhaseStep24")}
            </>
          }
        />
      </div>
    </div>
  );
};
