import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import type { FiveWhysTableData } from "@/data/pdca";
import { FiveWhysInteractive } from "./five-whys-interactive";

interface PropiedadesFiveWhysSection {
  tables: FiveWhysTableData[];
  onChange: (tablas: FiveWhysTableData[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export function FiveWhysSection({
  tables,
  onChange,
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

  return (
    <StepCard
      className="overflow-hidden"
      title="PASO 17: 5 WHY'S"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
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
