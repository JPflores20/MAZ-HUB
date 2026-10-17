/**
 * five-whys-section.tsx
 * Paso 17 del PDCA: Sección contenedora del análisis de 5 Porqués (5 Whys).
 */
import { useTranslation } from "react-i18next";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import type { FiveWhysTableData } from "@/data/pdca";
import { FiveWhysInteractive } from "./five-whys-interactive";

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

export function FiveWhysSection({
  tables,
  onChange,
  onSendToConclusions,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: PropiedadesFiveWhysSection) {
  const { t } = useTranslation();

  const agregarTabla = () => {
    const nuevaId = `fivewhys-${Date.now()}`;
    onChange([
      ...tables,
      {
        id: nuevaId,
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

  const actualizarFilasTabla = (idTabla: string, nuevasFilas: any[]) => {
    onChange(
      tables.map((tabla) => (tabla.id === idTabla ? { ...tabla, rows: nuevasFilas } : tabla)),
    );
  };

  const actualizarTituloTabla = (idTabla: string, nuevoTitulo: string) => {
    onChange(
      tables.map((tabla) => (tabla.id === idTabla ? { ...tabla, title: nuevoTitulo } : tabla)),
    );
  };

  const eliminarTabla = (idTabla: string) => {
    if (tables.length === 1) return;
    onChange(tables.filter((tabla) => tabla.id !== idTabla));
  };

  const manejarEnvioAConclusiones = () => {
    if (!onSendToConclusions) return;
    const hallazgos: { problema: string; causaRaiz: string; accion: string }[] = [];

    tables.forEach((tabla) => {
      const filas = Array.isArray(tabla.rows) ? tabla.rows : Object.values(tabla.rows || {});
      filas.forEach((fila: any) => {
        const clavesW = Object.keys(fila || {})
          .filter((k) => /^w\d+$/.test(k))
          .sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)));

        let causaMasProfunda = "";
        for (const clave of clavesW) {
          const val = String(fila[clave] || "").trim();
          if (val) {
            causaMasProfunda = val;
            break;
          }
        }

        const problemaInicial = String(fila?.q1 || "").trim();
        const accionTexto = String(fila?.accion || "").trim();

        if (causaMasProfunda || problemaInicial) {
          hallazgos.push({
            problema: problemaInicial || tabla.title || "Desviación en 5 Porqués",
            causaRaiz: causaMasProfunda || problemaInicial,
            accion: accionTexto,
          });
        }
      });
    });

    if (hallazgos.length === 0) {
      toast.error("Completa al menos una fila en los 5 Porqués antes de enviar a Causas Raíz.");
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
            onClick={manejarEnvioAConclusiones}
            className="h-8 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
            title="Enviar causas raíz identificadas en 5 Porqués a la tabla del Paso 18"
          >
            Enviar a Causas Raíz (Paso 18) <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-8">
        {tables.map((tabla, indice) => (
          <div key={tabla.id} className="pt-4">
            <FiveWhysInteractive
              value={tabla.rows}
              onChange={(filas) => actualizarFilasTabla(tabla.id, filas)}
              title={tabla.title}
              onTitleChange={(titulo) => actualizarTituloTabla(tabla.id, titulo)}
              index={indice}
              onRemoveTable={tables.length > 1 ? () => eliminarTabla(tabla.id) : undefined}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={agregarTabla}
          className="border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-4 mr-2" />{t("pdcaPlan.paso17_five_whys_add_table")}</Button>
      </div>
    </StepCard>
  );
}
