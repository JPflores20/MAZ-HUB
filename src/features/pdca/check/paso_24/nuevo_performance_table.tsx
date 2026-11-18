/**
 * @fileoverview Tabla comparativa del nuevo rendimiento obtenido tras ejecutar el Plan de Acción.
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { StepCard } from "@/shared/ui/step_card";
import type { NuevoPerformanceItem } from "@/domain/pdca";

interface PropiedadesNuevoPerformance {
  items: NuevoPerformanceItem[];
  onChange: (nuevos_indicadores: NuevoPerformanceItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite documentar valores base (antes), actuales (después) y porcentaje de mejora por indicador.
 */
export const NuevoPerformanceTable: React.FC<PropiedadesNuevoPerformance> = ({
  items: indicadores_rendimiento,
  onChange: al_cambiar_indicadores,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const { t: translate } = useTranslation();

  const agregar_indicador = () => {
    const nuevo_indicador: NuevoPerformanceItem = {
      id: crypto.randomUUID(),
      indicador: "",
      antes: "",
      despues: "",
      mejora: "",
    };
    al_cambiar_indicadores([...(indicadores_rendimiento || []), nuevo_indicador]);
  };

  const actualizar_campo = (
    indicador_id: string,
    campo: keyof NuevoPerformanceItem,
    nuevo_valor: string,
  ) => {
    al_cambiar_indicadores(
      indicadores_rendimiento.map((registro_actual) =>
        registro_actual.id === indicador_id
          ? { ...registro_actual, [campo]: nuevo_valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_indicador = (indicador_id: string) => {
    al_cambiar_indicadores(
      indicadores_rendimiento.filter((registro_actual) => registro_actual.id !== indicador_id),
    );
  };

  const columnas_entrada: {
    campo: keyof Omit<NuevoPerformanceItem, "id">;
    clave_placeholder: string;
  }[] = [
    { campo: "indicador", clave_placeholder: "pdcaTables.newPerformance.placeholders.indicator" },
    { campo: "antes", clave_placeholder: "pdcaTables.newPerformance.placeholders.initialValue" },
    { campo: "despues", clave_placeholder: "pdcaTables.newPerformance.placeholders.finalValue" },
    { campo: "mejora", clave_placeholder: "pdcaTables.newPerformance.placeholders.improvement" },
  ];

  return (
    <StepCard
      title={translate("pdcaTables.newPerformance.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={agregar_indicador} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {translate("pdcaTables.newPerformance.addIndicator")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.newPerformance.indicator")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.newPerformance.beforeBaseline")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.newPerformance.afterImplementation")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.newPerformance.improvement")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!indicadores_rendimiento || indicadores_rendimiento.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {translate("pdcaTables.newPerformance.noIndicators")}
                  </TableCell>
                </TableRow>
              )}
              {indicadores_rendimiento?.map((registro_actual) => (
                <TableRow key={registro_actual.id}>
                  {columnas_entrada.map(({ campo, clave_placeholder }) => (
                    <TableCell key={campo} className="p-1.5">
                      <Input
                        value={registro_actual[campo]}
                        onChange={(evento) =>
                          actualizar_campo(registro_actual.id, campo, evento.target.value)
                        }
                        placeholder={translate(clave_placeholder)}
                        className="h-8 text-xs shadow-none"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                      onClick={() => eliminar_indicador(registro_actual.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
