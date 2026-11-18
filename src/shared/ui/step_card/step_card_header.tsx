/**
 * step_card_header.tsx
 * Encabezado interactivo para las tarjetas de paso metodológico (`StepCard`).
 */
import React from "react";
import { Check, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/shared/utils/class_names";

export interface StepCardHeaderProps {
  title: React.ReactNode;
  badgeText?: string | undefined;
  isExpanded: boolean;
  isFullscreen: boolean;
  isCompleted?: boolean | undefined;
  isNA?: boolean | undefined;
  headerRight?: React.ReactNode | undefined;
  onToggleExpand: () => void;
  onToggleFullscreen: () => void;
  onToggleComplete?: (() => void) | undefined;
  onToggleNA?: (() => void) | undefined;
}

/**
 * Renderiza la cabecera clicable de `StepCard` con botón de completado, N/A, pantalla completa y expansión.
 *
 * @param props - Propiedades visuales y callbacks de control del encabezado.
 * @returns Elemento JSX del encabezado.
 */
export function StepCardHeader({
  title,
  badgeText,
  isExpanded,
  isFullscreen,
  isCompleted,
  isNA,
  headerRight,
  onToggleExpand,
  onToggleFullscreen,
  onToggleComplete,
  onToggleNA,
}: StepCardHeaderProps) {
  return (
    <div
      onClick={onToggleExpand}
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-muted/30 print:bg-transparent print:px-0 print:py-2",
        isExpanded && "border-b border-border/50 bg-muted/10",
        isFullscreen && "sticky top-0 z-10 bg-background shadow-xs",
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleComplete ? (
          <button
            type="button"
            onClick={(click_event) => {
              click_event.stopPropagation();
              onToggleComplete();
            }}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer",
              isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                : "border-muted-foreground/30 hover:border-emerald-500/60 bg-background text-transparent",
            )}
            title={isCompleted ? "Paso Completado (clic para desmarcar)" : "Marcar paso como Completado"}
          >
            <Check className="size-3.5 stroke-[3]" />
          </button>
        ) : (
          <div
            className={cn(
              "size-2.5 shrink-0 rounded-full transition-colors",
              isCompleted ? "bg-emerald-500" : isExpanded ? "bg-primary" : "bg-muted-foreground/30",
            )}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            {title}
            {isCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Completado
              </span>
            )}
          </h4>
          {badgeText && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border/50">
              {badgeText}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleNA && (
          <button
            type="button"
            onClick={(click_event) => {
              click_event.stopPropagation();
              onToggleNA();
            }}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer",
              isNA
                ? "border-slate-500 bg-slate-600 text-white shadow-xs dark:border-slate-400 dark:bg-slate-700"
                : "border-border bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            title={isNA ? "Este paso está marcado como No Aplica (N/A)" : "Marcar este paso como No Aplica (N/A)"}
          >
            N/A
          </button>
        )}

        {headerRight && (
          <div onClick={(click_event) => click_event.stopPropagation()} className="flex items-center gap-2">
            {headerRight}
          </div>
        )}

        <button
          type="button"
          onClick={(click_event) => {
            click_event.stopPropagation();
            onToggleFullscreen();
          }}
          className="flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground print:hidden"
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Ampliar paso a pantalla completa"}
          title={isFullscreen ? "Salir de pantalla completa" : "Ampliar paso (Pantalla completa)"}
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>

        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground print:hidden"
          aria-label={isExpanded ? "Colapsar paso" : "Expandir paso"}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isExpanded ? "rotate-180 text-foreground" : "rotate-0",
            )}
          />
        </button>
      </div>
    </div>
  );
}
