/**
 * flavor-correlation-chart.tsx
 * Gráfica de dispersión/correlación para evaluar la relación estadística entre variables del proceso.
 */
import React from "react";
import { useTranslation } from "react-i18next";
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
import { Palette, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  calcularCorrelacionPearson,
  calcularLineaTendencia,
  COLORES_CUADRANTES_POSITIVO_DEFECTO,
  COLORES_CUADRANTES_NEGATIVO_DEFECTO,
  UMBRAL_X_DEFECTO,
  UMBRAL_Y_DEFECTO,
  OPCIONES_COLOR_CUADRANTE,
  type ColoresCuadrantes,
  type SerieCorrelacion,
  type PuntoCorrelacion,
} from "./flavor-correlation-utils";

export function SelectorColoresCuadrantes({
  colores,
  tipoGrafica,
  alCambiarColores,
}: {
  colores: ColoresCuadrantes;
  tipoGrafica: "positive" | "negative";
  alCambiarColores: (nuevosColores: ColoresCuadrantes) => void;
}) {
  const coloresDefecto =
    tipoGrafica === "positive"
      ? COLORES_CUADRANTES_POSITIVO_DEFECTO
      : COLORES_CUADRANTES_NEGATIVO_DEFECTO;

  const actualizarCuadrante = (
    clave: "cuadrante1" | "cuadrante2" | "cuadrante3" | "cuadrante4",
    nuevoColor: string,
  ) => {
    alCambiarColores({
      ...colores,
      [clave]: nuevoColor,
    });
  };

  const actualizarUmbral = (eje: "xSplit" | "ySplit", valorTexto: string) => {
    const num = Number(valorTexto);
    if (valorTexto !== "" && Number.isFinite(num)) {
      alCambiarColores({
        ...colores,
        [eje]: num,
      });
    }
  };

  const cuadrantesOrdenVisual: {
    clave: "cuadrante1" | "cuadrante2" | "cuadrante3" | "cuadrante4";
    etiqueta: string;
  }[] = [
    { clave: "cuadrante3", etiqueta: "Sup. Izquierdo" },
    { clave: "cuadrante4", etiqueta: "Sup. Derecho" },
    { clave: "cuadrante1", etiqueta: "Inf. Izquierdo" },
    { clave: "cuadrante2", etiqueta: "Inf. Derecho" },
  ];

  const xSplitActual =
    typeof colores.xSplit === "number" && Number.isFinite(colores.xSplit)
      ? colores.xSplit
      : UMBRAL_X_DEFECTO;
  const ySplitActual =
    typeof colores.ySplit === "number" && Number.isFinite(colores.ySplit)
      ? colores.ySplit
      : UMBRAL_Y_DEFECTO;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Color de Cuadrantes
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => alCambiarColores(coloresDefecto)}
          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          title="Restaurar colores y umbrales originales"
        >
          <RotateCcw className="size-3 mr-1" />
          Restaurar
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cuadrantesOrdenVisual.map(({ clave, etiqueta }) => {
          const colorActual = colores[clave] || coloresDefecto[clave];
          return (
            <div
              key={clave}
              className="rounded-md border p-2 space-y-1.5 transition-colors"
              style={{ backgroundColor: `${colorActual}80` }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {etiqueta}
                </span>
                <input
                  type="color"
                  value={colorActual}
                  onChange={(e) => actualizarCuadrante(clave, e.target.value)}
                  className="h-5 w-6 cursor-pointer rounded border border-black/20 bg-transparent p-0"
                  title={`Elegir color personalizado para ${etiqueta}`}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {OPCIONES_COLOR_CUADRANTE.map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => actualizarCuadrante(clave, opcion.valor)}
                    title={opcion.nombre}
                    className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 ${
                      colorActual.toLowerCase() === opcion.valor.toLowerCase()
                        ? "ring-2 ring-primary ring-offset-1 border-black/40"
                        : "border-black/25"
                    }`}
                    style={{ backgroundColor: opcion.valor }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/60">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground block">
            Corte Eje X (Vertical)
          </label>
          <Input
            type="number"
            step="any"
            value={xSplitActual}
            onChange={(e) => actualizarUmbral("xSplit", e.target.value)}
            className="h-6 text-xs px-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground block">
            Corte Eje Y (Horizontal)
          </label>
          <Input
            type="number"
            step="0.1"
            value={ySplitActual}
            onChange={(e) => actualizarUmbral("ySplit", e.target.value)}
            className="h-6 text-xs px-2"
          />
        </div>
      </div>
    </div>
  );
}

interface PropiedadesGraficaCorrelacion {
  tituloGrafica: string;
  alCambiarTitulo: (nuevoTitulo: string) => void;
  seriesDeDatos: SerieCorrelacion[];
  tipoGrafica: "positive" | "negative";
  coloresCuadrantes?: ColoresCuadrantes | undefined;
  alCambiarColoresCuadrantes?: ((nuevosColores: ColoresCuadrantes) => void) | undefined;
}

export function GraficaCorrelacion({
  tituloGrafica,
  alCambiarTitulo,
  seriesDeDatos,
  tipoGrafica,
  coloresCuadrantes,
  alCambiarColoresCuadrantes,
}: PropiedadesGraficaCorrelacion) {
  const { t } = useTranslation();
  const [mostrarTendencia, setMostrarTendencia] = React.useState(true);

  const coloresDefecto =
    tipoGrafica === "positive"
      ? COLORES_CUADRANTES_POSITIVO_DEFECTO
      : COLORES_CUADRANTES_NEGATIVO_DEFECTO;

  const xSplit =
    typeof coloresCuadrantes?.xSplit === "number" && Number.isFinite(coloresCuadrantes.xSplit)
      ? coloresCuadrantes.xSplit
      : UMBRAL_X_DEFECTO;
  const ySplit =
    typeof coloresCuadrantes?.ySplit === "number" && Number.isFinite(coloresCuadrantes.ySplit)
      ? coloresCuadrantes.ySplit
      : UMBRAL_Y_DEFECTO;

  const coloresArea: ColoresCuadrantes = {
    cuadrante1: coloresCuadrantes?.cuadrante1 || coloresDefecto.cuadrante1, // Inferior Izquierdo
    cuadrante2: coloresCuadrantes?.cuadrante2 || coloresDefecto.cuadrante2, // Inferior Derecho
    cuadrante3: coloresCuadrantes?.cuadrante3 || coloresDefecto.cuadrante3, // Superior Izquierdo
    cuadrante4: coloresCuadrantes?.cuadrante4 || coloresDefecto.cuadrante4, // Superior Derecho
    xSplit,
    ySplit,
  };

  // Calcular límites dinámicos del dominio X e Y para que las áreas de los cuadrantes siempre cubran todo el plano
  const todosLosPuntos = seriesDeDatos.flatMap((s) =>
    (Array.isArray(s.points) ? s.points : Object.values(s.points || {})) as PuntoCorrelacion[],
  );

  const valoresX = todosLosPuntos.map((p) => p.x).filter(Number.isFinite);
  const valoresY = todosLosPuntos.map((p) => p.y).filter(Number.isFinite);

  const xMin = Math.min(0, xSplit - 10, ...(valoresX.length ? [Math.floor(Math.min(...valoresX))] : [0]));
  const xMax = Math.max(180, xSplit + 10, ...(valoresX.length ? [Math.ceil(Math.max(...valoresX))] : [180]));
  const yMin = Math.min(6.0, ySplit - 0.5, ...(valoresY.length ? [Math.floor(Math.min(...valoresY) * 10) / 10] : [6.0]));
  const yMax = Math.max(8.5, ySplit + 0.5, ...(valoresY.length ? [Math.ceil(Math.max(...valoresY) * 10) / 10] : [8.5]));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          value={tituloGrafica}
          onChange={(eventoCaja) => alCambiarTitulo(eventoCaja.target.value)}
          className="flex-1 text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
        />
        <Button
          type="button"
          variant={mostrarTendencia ? "secondary" : "outline"}
          size="sm"
          onClick={() => setMostrarTendencia((prev) => !prev)}
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
                colores={coloresArea}
                tipoGrafica={tipoGrafica}
                alCambiarColores={alCambiarColoresCuadrantes}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="h-64 border bg-white relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="x"
              domain={[xMin, xMax]}
              tickCount={10}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[yMin, yMax]}
              tickCount={6}
            />
            <ZAxis type="number" range={[100, 100]} />
            <RTooltip cursor={{ strokeDasharray: "3 3" }} />

            <ReferenceArea
              x1={xMin}
              x2={xSplit}
              y1={yMin}
              y2={ySplit}
              fill={coloresArea.cuadrante1}
              fillOpacity={0.5}
            />
            <ReferenceArea
              x1={xSplit}
              x2={xMax}
              y1={yMin}
              y2={ySplit}
              fill={coloresArea.cuadrante2}
              fillOpacity={0.5}
            />
            <ReferenceArea
              x1={xMin}
              x2={xSplit}
              y1={ySplit}
              y2={yMax}
              fill={coloresArea.cuadrante3}
              fillOpacity={0.5}
            />
            <ReferenceArea
              x1={xSplit}
              x2={xMax}
              y1={ySplit}
              y2={yMax}
              fill={coloresArea.cuadrante4}
              fillOpacity={0.5}
            />

            {mostrarTendencia &&
              seriesDeDatos.map((serieItem: SerieCorrelacion) => {
                const puntosNormalizados = (
                  Array.isArray(serieItem.points)
                    ? serieItem.points
                    : Object.values(serieItem.points || {})
                ) as PuntoCorrelacion[];
                const puntosTendencia = calcularLineaTendencia(puntosNormalizados);
                if (puntosTendencia.length < 2) return null;
                return (
                  <Scatter
                    key={`trend-${serieItem.id}`}
                    name={`${serieItem.name} (Tendencia)`}
                    data={puntosTendencia}
                    fill="none"
                    line={{
                      stroke: serieItem.fill === "#f1c40f" ? "#b7950b" : serieItem.fill,
                      strokeWidth: 1.5,
                      strokeDasharray: "5 4",
                    }}
                    shape={() => <g />}
                    legendType="none"
                  />
                );
              })}

            {seriesDeDatos.map((serieItem: SerieCorrelacion) => {
              const puntosNormalizados = (
                Array.isArray(serieItem.points)
                  ? serieItem.points
                  : Object.values(serieItem.points || {})
              ) as PuntoCorrelacion[];
              return (
                <Scatter
                  key={serieItem.id}
                  name={serieItem.name}
                  data={puntosNormalizados}
                  fill={serieItem.fill}
                  stroke={serieItem.stroke}
                  strokeWidth={2}
                />
              );
            })}
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
                style={{
                  backgroundColor: serieLeyenda.fill,
                  borderColor: serieLeyenda.stroke,
                  borderWidth: 1,
                }}
              ></div>
              {serieLeyenda.name}
            </span>
            <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1 rounded-sm">
              {calcularCorrelacionPearson(
                (Array.isArray(serieLeyenda.points)
                  ? serieLeyenda.points
                  : Object.values(serieLeyenda.points || {})) as PuntoCorrelacion[],
              )}
            </span>
          </div>
        ))}
        {seriesDeDatos.length === 0 && (
          <span className="text-muted-foreground text-xs italic mb-1">{t("pdcaPlan.paso11_flavor_chart_no_series")}</span>
        )}
      </div>
    </div>
  );
}
