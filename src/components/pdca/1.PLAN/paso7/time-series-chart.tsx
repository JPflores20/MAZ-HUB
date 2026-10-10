import React from "react";
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
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface PropiedadesGraficaSeries {
  datosGrafica: any[];
  formatearValor: (valor: number | null | undefined) => string;
  tituloGrafica: string;
  alCambiarTituloGrafica?: ((nuevoTitulo: string) => void) | undefined;
  minimoEjeY: number;
  maximoEjeY: string | number;
}

export function GraficaSeries({
  datosGrafica,
  formatearValor,
  tituloGrafica,
  alCambiarTituloGrafica,
  minimoEjeY,
  maximoEjeY,
}: PropiedadesGraficaSeries) {
    const { t } = useTranslation();
  
  const EtiquetaBarraPersonalizada = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="var(--color-foreground)"
        fontSize={10}
        textAnchor="start"
        fontWeight="bold"
        transform={`rotate(-45 ${x + width / 2} ${y - 5})`}
      >
        {formatearValor(value)}
      </text>
    );
  };

  return (
    <div className="w-full xl:w-[60%] flex flex-col h-[400px]">
      {alCambiarTituloGrafica ? (
        <Input
          value={tituloGrafica}
          onChange={(eventoCambioInput) => alCambiarTituloGrafica(eventoCambioInput.target.value)}
          placeholder={t('pdcaPlan.dynamic.currentTimeSeries')}
          className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80 border-transparent hover:border-input focus:border-input bg-transparent shadow-none"
        />
      ) : (
        <h4 className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80">
          {tituloGrafica}
        </h4>
      )}
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart data={datosGrafica} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
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
            tickFormatter={(valorParaFormatear) => formatearValor(valorParaFormatear)}
            width={80}
            domain={[minimoEjeY, maximoEjeY]}
            allowDataOverflow={true}
          />
          <RTooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              backgroundColor: "var(--color-card)",
            }}
            formatter={(valorTooltip: number) => formatearValor(valorTooltip)}
          />
          <Bar
            dataKey="ytdTargetBar"
            name="YTD Target"
            fill="#0078D7"
            barSize={30}
            label={<EtiquetaBarraPersonalizada />}
          />
          <Bar
            dataKey="ytdActualBar"
            name="YTD Actual"
            fill="#808080"
            barSize={30}
            label={<EtiquetaBarraPersonalizada />}
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
