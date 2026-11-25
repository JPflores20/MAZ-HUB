/**
 * @fileoverview Admin popover displaying PDCAs and RDAs missing target deadlines with inline calendar pickers.
 */

import type React from "react";
import { lazy, Suspense, useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { get_rda_display_name } from "@/features/rda/utils/rda_name";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

const LazyLayoutDeadlinePickerRow = lazy(() =>
  import("./layout_deadline_picker_row").then((picker_module) => ({
    default: picker_module.LayoutDeadlinePickerRow,
  })),
);

interface LayoutDeadlinesPopoverProps {
  isAdmin: boolean;
  pendingDeadlinePdcas: Pdca[];
  pendingDeadlineRdas: Rda[];
  deadlinePickerOpenId: string | null;
  setDeadlinePickerOpenId: (id: string | null) => void;
  handleDeadlineChange: (id: string, date: Date | undefined, isNoLimit?: boolean) => void;
  handleRdaDeadlineChange?:
    | ((id: string, date: Date | undefined, isNoLimit?: boolean) => void)
    | undefined;
}

/**
 * Header alert button + dropdown listing projects without assigned completion deadlines.
 *
 * @param {LayoutDeadlinesPopoverProps} props - Admin check, pending lists, picker state, and change handlers.
 * @returns {React.ReactElement} Popover control for top header bar.
 */
export const LayoutDeadlinesPopover: React.FC<LayoutDeadlinesPopoverProps> = ({
  isAdmin,
  pendingDeadlinePdcas,
  pendingDeadlineRdas,
  deadlinePickerOpenId,
  setDeadlinePickerOpenId,
  handleDeadlineChange,
  handleRdaDeadlineChange,
}) => {
  const [popover_open, set_popover_open] = useState(false);
  const total_missing_deadlines = pendingDeadlinePdcas.length + pendingDeadlineRdas.length;

  return (
    <Popover open={popover_open} onOpenChange={set_popover_open}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-blue-200/80 hover:bg-white/10 hover:text-white"
          title="Proyectos sin fecha límite"
        >
          <CalendarClock className="size-5" />
          {isAdmin && total_missing_deadlines > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 dark:bg-red-600 px-1 text-[11px] font-bold text-white shadow-md">
              {total_missing_deadlines}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-[400px] p-0 border border-border bg-background text-foreground shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <CalendarClock className="size-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground leading-none">
                Fechas Límite (PDCA & RDA)
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Panel de administración</p>
            </div>
          </div>
          {isAdmin && total_missing_deadlines > 0 && (
            <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold border border-red-200 dark:border-red-800">
              {total_missing_deadlines} sin fecha
            </span>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {!isAdmin ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-sm text-foreground">Sin alertas administrativas</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                No tienes avisos pendientes por el momento.
              </p>
            </div>
          ) : total_missing_deadlines === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-semibold text-sm text-foreground">¡Todo al día!</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[220px] mx-auto">
                Todos los PDCAs y RDAs tienen fecha límite asignada.
              </p>
            </div>
          ) : !popover_open ? null : (
            <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Cargando calendario...</div>}>
              {pendingDeadlinePdcas.map((pdca_entry) => {
                const picker_key = `pdca-${pdca_entry.id}`;
                return (
                  <LazyLayoutDeadlinePickerRow
                    key={picker_key}
                    moduleLabel="PDCA"
                    title={pdca_entry.titulo || "Sin título"}
                    authorLabel={pdca_entry.autor || "Usuario"}
                    areaLabel={pdca_entry.area}
                    badgeClasses=""
                    iconWrapperClasses="bg-blue-100 dark:bg-blue-900/30"
                    iconColorClasses="text-blue-600 dark:text-blue-400"
                    isOpen={deadlinePickerOpenId === picker_key}
                    onOpenChange={(is_open) => setDeadlinePickerOpenId(is_open ? picker_key : null)}
                    onAssignDate={(selected_date, is_no_limit) =>
                      handleDeadlineChange(pdca_entry.id, selected_date, is_no_limit)
                    }
                  />
                );
              })}

              {pendingDeadlineRdas.map((rda_entry) => {
                const picker_key = `rda-${rda_entry.id}`;
                return (
                  <LazyLayoutDeadlinePickerRow
                    key={picker_key}
                    moduleLabel="RDA"
                    title={get_rda_display_name(rda_entry, "Sin título")}
                    authorLabel={
                      rda_entry.portada?.autorOriginal ||
                      rda_entry.context?.iniciadoPor ||
                      "Usuario"
                    }
                    areaLabel={rda_entry.context?.area || rda_entry.context?.planta || "-"}
                    badgeClasses="border-purple-400/40 text-purple-600"
                    iconWrapperClasses="bg-purple-100 dark:bg-purple-900/30"
                    iconColorClasses="text-purple-600 dark:text-purple-400"
                    isOpen={deadlinePickerOpenId === picker_key}
                    onOpenChange={(is_open) => setDeadlinePickerOpenId(is_open ? picker_key : null)}
                    onAssignDate={(selected_date, is_no_limit) =>
                      handleRdaDeadlineChange?.(rda_entry.id, selected_date, is_no_limit)
                    }
                  />
                );
              })}
            </Suspense>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
