/**
 * chart_tooltip.tsx
 * Primitivas de tooltip personalizado para gráficas Recharts integradas con `ChartConfig`.
 */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/shared/utils/class_names";
import { get_payload_config_from_payload, useChart } from "./chart_context";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltip_label = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [first_item] = payload;
      const property_key = `${labelKey || first_item?.dataKey || first_item?.name || "value"}`;
      const item_config = get_payload_config_from_payload(config, first_item, property_key);
      const resolved_label =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : item_config?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(resolved_label, payload)}
          </div>
        );
      }

      if (!resolved_label) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{resolved_label}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nest_label = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nest_label ? tooltip_label : null}
        <div className="grid gap-1.5">
          {payload
            .filter((payload_item) => payload_item.type !== "none")
            .map((payload_item, item_index) => {
              const property_key = `${nameKey || payload_item.name || payload_item.dataKey || "value"}`;
              const item_config = get_payload_config_from_payload(config, payload_item, property_key);
              const indicator_color = color || payload_item.payload.fill || payload_item.color;

              return (
                <div
                  key={payload_item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && payload_item?.value !== undefined && payload_item.name ? (
                    formatter(
                      payload_item.value,
                      payload_item.name,
                      payload_item,
                      item_index,
                      payload_item.payload,
                    )
                  ) : (
                    <>
                      {item_config?.icon ? (
                        <item_config.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nest_label && indicator === "dashed",
                              },
                            )}
                            style={
                              {
                                "--color-bg": indicator_color,
                                "--color-border": indicator_color,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nest_label ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nest_label ? tooltip_label : null}
                          <span className="text-muted-foreground">
                            {item_config?.label || payload_item.name}
                          </span>
                        </div>
                        {payload_item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {payload_item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

export { ChartTooltip, ChartTooltipContent };
