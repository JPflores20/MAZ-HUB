/**
 * @fileoverview Fila editable de la matriz de priorización de causas en Ishikawa con cálculo de puntaje total.
 */
import { X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { AutoResizeTextarea } from "../../components/auto_resize_textarea";
import { cn } from "@/shared/utils/class_names";

export interface CausaPriorizacionIshikawa {
  id: number;
  text: string;
  impact: string | number;
  authority: string | number;
  difficulty: string | number;
  criteria: string;
}

interface PropiedadesFilaPriorizacion {
  registro_causa: CausaPriorizacionIshikawa;
  puede_eliminar: boolean;
  al_actualizar_causa: (causa_id: number, campo: string, valor: string) => void;
  al_eliminar_causa: (causa_id: number) => void;
}

const CAMPOS_NUMERICOS_MATRIZ: ("impact" | "authority" | "difficulty")[] = [
  "impact",
  "authority",
  "difficulty",
];

/**
 * Renderiza una causa probable evaluable por Impacto, Autoridad, Dificultad y criterio adicional.
 */
export function IshikawaPrioritizationRow({
  registro_causa,
  puede_eliminar,
  al_actualizar_causa,
  al_eliminar_causa,
}: PropiedadesFilaPriorizacion) {
  const valor_impacto = Number(registro_causa.impact) || 0;
  const valor_autoridad = Number(registro_causa.authority) || 0;
  const valor_dificultad = Number(registro_causa.difficulty) || 0;

  let total_calculado = valor_impacto * valor_autoridad * valor_dificultad;
  const criterio_limpio = String(registro_causa.criteria || "").trim();
  const criterio_numerico = Number(criterio_limpio);

  if (criterio_limpio !== "" && !Number.isNaN(criterio_numerico)) {
    total_calculado *= criterio_numerico;
  }

  const prioridad_alta = total_calculado > 0;

  return (
    <tr className="border-b border-white group">
      <td className="bg-[#E2E2E2] dark:bg-secondary p-0 border-r border-white relative group/td">
        <AutoResizeTextarea
          value={registro_causa.text}
          onChange={(nuevo_texto) =>
            al_actualizar_causa(registro_causa.id, "text", nuevo_texto)
          }
          className="py-1.5 font-medium focus-visible:ring-black/20 text-xs text-center dark:text-foreground pr-8"
        />
        {puede_eliminar && (
          <button
            type="button"
            onClick={() => al_eliminar_causa(registro_causa.id)}
            className="absolute right-2 top-2 text-muted-foreground/60 hover:text-destructive transition-colors"
            title="Eliminar causa"
          >
            <X className="size-3.5" />
          </button>
        )}
      </td>
      {CAMPOS_NUMERICOS_MATRIZ.map((campo_numerico) => (
        <td key={campo_numerico} className="bg-[#00A2E8] p-0 border-r border-white">
          <Input
            type="number"
            value={registro_causa[campo_numerico]}
            onChange={(evento) =>
              al_actualizar_causa(registro_causa.id, campo_numerico, evento.target.value)
            }
            className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
          />
        </td>
      ))}
      <td className="bg-[#00A2E8] p-0 border-r border-white">
        <AutoResizeTextarea
          value={registro_causa.criteria}
          onChange={(nuevo_texto) =>
            al_actualizar_causa(registro_causa.id, "criteria", nuevo_texto)
          }
          placeholder="Texto..."
          className="py-1.5 font-medium text-white text-center focus-visible:ring-white/50 text-xs placeholder:text-white/50"
        />
      </td>
      <td
        className={cn(
          "p-0 text-center font-bold text-xs",
          prioridad_alta
            ? "bg-[#00B050] text-white"
            : "bg-[#E2E2E2] dark:bg-secondary text-black/60 dark:text-foreground/60",
        )}
      >
        {total_calculado}
      </td>
    </tr>
  );
}
