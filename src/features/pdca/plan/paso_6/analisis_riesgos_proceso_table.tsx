/**
 * @fileoverview Tabla complementaria de evaluación de riesgos operativos por frecuencia y responsable.
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
import { StepInstructions } from "../../components/step_instructions";

export type AnalisisRiesgoProcesoItem = {
  id: string;
  riesgo: string;
  accion: string;
  personaACargo: string;
  frecuencia: string;
};

interface PropiedadesTablaRiesgosProceso {
  items: AnalisisRiesgoProcesoItem[];
  onChange: (registros: AnalisisRiesgoProcesoItem[]) => void;
}

const CAMPOS_RIESGO_PROCESO: (keyof Omit<AnalisisRiesgoProcesoItem, "id">)[] = [
  "riesgo",
  "accion",
  "personaACargo",
  "frecuencia",
];

/**
 * Permite documentar riesgos operativos del proceso estandarizado, medidas y frecuencias de control.
 */
export const AnalisisRiesgosProcesoTable: React.FC<PropiedadesTablaRiesgosProceso> = ({
  items,
  onChange,
}) => {
  const { t: translate } = useTranslation();

  const agregar_fila = () => {
    const nuevo_riesgo: AnalisisRiesgoProcesoItem = {
      id: crypto.randomUUID(),
      riesgo: "",
      accion: "",
      personaACargo: "",
      frecuencia: "",
    };
    onChange([...(items || []), nuevo_riesgo]);
  };

  const actualizar_campo = (
    riesgo_id: string,
    campo: keyof AnalisisRiesgoProcesoItem,
    valor: string,
  ) => {
    onChange(
      (items || []).map((riesgo_actual) =>
        riesgo_actual.id === riesgo_id
          ? { ...riesgo_actual, [campo]: valor }
          : riesgo_actual,
      ),
    );
  };

  const eliminar_fila = (riesgo_id: string) => {
    onChange((items || []).filter((riesgo_actual) => riesgo_actual.id !== riesgo_id));
  };

  return (
    <div className="space-y-4">
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>{translate("pdcaPlan.dynamic.identificarTodosLosPosiblesRiesgos")}</li>
          <li>{translate("pdcaPlan.dynamic.aplicarTodosLosProcesosDe")}</li>
        </ol>
      </StepInstructions>

      <div className="flex items-center justify-end">
        <Button onClick={agregar_fila} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> {translate("pdcaPlan.dynamic.agregarFila")}
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[800px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="w-10 font-bold text-white text-center border-r border-white/20">
                #
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">
                {translate("pdcaPlan.dynamic.riesgo")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">
                {translate("pdcaPlan.dynamic.accion")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">
                {translate("pdcaPlan.dynamic.personaACargo")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">
                {translate("pdcaPlan.dynamic.frecuencia")}
              </TableHead>
              <TableHead className="w-12 border-none" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {translate("pdcaPlan.dynamic.noHayRiesgosIdentificadosAgrega")}
                </TableCell>
              </TableRow>
            )}
            {items?.map((riesgo_item, indice_fila) => (
              <TableRow key={riesgo_item.id}>
                <TableCell className="p-1.5 text-center font-bold border-r border-border">
                  {indice_fila + 1}
                </TableCell>
                {CAMPOS_RIESGO_PROCESO.map((nombre_campo) => (
                  <TableCell key={nombre_campo} className="p-1.5 border-r border-border">
                    <Input
                      value={riesgo_item[nombre_campo] || ""}
                      onChange={(evento) =>
                        actualizar_campo(riesgo_item.id, nombre_campo, evento.target.value)
                      }
                      placeholder="..."
                      className="h-8 text-xs shadow-none text-center"
                    />
                  </TableCell>
                ))}
                <TableCell className="p-1.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => eliminar_fila(riesgo_item.id)}
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
  );
};
