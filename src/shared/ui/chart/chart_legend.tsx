/**
 * chart_legend.tsx
 * Primitivas de leyenda para gráficas Recharts sincronizadas con `ChartConfig`.
 */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/shared/utils/class_names";
import { get_payload_config_from_payload, useChart } from "./chart_context";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((legend_item) => legend_item.type !== "none")
        .map((legend_item) => {
          const property_key = `${nameKey || legend_item.dataKey || "value"}`;
          const item_config = get_payload_config_from_payload(config, legend_item, property_key);

          return (
            <div
              key={legend_item.value}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {item_config?.icon && !hideIcon ? (
                <item_config.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: legend_item.color }}
                />
              )}
              {item_config?.label}
            </div>
          );
        })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

export { ChartLegend, ChartLegendContent };
