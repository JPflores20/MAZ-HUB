/**
 * step_card.tsx
 * Contenedor acordeón con memoria de expansión en `localStorage`, estado de completado,
 * marca opcional N/A y modo de ampliación a pantalla completa.
 */
import React from "react";
import { cn } from "@/shared/utils/class_names";
import { useStepCardState } from "./use_step_card_state";
import { StepCardHeader } from "./step_card_header";

export interface StepCardProps {
  stepNumber?: number | string | undefined;
  title: React.ReactNode;
  badgeText?: string | undefined;
  defaultOpen?: boolean | undefined;
  defaultExpanded?: boolean | undefined;
  headerRight?: React.ReactNode | undefined;
  children: React.ReactNode;
  className?: string | undefined;
  storageId?: string | undefined;
  isCompleted?: boolean | undefined;
  isStepCompleted?: boolean | undefined;
  onToggleComplete?: ((completed: boolean) => void) | undefined;
  onToggleStep?: (() => void) | undefined;
  isNA?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleNA?: ((is_na: boolean) => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Tarjeta colapsable reutilizada por los pasos de PDCA y RDA.
 *
 * @param props - Configuración visual, estado opcional controlado y contenido hijo.
 * @returns Contenedor expandible de paso metodológico.
 */
export function StepCard({
  title,
  badgeText,
  defaultOpen,
  defaultExpanded,
  headerRight,
  children,
  className,
  storageId,
  isCompleted,
  isStepCompleted,
  onToggleComplete,
  onToggleStep,
  isNA,
  isNa,
  onToggleNA,
  onToggleNa,
}: StepCardProps) {
  const initial_expanded = defaultExpanded ?? defaultOpen ?? false;
  const resolved_completed = isStepCompleted ?? isCompleted;
  const resolved_na = isNa ?? isNA;

  const {
    is_expanded,
    has_mounted,
    is_fullscreen,
    toggle_expanded,
    toggle_fullscreen,
  } = useStepCardState(storageId, initial_expanded);

  const handle_toggle_complete =
    onToggleStep || onToggleComplete
      ? () => {
          if (onToggleStep) {
            onToggleStep();
          } else {
            onToggleComplete?.(!resolved_completed);
          }
        }
      : undefined;

  const handle_toggle_na =
    onToggleNa || onToggleNA
      ? () => {
          if (onToggleNa) {
            onToggleNa();
          } else {
            onToggleNA?.(!resolved_na);
          }
        }
      : undefined;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-all duration-200 overflow-hidden",
        is_fullscreen
          ? "fixed inset-4 z-[90] flex flex-col overflow-hidden shadow-2xl border-primary/40 ring-4 ring-black/20 dark:ring-black/50"
          : "",
        resolved_completed
          ? "border-emerald-500/40 shadow-xs"
          : is_expanded
            ? "border-primary/40 shadow-sm"
            : "border-border shadow-none hover:border-border/80",
        className,
      )}
    >
      <StepCardHeader
        title={title}
        badgeText={badgeText}
        isExpanded={is_expanded}
        isFullscreen={is_fullscreen}
        isCompleted={resolved_completed}
        isNA={resolved_na}
        headerRight={headerRight}
        onToggleExpand={toggle_expanded}
        onToggleFullscreen={toggle_fullscreen}
        onToggleComplete={handle_toggle_complete}
        onToggleNA={handle_toggle_na}
      />

      <div
        className={cn(
          is_fullscreen
            ? "flex-1 overflow-y-auto bg-card"
            : "grid transition-all duration-300 ease-in-out",
          !is_fullscreen &&
            (is_expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 print:grid-rows-[1fr] print:opacity-100"),
        )}
      >
        <div className={is_fullscreen ? "h-full" : "overflow-hidden"}>
          {has_mounted && (
            <div className="p-4 pt-3 print:px-0 print:py-2 relative">
              <div
                className={cn(
                  resolved_na && "pointer-events-none select-none opacity-45 transition-opacity",
                )}
              >
                {children}
              </div>
              {resolved_na && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                  Paso marcado como N/A — No aplica para este proyecto/análisis.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
