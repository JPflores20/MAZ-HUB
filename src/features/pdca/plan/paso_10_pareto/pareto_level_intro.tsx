/**
 * @fileoverview Instrucciones y selector de unidad para el Pareto de nivel raíz (Nivel 0).
 */
import { Input } from "@/shared/ui/input";
import { StepInstructions } from "../../components/step_instructions";

interface PropiedadesIntroNivelPareto {
  unit: string;
  on_unit_change?: ((unidad: string) => void) | undefined;
}

/**
 * Muestra guía de llenado e input de unidad de medida únicamente para el Pareto raíz.
 */
export function ParetoLevelZeroIntro({ unit, on_unit_change }: PropiedadesIntroNivelPareto) {
  return (
    <>
      <StepInstructions>
        <p className="mb-2">
          1. Usa la columna de categorías para identificar los KPI o IP. Este será tu eje X.
        </p>
        <p className="mb-2">
          2. Introduce tus datos (Valor / Gap) en las mismas unidades.
        </p>
        <p className="mb-2">3. El gráfico de Pareto se genera automáticamente.</p>
        <p>4. Haz clic en una barra para crear un sub-Pareto (Nivel 2).</p>
      </StepInstructions>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Unidad de Medida:
        </span>
        <Input
          value={unit}
          onChange={(evento) => on_unit_change?.(evento.target.value)}
          placeholder="ej. $, %, HL"
          className="w-28 h-7 text-xs font-bold"
        />
      </div>
    </>
  );
}
