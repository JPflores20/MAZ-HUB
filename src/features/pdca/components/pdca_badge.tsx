/**
 * @fileoverview Insignia visual codificada por color para mostrar la fase actual de un proyecto PDCA.
 */
import { cn } from "@/shared/utils/class_names";
import { PHASE_STYLES, type Phase } from "@/domain/pdca";

interface PropiedadesPhaseBadge {
  phase: Phase;
  className?: string;
}

/**
 * Renderiza una etiqueta visual con el color distintivo de la fase PDCA actual.
 * @param props - Fase activa y clases CSS opcionales adicionales.
 */
export function PhaseBadge({ phase, className }: PropiedadesPhaseBadge) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        PHASE_STYLES[phase],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {phase}
    </span>
  );
}
