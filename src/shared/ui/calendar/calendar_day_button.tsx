/**
 * calendar_day_button.tsx
 * Botón individual de día para `<Calendar />` con manejo automático de foco y estados de rango.
 */
"use client";

import * as React from "react";
import { DayButton, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/shared/utils/class_names";
import { Button } from "@/shared/ui/button";

/**
 * Renderiza una celda clicable de día dentro de `DayPicker`.
 *
 * @param props - Propiedades del día y modificadores proporcionados por `react-day-picker`.
 * @returns Botón de día con estilos de selección y rango.
 */
export function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const default_class_names = getDefaultClassNames();
  const day_button_ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers["focused"]) day_button_ref.current?.focus();
  }, [modifiers]);

  return (
    <Button
      ref={day_button_ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers["selected"] &&
        !modifiers["range_start"] &&
        !modifiers["range_end"] &&
        !modifiers["range_middle"]
      }
      data-range-start={modifiers["range_start"]}
      data-range-end={modifiers["range_end"]}
      data-range-middle={modifiers["range_middle"]}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        default_class_names.day,
        className,
      )}
      {...props}
    />
  );
}
