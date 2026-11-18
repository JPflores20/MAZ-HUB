/**
 * @fileoverview Paso 17 del PDCA: Sección contenedora de múltiples tablas de 5 Porqués con envío a Paso 18.
 */
import { useTranslation } from "react-i18next";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { StepCard } from "@/shared/ui/step_card";
import type { FiveWhysTableData } from "@/domain/pdca";
import { FiveWhysInteractive } from "./five_whys_interactive";
import type { FilaCincoPorques } from "./five_whys_types";

interface PropiedadesFiveWhysSection {
  tables: FiveWhysTableData[];
  onChange: (tablas: FiveWhysTableData[]) => void;
  onSendToConclusions?:
    | ((hallazgos: { problema: string; causaRaiz: string; accion: string }[]) => void)
    | undefined;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite añadir o eliminar análisis 5 Why's por bloque temático y extraer causas raíz hacia conclusiones.
 */
export function FiveWhysSection({
  tables,
  onChange,
  onSendToConclusions,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: PropiedadesFiveWhysSection) {
  const { t: translate } = useTranslation();

  const agregar_tabla = () => {
    const nueva_id = `fivewhys-${Date.now()}`;
    onChange([
      ...tables,
      {
        id: nueva_id,
        title: "MÉTODO",
        rows: [
          {
            id: Date.now(),
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
          },
        ],
      },
    ]);
  };

  const actualizar_filas_tabla = (tabla_id: string, nuevas_filas: FilaCincoPorques[]) => {
    onChange(
      tables.map((tabla_actual) =>
        tabla_actual.id === tabla_id
          ? { ...tabla_actual, rows: nuevas_filas as FiveWhysTableData["rows"] }
          : tabla_actual,
      ),
    );
  };

  const actualizar_titulo_tabla = (tabla_id: string, nuevo_titulo: string) => {
    onChange(
      tables.map((tabla_actual) =>
        tabla_actual.id === tabla_id ? { ...tabla_actual, title: nuevo_titulo } : tabla_actual,
      ),
    );
  };

  const eliminar_tabla = (tabla_id: string) => {
    if (tables.length === 1) return;
    onChange(tables.filter((tabla_actual) => tabla_actual.id !== tabla_id));
  };

  const manejar_envio_conclusiones = () => {
    if (!onSendToConclusions) return;
    const hallazgos: { problema: string; causaRaiz: string; accion: string }[] = [];

    tables.forEach((tabla_actual) => {
      const filas = (
        Array.isArray(tabla_actual.rows)
          ? tabla_actual.rows
          : Object.values(tabla_actual.rows || {})
      ) as Record<string, unknown>[];
      filas.forEach((fila_actual) => {
        const claves_w = Object.keys(fila_actual || {})
          .filter((clave) => /^w\d+$/.test(clave))
          .sort(
            (clave_anterior, clave_siguiente) =>
              Number(clave_siguiente.slice(1)) - Number(clave_anterior.slice(1)),
          );

        let causa_mas_profunda = "";
        for (const clave of claves_w) {
          const valor_w = String(fila_actual[clave] || "").trim();
          if (valor_w) {
            causa_mas_profunda = valor_w;
            break;
          }
        }

        const problema_inicial = String(fila_actual?.["q1"] || "").trim();
        const accion_texto = String(fila_actual?.["accion"] || "").trim();

        if (causa_mas_profunda || problema_inicial) {
          hallazgos.push({
            problema: problema_inicial || tabla_actual.title || "Desviación en 5 Porqués",
            causaRaiz: causa_mas_profunda || problema_inicial,
            accion: accion_texto,
          });
        }
      });
    });

    if (hallazgos.length === 0) {
      toast.error(
        "Completa al menos una fila en los 5 Porqués antes de enviar a Causas Raíz.",
      );
      return;
    }

    onSendToConclusions(hallazgos);
  };

  return (
    <StepCard
      className="overflow-hidden"
      title="PASO 17: 5 WHY'S"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        onSendToConclusions ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={manejar_envio_conclusiones}
            className="h-8 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
            title="Enviar causas raíz identificadas en 5 Porqués a la tabla del Paso 18"
          >
            Enviar a Causas Raíz (Paso 18) <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-8">
        {tables.map((tabla_actual, indice_tabla) => (
          <div key={tabla_actual.id} className="pt-4">
            <FiveWhysInteractive
              value={tabla_actual.rows as FilaCincoPorques[]}
              onChange={(filas) => actualizar_filas_tabla(tabla_actual.id, filas)}
              title={tabla_actual.title}
              onTitleChange={(titulo) => actualizar_titulo_tabla(tabla_actual.id, titulo)}
              index={indice_tabla}
              onRemoveTable={
                tables.length > 1 ? () => eliminar_tabla(tabla_actual.id) : undefined
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={agregar_tabla}
          className="border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-4 mr-2" />
          {translate("pdcaPlan.paso17_five_whys_add_table")}
        </Button>
      </div>
    </StepCard>
  );
}
