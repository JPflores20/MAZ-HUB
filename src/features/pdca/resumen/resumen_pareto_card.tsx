/**
 * @fileoverview Tarjeta compartida de gráfica de barras Pareto (Antes o Después) para el Resumen PDCA.
 */
import React from "react";
import { BarChart as BarChartIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { ParetoItem } from "@/domain/pdca";

interface PropiedadesTarjetaParetoResumen {
  titulo: string;
  datos_pareto: ParetoItem[];
  total_gap: number;
  color_icono: string;
  color_total: string;
  color_barra: string;
  mounted: boolean;
  etiqueta_vacia: React.ReactNode;
  badge_reduccion_gap?: number | null;
}

/**
 * Renderiza una tarjeta comparativa Recharts para el Pareto inicial (Paso 10) o posterior (Paso 25).
 */
export const ResumenParetoCard: React.FC<PropiedadesTarjetaParetoResumen> = ({
  titulo,
  datos_pareto,
  total_gap,
  color_icono,
  color_total,
  color_barra,
  mounted,
  etiqueta_vacia,
  badge_reduccion_gap = null,
}) => {
  const { t: translate } = useTranslation();

  return (
    <Card className="shadow-sm border-border print:shadow-none print:border print:break-inside-avoid">
      <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <BarChartIcon className={`size-3.5 ${color_icono}`} />
            {titulo}
          </span>
          <span className="flex items-center gap-1.5">
            {datos_pareto.length > 0 && (
              <span className={`text-[10px] font-semibold ${color_total}`}>
                Total GAP: {Number(total_gap.toFixed(2))}
              </span>
            )}
            {badge_reduccion_gap !== null && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  badge_reduccion_gap >= 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                }`}
              >
                {badge_reduccion_gap >= 0
                  ? `-${badge_reduccion_gap}% GAP`
                  : `+${Math.abs(badge_reduccion_gap)}% GAP`}
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-2">
        {datos_pareto.length > 0 && mounted ? (
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={datos_pareto} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="area"
                  interval={datos_pareto.length > 8 ? "preserveStartEnd" : 0}
                  angle={datos_pareto.length > 4 ? -35 : 0}
                  textAnchor={datos_pareto.length > 4 ? "end" : "middle"}
                  height={datos_pareto.length > 4 ? 62 : 28}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(etiqueta: string) =>
                    etiqueta.length > 14 ? `${etiqueta.slice(0, 13)}…` : etiqueta
                  }
                />
                <YAxis width={36} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="gap" fill={color_barra} radius={[3, 3, 0, 0]} name={translate("pdcaResumen.gap")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[230px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
            <p className="text-xs text-muted-foreground text-center px-4">{etiqueta_vacia}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
