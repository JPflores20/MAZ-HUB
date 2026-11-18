/**
 * chart_context.tsx
 * Contexto, tipado de configuración CSS por tema y contenedor responsivo para gráficas Recharts.
 */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/shared/utils/class_names";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [series_key in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

/**
 * Obtiene la configuración activa de la gráfica dentro de `<ChartContainer />`.
 *
 * @returns Contexto con el mapa `config` de series y colores.
 */
function useChart() {
  const chart_context = React.useContext(ChartContext);
  if (!chart_context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return chart_context;
}

/**
 * Resuelve la definición de estilo de una serie a partir del payload recibido desde Recharts.
 *
 * @param chart_config - Configuración declarada en `ChartContainer`.
 * @param payload_entry - Objeto de serie individual entregado por Recharts.
 * @param property_key - Clave candidata para buscar etiqueta e ícono.
 * @returns Configuración encontrada para la serie o `undefined`.
 */
export function get_payload_config_from_payload(
  chart_config: ChartConfig,
  payload_entry: unknown,
  property_key: string,
) {
  if (typeof payload_entry !== "object" || payload_entry === null) {
    return undefined;
  }

  const nested_payload =
    "payload" in payload_entry &&
    typeof payload_entry.payload === "object" &&
    payload_entry.payload !== null
      ? payload_entry.payload
      : undefined;

  let config_label_key: string = property_key;

  if (
    property_key in payload_entry &&
    typeof payload_entry[property_key as keyof typeof payload_entry] === "string"
  ) {
    config_label_key = payload_entry[property_key as keyof typeof payload_entry] as string;
  } else if (
    nested_payload &&
    property_key in nested_payload &&
    typeof nested_payload[property_key as keyof typeof nested_payload] === "string"
  ) {
    config_label_key = nested_payload[property_key as keyof typeof nested_payload] as string;
  }

  return config_label_key in chart_config
    ? chart_config[config_label_key]
    : chart_config[property_key as keyof typeof chart_config];
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const color_config = Object.entries(config).filter(
    ([, series_config]) => series_config.theme || series_config.color,
  );

  if (!color_config.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme_name, selector_prefix]) => `
${selector_prefix} [data-chart=${id}] {
${color_config
  .map(([series_key, item_config]) => {
    const resolved_color =
      item_config.theme?.[theme_name as keyof typeof item_config.theme] || item_config.color;
    return resolved_color ? `  --color-${series_key}: ${resolved_color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const unique_id = React.useId();
  const chart_id = `chart-${id || unique_id.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chart_id}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chart_id} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

export { ChartContainer, ChartStyle, useChart };
