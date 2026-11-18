/**
 * @fileoverview Editable or read-only PDCA deadline cell with inline calendar popover.
 */

import type React from "react";
import { es } from "date-fns/locale";
import { Calendar, CalendarClock, X } from "lucide-react";
import type { Pdca } from "@/domain/pdca";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarUI } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { is_pdca_deadline_expired, parse_pdca_deadline } from "./pdca_progress_helpers";

interface PdcaDeadlineCellProps {
  pdca_entry: Pdca;
  can_edit_deadline: boolean;
  is_picker_open: boolean;
  on_picker_open_change: (open: boolean) => void;
  on_select_deadline: (selected_date: Date | undefined, is_no_limit?: boolean) => void;
  on_remove_deadline: (click_event: React.MouseEvent) => void;
}

/** Displays PDCA target date status with inline admin/editor calendar control when authorized. */
export function PdcaDeadlineCell({
  pdca_entry,
  can_edit_deadline,
  is_picker_open,
  on_picker_open_change,
  on_select_deadline,
  on_remove_deadline,
}: PdcaDeadlineCellProps) {
  const { deadline_text, is_no_limit, deadline_date } = parse_pdca_deadline(
    pdca_entry.fechaFinalizacion,
  );
  const is_expired = is_pdca_deadline_expired(deadline_date, pdca_entry.fase, pdca_entry.progreso);

  if (!can_edit_deadline) {
    if (is_no_limit) {
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <CalendarClock className="size-3.5" /> Sin límite
        </span>
      );
    }
    if (deadline_date) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium ${is_expired ? "text-red-500 dark:text-red-400" : "text-foreground"}`}
        >
          <Calendar
            className={`size-3.5 ${is_expired ? "text-red-500 dark:text-red-400" : "text-brand-yellow"}`}
          />
          {deadline_text}
          {is_expired && (
            <span className="text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">
              Vencida
            </span>
          )}
        </span>
      );
    }
    return <span className="text-muted-foreground/50 italic text-xs">Sin asignar</span>;
  }

  return (
    <div className="flex items-center gap-1" onClick={(click_event) => click_event.stopPropagation()}>
      <Popover open={is_picker_open} onOpenChange={on_picker_open_change}>
        <PopoverTrigger asChild>
          <button
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary border ${
              is_expired
                ? "border-red-400/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                : deadline_date || is_no_limit
                  ? "border-border text-foreground bg-transparent"
                  : "border-dashed border-muted-foreground/40 text-muted-foreground/60 italic"
            }`}
          >
            <CalendarClock className="size-3.5 shrink-0" />
            {is_no_limit ? (
              "Sin límite"
            ) : deadline_date ? (
              <>
                {deadline_text}
                {is_expired && (
                  <span className="ml-1 text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">
                    Vencida
                  </span>
                )}
              </>
            ) : (
              "Asignar fecha"
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <CalendarUI
            mode="single"
            selected={deadline_date}
            onSelect={(selected_date) => on_select_deadline(selected_date)}
            locale={es}
            initialFocus
          />
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs font-normal text-muted-foreground"
              onClick={() => on_select_deadline(undefined, true)}
            >
              Sin límite de tiempo
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {deadline_date && (
        <button
          title="Quitar fecha límite"
          onClick={on_remove_deadline}
          className="rounded p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
