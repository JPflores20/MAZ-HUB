/**
 * @fileoverview Gráfica Recharts combinada (Barras YTD + Líneas Meta/Actual) para series temporales de KPI.
 */
import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";

interface PropiedadesGraficaSeries {
  datos_grafica: Record<string, unknown>[];
  formatear_valor: (valor: number | null | undefined) => string;
  titulo_grafica: string;
  al_cambiar_titulo_grafica?: ((nuevo_titulo: string) => void) | undefined;
  minimo_eje_y: number;
  maximo_eje_y: string | number;
}

interface PropiedadesEtiquetaBarra {
  x?: number;
  y?: number;
  width?: number;
  value?: number | null;
}

/**
 * Renderiza la etiqueta numérica rotada encima de cada barra YTD.
 */
function EtiquetaBarraPersonalizada({
  x: coord_x = 0,
  y: coord_y = 0,
  width: ancho_barra = 0,
  value: valor_barra,
  formatear_valor,
}: PropiedadesEtiquetaBarra & { formatear_valor: (valor: number | null | undefined) => string }) {
  if (valor_barra === null || valor_barra === undefined) return <g />;
  const centro_x = coord_x + ancho_barra / 2;
  return (
    <text
      x={centro_x}
      y={coord_y - 5}
      fill="var(--color-foreground)"
      fontSize={10}
      textAnchor="start"
      fontWeight="bold"
      transform={`rotate(-45 ${centro_x} ${coord_y - 5})`}
    >
      {formatear_valor(valor_barra)}
    </text>
  );
}

/**
 * Visualiza las series mensuales junto con las barras acumuladas YTD Target y YTD Actual.
 */
export function GraficaSeries({
  datos_grafica,
  formatear_valor,
  titulo_grafica,
  al_cambiar_titulo_grafica,
  minimo_eje_y,
  maximo_eje_y,
}: PropiedadesGraficaSeries) {
  const { t: translate } = useTranslation();

  return (
    <div className="w-full xl:w-[60%] flex flex-col h-[400px]">
      {al_cambiar_titulo_grafica ? (
        <Input
          value={titulo_grafica}
          onChange={(evento) => al_cambiar_titulo_grafica(evento.target.value)}
          placeholder={translate("pdcaPlan.dynamic.currentTimeSeries")}
          className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80 border-transparent hover:border-input focus:border-input bg-transparent shadow-none"
        />
      ) : (
        <h4 className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80">
          {titulo_grafica}
        </h4>
      )}
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart data={datos_grafica} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-muted-foreground)"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(valor_eje) => formatear_valor(valor_eje)}
            width={80}
            domain={[minimo_eje_y, maximo_eje_y]}
            allowDataOverflow={true}
          />
          <RTooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              backgroundColor: "var(--color-card)",
            }}
            formatter={(valor_tooltip: number) => formatear_valor(valor_tooltip)}
          />
          <Bar
            dataKey="ytdTargetBar"
            name="YTD Target"
            fill="#0078D7"
            barSize={30}
            label={<EtiquetaBarraPersonalizada formatear_valor={formatear_valor} />}
          />
          <Bar
            dataKey="ytdActualBar"
            name="YTD Actual"
            fill="#808080"
            barSize={30}
            label={<EtiquetaBarraPersonalizada formatear_valor={formatear_valor} />}
          />
          <Line
            type="linear"
            dataKey="metaLine"
            name="Meta"
            stroke="#4DB8FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#4DB8FF" }}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="actualLine"
            name="Actual"
            stroke="#0078D7"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#0078D7" }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
