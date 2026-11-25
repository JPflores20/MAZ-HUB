/**
 * @fileoverview Gráfica combinada de barras descendentes y curva acumulada 80/20 con soporte para drill-down.
 */
import { Maximize2 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { ParetoChartProps } from "./pareto_types";

/**
 * Visualiza el diagrama de Pareto interactivo con título editable, límites de eje Y y expansión modal.
 */
export function ParetoChart({
  chart_data,
  chart_title,
  on_chart_title_change,
  y_axis_min,
  y_axis_max,
  on_y_axis_min_change,
  on_y_axis_max_change,
  on_bar_click,
  format_value,
  is_fullscreen = false,
  on_expand,
}: ParetoChartProps) {
  const dominio_y: [number, number | "auto"] = [y_axis_min, y_axis_max];
  const longitud_max_etiqueta = chart_data.reduce(
    (max_actual, fila) => Math.max(max_actual, String(fila.area || "").trim().length),
    0,
  );
  // XAxis height reserva el área inferior para etiquetas rotadas -45° sin inflar margin.bottom
  const altura_eje_x = Math.min(150, Math.max(70, Math.round(longitud_max_etiqueta * 4.6 + 24)));
  const altura_inline = 260 + altura_eje_x + 25;
  const margen_izquierdo = longitud_max_etiqueta > 16 ? 20 : 4;

  return (
    <div className={is_fullscreen ? "flex flex-col gap-2 h-full min-h-0" : "flex flex-col gap-2"}>
      <Input
        value={chart_title}
        onChange={(evento) => on_chart_title_change(evento.target.value)}
        placeholder="Nombre del gráfico..."
        className="h-7 text-xs font-semibold border-dashed text-center"
      />

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Label className="text-[10px] uppercase tracking-wide">Y MÍN:</Label>
          <Input
            type="number"
            value={y_axis_min}
            onChange={(evento) => on_y_axis_min_change(Number(evento.target.value))}
            className="h-6 w-20 text-xs px-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-[10px] uppercase tracking-wide">Y MÁX:</Label>
          <Input
            type="number"
            value={y_axis_max === "auto" ? "" : y_axis_max}
            placeholder="auto"
            onChange={(evento) =>
              on_y_axis_max_change(
                evento.target.value === "" ? "auto" : Number(evento.target.value),
              )
            }
            className="h-6 w-20 text-xs px-1"
          />
        </div>
        {on_expand && !is_fullscreen && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={on_expand}
          >
            <Maximize2 className="mr-1 size-3" /> Expandir
          </Button>
        )}
      </div>

      <div
        className={
          is_fullscreen
            ? "border rounded-md p-2 bg-card flex-1 min-h-0 flex flex-col"
            : "border rounded-md p-2 bg-card"
        }
      >
        {chart_title && (
          <h3 className="text-center text-sm font-semibold mb-2 text-foreground shrink-0">
            {chart_title}
          </h3>
        )}
        <div
          className={is_fullscreen ? "flex-1 min-h-0 w-full" : "w-full"}
          style={is_fullscreen ? undefined : { height: altura_inline }}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart
              data={chart_data}
              margin={{ top: 20, right: 12, bottom: 10, left: margen_izquierdo }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="area"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={altura_eje_x}
                tick={{ fontSize: 10 }}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis
                yAxisId="left"
                width={62}
                domain={dominio_y}
                allowDataOverflow={true}
                tick={{ fontSize: 11 }}
                stroke="var(--color-muted-foreground)"
                tickFormatter={(valor_eje) => format_value(valor_eje)}
              />
              <YAxis
                yAxisId="right"
                width={44}
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="var(--color-muted-foreground)"
                domain={[0, 100]}
                tickFormatter={(valor_pct) => `${Math.round(valor_pct)}%`}
              />
            <RTooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 12,
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
                padding: "8px 12px",
              }}
              formatter={(valor_serie: number, nombre_serie: string) => [
                nombre_serie === "Acumulado"
                  ? `${valor_serie.toFixed(2)}%`
                  : format_value(valor_serie),
                nombre_serie,
              ]}
            />
            <Bar
              yAxisId="left"
              dataKey="gap"
              name="Valor"
              fill="#4285f4"
              radius={[4, 4, 0, 0]}
              maxBarSize={is_fullscreen ? 60 : 40}
              onClick={(datos_barra) => {
                if (on_bar_click && datos_barra?.area) on_bar_click(datos_barra.area);
              }}
              className={on_bar_click ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cum_pct"
              name="Acumulado"
              stroke="#ff4d4f"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--color-card)",
                stroke: "#ff4d4f",
                strokeWidth: 2,
              }}
            />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
