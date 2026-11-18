/**
 * @fileoverview Encabezado con botón de completado y badge de estatus para cada paso del diálogo PDCA.
 */
import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils/class_names";

interface PropiedadesEncabezadoPaso {
  stepId: string;
  title: string;
  completedSteps: Set<string>;
  onToggleStep: (step_id: string) => void;
  children?: React.ReactNode;
}

/**
 * Muestra el título del paso junto con un botón circular para marcar o desmarcar completitud.
 */
export function StepHeader({
  stepId,
  title,
  completedSteps,
  onToggleStep,
  children,
}: PropiedadesEncabezadoPaso) {
  const { t: translate } = useTranslation();
  const esta_completado = completedSteps.has(stepId);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleStep(stepId)}
          title={
            esta_completado
              ? translate("pdcaGlobal.desmarcar")
              : translate("pdcaGlobal.marcar")
          }
          className={cn(
            "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
            esta_completado
              ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
              : "border-muted-foreground/40 text-muted-foreground/40 hover:border-emerald-500 hover:text-emerald-500 bg-background",
          )}
        >
          <Check className="size-4" />
        </button>
        <h3
          className={cn(
            "font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2",
            esta_completado && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          <span>{title}</span>
          {esta_completado && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>
      {children}
    </div>
  );
}
