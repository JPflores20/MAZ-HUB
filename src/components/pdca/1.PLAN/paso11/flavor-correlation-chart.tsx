import React from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea,
} from "recharts";
import { calcularCorrelacionPearson, type SerieCorrelacion, type PuntoCorrelacion } from "./flavor-correlation-utils";

interface PropiedadesGraficaCorrelacion {
  tituloGrafica: string;
  alCambiarTitulo: (nuevoTitulo: string) => void;
  seriesDeDatos: SerieCorrelacion[];
  tipoGrafica: "positive" | "negative";
}

export function GraficaCorrelacion({
  tituloGrafica,
  alCambiarTitulo,
  seriesDeDatos,
  tipoGrafica,
}: PropiedadesGraficaCorrelacion) {
  // Las áreas de referencia cambian de color dependiendo de si es positivo o negativo.
  const coloresArea = {
    cuadrante1: tipoGrafica === "positive" ? "#f8d7da" : "#fff3cd", // Inferior Izquierdo
    cuadrante2: tipoGrafica === "positive" ? "#fff3cd" : "#f8d7da", // Inferior Derecho
    cuadrante3: tipoGrafica === "positive" ? "#e2e3e5" : "#d4edda", // Superior Izquierdo
    cuadrante4: tipoGrafica === "positive" ? "#d4edda" : "#e2e3e5", // Superior Derecho
  };

  return (
    <div className="space-y-2">
      <input
        value={tituloGrafica}
        onChange={(eventoCaja) => alCambiarTitulo(eventoCaja.target.value)}
        className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
      />
      <div className="h-64 border bg-white relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
            <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
            <ZAxis type="number" range={[100, 100]} />
            <RTooltip cursor={{ strokeDasharray: "3 3" }} />

            <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill={coloresArea.cuadrante1} fillOpacity={0.5} />
            <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill={coloresArea.cuadrante2} fillOpacity={0.5} />
            <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill={coloresArea.cuadrante3} fillOpacity={0.5} />
            <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill={coloresArea.cuadrante4} fillOpacity={0.5} />

            {seriesDeDatos.map((serieItem: SerieCorrelacion) => (
              <Scatter
                key={serieItem.id}
                name={serieItem.name}
                data={serieItem.points}
                fill={serieItem.fill}
                stroke={serieItem.stroke}
                strokeWidth={2}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 items-end">
        <span className="font-bold text-sm mb-1 w-full text-center sm:w-auto sm:text-left">
          Pearson Correlation
        </span>
        {seriesDeDatos.map((serieLeyenda: SerieCorrelacion) => (
          <div key={`leyenda-${serieLeyenda.id}`} className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-xs font-semibold">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: serieLeyenda.fill, borderColor: serieLeyenda.stroke, borderWidth: 1 }}
              ></div>
              {serieLeyenda.name}
            </span>
            <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1 rounded-sm">
              {calcularCorrelacionPearson((Array.isArray(serieLeyenda.points) ? serieLeyenda.points : Object.values(serieLeyenda.points || {})) as PuntoCorrelacion[])}
            </span>
          </div>
        ))}
        {seriesDeDatos.length === 0 && (
          <span className="text-muted-foreground text-xs italic mb-1">
            No hay series creadas
          </span>
        )}
      </div>
    </div>
  );
}
