/**
 * calendar.tsx
 * Componente base de calendario (shadcn/ui + react-day-picker) para selección interactiva de fechas.
 */
"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/shared/utils/class_names";
import { Button, button_variants } from "@/shared/ui/button";
import { CalendarDayButton } from "./calendar_day_button";

/**
 * Muestra un calendario interactivo de selección simple o por rangos.
 *
 * @param props - Opciones estándar de `DayPicker` más variante de botones de navegación.
 * @returns Selector visual de calendario.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const default_class_names = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (calendar_date) =>
          calendar_date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", default_class_names.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", default_class_names.months),
        month: cn("flex w-full flex-col gap-4", default_class_names.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          default_class_names.nav,
        ),
        button_previous: cn(
          button_variants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          default_class_names.button_previous,
        ),
        button_next: cn(
          button_variants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          default_class_names.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          default_class_names.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          default_class_names.dropdowns,
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          default_class_names.dropdown_root,
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", default_class_names.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          default_class_names.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", default_class_names.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          default_class_names.weekday,
        ),
        week: cn("mt-2 flex w-full", default_class_names.week),
        week_number_header: cn("w-(--cell-size) select-none", default_class_names.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          default_class_names.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          default_class_names.day,
        ),
        range_start: cn("bg-accent rounded-l-md", default_class_names.range_start),
        range_middle: cn("rounded-none", default_class_names.range_middle),
        range_end: cn("bg-accent rounded-r-md", default_class_names.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          default_class_names.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          default_class_names.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", default_class_names.disabled),
        hidden: cn("invisible", default_class_names.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: root_class, rootRef, ...root_props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(root_class)} {...root_props} />
        ),
        Chevron: ({ className: chevron_class, orientation, ...chevron_props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", chevron_class)} {...chevron_props} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", chevron_class)} {...chevron_props} />;
          }
          return <ChevronDownIcon className={cn("size-4", chevron_class)} {...chevron_props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...week_props }) => (
          <td {...week_props}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}
