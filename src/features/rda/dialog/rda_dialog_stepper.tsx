/**
 * @fileoverview Scrollable 5-phase horizontal stepper bar for switching phases and marking completion.
 */

import type React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { Rda } from "@/domain/models/rda";
import { cn } from "@/shared/utils/class_names";
import { is_rda_phase_complete } from "../utils/rda_status";
import {
  get_phase_check_colors,
  get_phase_tab_colors,
  RDA_PHASES,
  type RdaPhase,
} from "./rda_dialog_helpers";

interface RdaDialogStepperProps {
  local_rda: Rda;
  active_tab: RdaPhase;
  on_select_tab: (phase_id: RdaPhase) => void;
  on_toggle_phase_complete: (
    click_event: React.MouseEvent,
    phase_id: RdaPhase,
    phase_number: 1 | 2 | 3 | 4 | 5,
  ) => void;
}

/** Displays scrollable phase tabs with individual phase completion checkboxes. */
export function RdaDialogStepper({
  local_rda,
  active_tab,
  on_select_tab,
  on_toggle_phase_complete,
}: RdaDialogStepperProps) {
  const current_index = RDA_PHASES.findIndex((phase_item) => phase_item.id === active_tab);

  const scroll_stepper = (offset_pixels: number) => {
    const container = document.getElementById("rda-stepper-scroll");
    if (container) container.scrollBy({ left: offset_pixels, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => scroll_stepper(-200)}
        className="flex-shrink-0 flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        id="rda-stepper-scroll"
        className="flex flex-1 items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {RDA_PHASES.map((phase_item, phase_index) => {
          const is_current = phase_index === current_index;
          const phase_number = (phase_index + 1) as 1 | 2 | 3 | 4 | 5;
          const is_completed = is_rda_phase_complete(local_rda, phase_number);

          return (
            <div
              key={phase_item.id}
              onClick={() => on_select_tab(phase_item.id)}
              className={cn(
                "flex flex-1 items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none whitespace-nowrap",
                get_phase_tab_colors(phase_item.id, is_current),
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    is_current
                      ? "border-transparent bg-white/20 text-current"
                      : "border-current/20 text-current opacity-70",
                  )}
                >
                  {phase_index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xs font-semibold uppercase tracking-wide truncate">
                    {phase_item.label.substring(3)}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={(click_event) =>
                  on_toggle_phase_complete(click_event, phase_item.id, phase_number)
                }
                className={cn(
                  "shrink-0 size-6 grid place-items-center rounded-full border-2 transition-all",
                  get_phase_check_colors(phase_item.id, is_current, is_completed),
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll_stepper(200)}
        className="flex-shrink-0 flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
