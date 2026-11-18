/**
 * @fileoverview Gráfica de dispersión con cuadrantes configurables, líneas de tendencia e índice de Pearson.
 */
import { useState } from "react";
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
import { Palette, TrendingUp } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  calcular_linea_tendencia,
  COLORES_CUADRANTES_POSITIVO_DEFECTO,
  COLORES_CUADRANTES_NEGATIVO_DEFECTO,
  UMBRAL_X_DEFECTO,
  UMBRAL_Y_DEFECTO,
  type ColoresCuadrantes,
  type SerieCorrelacion,
  type PuntoCorrelacion,
} from "./flavor_correlation_utils";
import { SelectorColoresCuadrantes } from "./flavor_correlation_quadrants";
import { FlavorCorrelationLegend } from "./flavor_correlation_legend";

interface PropiedadesGraficaCorrelacion {
  tituloGrafica: string;
  alCambiarTitulo: (nuevo_titulo: string) => void;
  seriesDeDatos: SerieCorrelacion[];
  tipoGrafica: "positive" | "negative";
  coloresCuadrantes?: ColoresCuadrantes | undefined;
  alCambiarColoresCuadrantes?: ((nuevos_colores: ColoresCuadrantes) => void) | undefined;
}

const normalizar_puntos = (serie: SerieCorrelacion): PuntoCorrelacion[] =>
  (Array.isArray(serie.points)
    ? serie.points
    : Object.values(serie.points || {})) as PuntoCorrelacion[];

/**
 * Despliega un diagrama de dispersión con fondos de cuadrantes, recta de regresión lineal y coeficiente r.
 */
export function GraficaCorrelacion({
  tituloGrafica,
  alCambiarTitulo,
  seriesDeDatos,
  tipoGrafica,
  coloresCuadrantes,
  alCambiarColoresCuadrantes,
}: PropiedadesGraficaCorrelacion) {
  const [mostrar_tendencia, set_mostrar_tendencia] = useState(true);

  const colores_defecto =
    tipoGrafica === "positive"
      ? COLORES_CUADRANTES_POSITIVO_DEFECTO
      : COLORES_CUADRANTES_NEGATIVO_DEFECTO;

  const corte_x =
    typeof coloresCuadrantes?.xSplit === "number" && Number.isFinite(coloresCuadrantes.xSplit)
      ? coloresCuadrantes.xSplit
      : UMBRAL_X_DEFECTO;
  const corte_y =
    typeof coloresCuadrantes?.ySplit === "number" && Number.isFinite(coloresCuadrantes.ySplit)
      ? coloresCuadrantes.ySplit
      : UMBRAL_Y_DEFECTO;

  const colores_area: ColoresCuadrantes = {
    cuadrante1: coloresCuadrantes?.cuadrante1 || colores_defecto.cuadrante1,
    cuadrante2: coloresCuadrantes?.cuadrante2 || colores_defecto.cuadrante2,
    cuadrante3: coloresCuadrantes?.cuadrante3 || colores_defecto.cuadrante3,
    cuadrante4: coloresCuadrantes?.cuadrante4 || colores_defecto.cuadrante4,
    xSplit: corte_x,
    ySplit: corte_y,
  };

  const todos_puntos = seriesDeDatos.flatMap(normalizar_puntos);
  const valores_x = todos_puntos.map((punto) => punto.x).filter(Number.isFinite);
  const valores_y = todos_puntos.map((punto) => punto.y).filter(Number.isFinite);

  const minimo_x = Math.min(0, corte_x - 10, ...(valores_x.length ? [Math.floor(Math.min(...valores_x))] : [0]));
  const maximo_x = Math.max(180, corte_x + 10, ...(valores_x.length ? [Math.ceil(Math.max(...valores_x))] : [180]));
  const minimo_y = Math.min(6.0, corte_y - 0.5, ...(valores_y.length ? [Math.floor(Math.min(...valores_y) * 10) / 10] : [6.0]));
  const maximo_y = Math.max(8.5, corte_y + 0.5, ...(valores_y.length ? [Math.ceil(Math.max(...valores_y) * 10) / 10] : [8.5]));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          value={tituloGrafica}
          onChange={(evento) => alCambiarTitulo(evento.target.value)}
          className="flex-1 text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
        />
        <Button
          type="button"
          variant={mostrar_tendencia ? "secondary" : "outline"}
          size="sm"
          onClick={() => set_mostrar_tendencia((anterior) => !anterior)}
          className="h-7 px-2 text-xs shrink-0 gap-1"
          title="Mostrar u ocultar líneas de tendencia lineal"
        >
          <TrendingUp className="size-3.5" />
          <span className="hidden sm:inline">Tendencia</span>
        </Button>
        {alCambiarColoresCuadrantes && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs shrink-0 gap-1"
                title="Cambiar el color y umbrales de los cuadrantes"
              >
                <Palette className="size-3.5" />
                <span className="hidden sm:inline">Cuadrantes</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <SelectorColoresCuadrantes
                colores={colores_area}
                tipo_grafica={tipoGrafica}
                al_cambiar_colores={alCambiarColoresCuadrantes}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="h-64 border bg-white relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" domain={[minimo_x, maximo_x]} tickCount={10} />
            <YAxis type="number" dataKey="y" domain={[minimo_y, maximo_y]} tickCount={6} />
            <ZAxis type="number" range={[100, 100]} />
            <RTooltip cursor={{ strokeDasharray: "3 3" }} />
            <ReferenceArea x1={minimo_x} x2={corte_x} y1={minimo_y} y2={corte_y} fill={colores_area.cuadrante1} fillOpacity={0.5} />
            <ReferenceArea x1={corte_x} x2={maximo_x} y1={minimo_y} y2={corte_y} fill={colores_area.cuadrante2} fillOpacity={0.5} />
            <ReferenceArea x1={minimo_x} x2={corte_x} y1={corte_y} y2={maximo_y} fill={colores_area.cuadrante3} fillOpacity={0.5} />
            <ReferenceArea x1={corte_x} x2={maximo_x} y1={corte_y} y2={maximo_y} fill={colores_area.cuadrante4} fillOpacity={0.5} />

            {mostrar_tendencia &&
              seriesDeDatos.map((serie_item) => {
                const puntos_tendencia = calcular_linea_tendencia(normalizar_puntos(serie_item));
                if (puntos_tendencia.length < 2) return null;
                return (
                  <Scatter
                    key={`trend-${serie_item.id}`}
                    name={`${serie_item.name} (Tendencia)`}
                    data={puntos_tendencia}
                    fill="none"
                    line={{
                      stroke: serie_item.fill === "#f1c40f" ? "#b7950b" : serie_item.fill,
                      strokeWidth: 1.5,
                      strokeDasharray: "5 4",
                    }}
                    shape={() => <g />}
                    legendType="none"
                  />
                );
              })}

            {seriesDeDatos.map((serie_item) => (
              <Scatter
                key={serie_item.id}
                name={serie_item.name}
                data={normalizar_puntos(serie_item)}
                fill={serie_item.fill}
                stroke={serie_item.stroke}
                strokeWidth={2}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <FlavorCorrelationLegend series_de_datos={seriesDeDatos} />
    </div>
  );
}
