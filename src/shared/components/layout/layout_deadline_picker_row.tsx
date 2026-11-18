/**
 * @fileoverview Reusable deadline assignment row with calendar date picker and "Sin límite" action.
 */

import type React from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { es } from "date-fns/locale";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarUI } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/** Props accepted by LayoutDeadlinePickerRow. */
export interface LayoutDeadlinePickerRowProps {
  moduleLabel: "PDCA" | "RDA";
  title: string;
  authorLabel: string;
  areaLabel: string;
  badgeClasses: string;
  iconWrapperClasses: string;
  iconColorClasses: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignDate: (selectedDate: Date | undefined, isNoLimit?: boolean) => void;
}

/**
 * Renders one pending-deadline row for either a PDCA or RDA document with an attached calendar popover.
 *
 * @param {LayoutDeadlinePickerRowProps} props - Module styling, metadata, popover open state, and selection callback.
 * @returns {React.ReactElement} Interactive calendar popover row.
 */
export const LayoutDeadlinePickerRow: React.FC<LayoutDeadlinePickerRowProps> = ({
  moduleLabel,
  title,
  authorLabel,
  areaLabel,
  badgeClasses,
  iconWrapperClasses,
  iconColorClasses,
  isOpen,
  onOpenChange,
  onAssignDate,
}) => (
  <Popover open={isOpen} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 border border-transparent hover:border-border transition-all group cursor-pointer">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${iconWrapperClasses}`}
        >
          <Calendar className={`size-4 ${iconColorClasses}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${badgeClasses}`}>
              {moduleLabel}
            </Badge>
            <p className="text-sm font-semibold text-foreground truncate leading-snug">{title}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {authorLabel} · <span className="text-foreground/60">{areaLabel}</span>
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Asignar fecha límite</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="end" side="left">
      <CalendarUI
        mode="single"
        selected={undefined}
        onSelect={(selected_date) => onAssignDate(selected_date)}
        locale={es}
        initialFocus
      />
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-normal text-muted-foreground"
          onClick={() => onAssignDate(undefined, true)}
        >
          Sin límite de tiempo
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);
