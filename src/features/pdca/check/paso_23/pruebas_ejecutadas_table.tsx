/**
 * @fileoverview Tabla de seguimiento de pruebas ejecutadas y validación experimental (Paso 24 CHECK).
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { StepCard } from "@/shared/ui/step_card";
import type { PruebaEjecutadaItem } from "@/domain/pdca";
import { PruebasEvidenciaGrid } from "./pruebas_evidencia_grid";

interface PropiedadesPruebasEjecutadas {
  items: PruebaEjecutadaItem[];
  onChange: (nuevas_pruebas: PruebaEjecutadaItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite registrar pruebas de campo/piloto, su resultado vs expectativa, estado y evidencia adjunta.
 */
export const PruebasEjecutadasTable: React.FC<PropiedadesPruebasEjecutadas> = ({
  items: pruebas_registradas,
  onChange: al_cambiar_pruebas,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}) => {
  const { t: translate } = useTranslation();

  const agregar_prueba = () => {
    const nueva_prueba: PruebaEjecutadaItem = {
      id: crypto.randomUUID(),
      prueba: "",
      fecha: "",
      resultado: "",
      estado: "",
      evidencia: "",
    };
    al_cambiar_pruebas([...(pruebas_registradas || []), nueva_prueba]);
  };

  const actualizar_campo = (
    prueba_id: string,
    campo: keyof PruebaEjecutadaItem,
    valor: string,
  ) => {
    al_cambiar_pruebas(
      (pruebas_registradas || []).map((prueba_actual) =>
        prueba_actual.id === prueba_id ? { ...prueba_actual, [campo]: valor } : prueba_actual,
      ),
    );
  };

  const eliminar_prueba = (prueba_id: string) => {
    al_cambiar_pruebas((pruebas_registradas || []).filter((prueba_actual) => prueba_actual.id !== prueba_id));
  };

  return (
    <StepCard
      title={translate("pdcaTables.executedTests.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={agregar_prueba} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {translate("pdcaTables.executedTests.addTest")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.executedTests.testAction")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-36">
                  {translate("pdcaTables.executedTests.date")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaTables.executedTests.expectedVsActual")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-32">
                  {translate("pdcaTables.executedTests.status")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!pruebas_registradas || pruebas_registradas.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {translate("pdcaTables.executedTests.noTests")}
                  </TableCell>
                </TableRow>
              )}
              {pruebas_registradas?.map((prueba_actual) => (
                <TableRow key={prueba_actual.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={prueba_actual.prueba}
                      onChange={(evento) => actualizar_campo(prueba_actual.id, "prueba", evento.target.value)}
                      placeholder={translate("pdcaTables.executedTests.placeholders.description")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      type="date"
                      value={prueba_actual.fecha}
                      onChange={(evento) => actualizar_campo(prueba_actual.id, "fecha", evento.target.value)}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={prueba_actual.resultado}
                      onChange={(evento) => actualizar_campo(prueba_actual.id, "resultado", evento.target.value)}
                      placeholder={translate("pdcaTables.executedTests.placeholders.result")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Select
                      value={prueba_actual.estado}
                      onValueChange={(estado_seleccionado) =>
                        actualizar_campo(prueba_actual.id, "estado", estado_seleccionado)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs shadow-none">
                        <SelectValue placeholder={translate("pdcaTables.executedTests.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Exitoso">
                          {translate("pdcaTables.executedTests.statusOptions.successful")}
                        </SelectItem>
                        <SelectItem value="Fallido">
                          {translate("pdcaTables.executedTests.statusOptions.failed")}
                        </SelectItem>
                        <SelectItem value="Pendiente">
                          {translate("pdcaTables.executedTests.statusOptions.pending")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                      onClick={() => eliminar_prueba(prueba_actual.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <PruebasEvidenciaGrid
          pruebas={pruebas_registradas || []}
          al_actualizar_evidencia={(prueba_id, url_evidencia) =>
            actualizar_campo(prueba_id, "evidencia", url_evidencia)
          }
        />
      </div>
    </StepCard>
  );
};
