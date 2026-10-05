import React from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatearValorPareto, type FilaPareto } from "./pareto-utils";

interface PropiedadesGraficaPareto {
  filasPareto: FilaPareto[];
  alHacerClicEnBarra?: (area: string) => void;
  unidadMedida?: string;
  minimoEjeY: number;
  maximoEjeY: number | "auto";
  tituloGrafica: string;
  tamanoMaximoBarra?: number;
}

export function GraficaPareto({
  filasPareto,
  alHacerClicEnBarra,
  unidadMedida = "",
  minimoEjeY,
  maximoEjeY,
  tituloGrafica,
  tamanoMaximoBarra = 40,
}: PropiedadesGraficaPareto) {
  const margenInferior = Math.max(100, 40 + filasPareto.length * 5);

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {tituloGrafica && (
        <h3 className="text-center text-sm font-semibold mb-2 text-foreground">{tituloGrafica}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart
          data={filasPareto}
          margin={{ top: 20, right: 30, bottom: margenInferior, left: -10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="area"
            tick={{ fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={margenInferior}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(valorParaFormatear) => formatearValorPareto(valorParaFormatear, unidadMedida)}
            domain={[minimoEjeY, maximoEjeY]}
            allowDataOverflow={true}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            domain={[0, 100]}
            tickFormatter={(valorPorcentaje) => Math.round(valorPorcentaje) + "%"}
          />
          <RTooltip
            contentStyle={{ borderRadius: 8, fontSize: 12, padding: "8px 12px" }}
            formatter={(valorTooltip: number, nombreSerie: string) => [
              nombreSerie === "Acumulado" ? valorTooltip.toFixed(2) + "%" : formatearValorPareto(valorTooltip, unidadMedida),
              nombreSerie,
            ]}
          />
          <Bar
            yAxisId="left"
            dataKey="gap"
            name="Valor"
            fill="#4285f4"
            radius={[4, 4, 0, 0]}
            maxBarSize={tamanoMaximoBarra}
            onClick={(payloadDatos: any) => {
              if (alHacerClicEnBarra && payloadDatos && payloadDatos.area) {
                alHacerClicEnBarra(payloadDatos.area);
              }
            }}
            className={alHacerClicEnBarra ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="porcentajeAcumulado"
            name="Acumulado"
            stroke="#ff4d4f"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "white", stroke: "#ff4d4f", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
