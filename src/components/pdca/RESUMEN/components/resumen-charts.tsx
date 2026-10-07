import React, { useState, useEffect } from "react";
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

interface Props {
  timeSeries: { mes: string; target: number; actual: number | null }[];
  initialParetoRoot: ParetoItem[];
  newParetoRoot: ParetoItem[];
}

export const ResumenCharts: React.FC<Props> = ({
  timeSeries,
  initialParetoRoot,
  newParetoRoot,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Columna 1: Tendencia del KPI (paso 26) */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-blue-500" />
            Tendencia del KPI (Paso 26)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-3 pb-2">
          {timeSeries.length > 0 && mounted ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={timeSeries} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#0078D7"
                    strokeWidth={2}
                    name="Real"
                    connectNulls
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    name="Target"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground text-center">
                Sin datos de serie de tiempo aún (Paso 26).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Columna 2: Pareto Antes (paso 10) */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChartIcon className="size-3.5 text-red-500" />
            Pareto Antes (Paso 10)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-3 pb-2">
          {initialParetoRoot.length > 0 && mounted ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={initialParetoRoot} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#ef4444" radius={[3, 3, 0, 0]} name="Brecha" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground text-center">
                Sin datos de Pareto inicial (Paso 10).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Columna 3: Pareto Después (paso 24) */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChartIcon className="size-3.5 text-green-500" />
            Pareto Después (Paso 24)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-3 pb-2">
          {newParetoRoot.length > 0 && mounted ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={newParetoRoot} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#22c55e" radius={[3, 3, 0, 0]} name="Brecha" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground text-center px-4">
                Sin datos aún de Pareto Después.
                <br />
                Se completará en la fase Check (Paso 24).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
