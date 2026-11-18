/**
 * @fileoverview Paso 6 / 28 del PDCA: Matriz tabular de Análisis de Riesgos y cálculo de RPN.
 */
import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { StepCard } from "@/shared/ui/step_card";
import type { AnalisisRiesgoItem } from "@/domain/pdca";
import { AnalisisRiesgosRow } from "./analisis_riesgos_row";

interface PropiedadesTablaAnalisisRiesgos {
  items: AnalisisRiesgoItem[];
  onChange: (registros: AnalisisRiesgoItem[]) => void;
  title: string;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Orquesta la matriz de identificación, calificación (Probabilidad x Impacto x Prioridad) y mitigación de riesgos.
 */
export const AnalisisRiesgosTable: React.FC<PropiedadesTablaAnalisisRiesgos> = ({
  items,
  onChange,
  title,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const { t: translate } = useTranslation();

  const agregar_riesgo = () => {
    const nuevo_riesgo: AnalisisRiesgoItem = {
      id: crypto.randomUUID(),
      riesgo: "",
      tipo_impacto: "",
      probabilidad: "",
      impacto: "",
      prioridad: "",
      mitigacion: "",
      responsable: "",
      fecha_limite: "",
    };
    onChange([...(items || []), nuevo_riesgo]);
  };

  const actualizar_campo = (
    riesgo_id: string,
    campo: keyof AnalisisRiesgoItem,
    valor: string,
  ) => {
    onChange(
      items.map((riesgo_actual) =>
        riesgo_actual.id === riesgo_id
          ? { ...riesgo_actual, [campo]: valor }
          : riesgo_actual,
      ),
    );
  };

  const eliminar_riesgo = (riesgo_id: string) => {
    onChange(items.filter((riesgo_actual) => riesgo_actual.id !== riesgo_id));
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={agregar_riesgo} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {translate("pdcaPlan.dynamic.agregarRiesgo")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[1000px] text-[11px]">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead
                  rowSpan={2}
                  className="font-bold text-white text-center w-10 border-r border-white/40"
                >
                  {translate("pdcaPlan.dynamic.noDeRiesgo")}
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="font-bold text-white text-center min-w-[200px] border-r border-white/40"
                >
                  {translate("pdcaPlan.dynamic.descripciNDelRiesgo")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-28 border-r border-white/40 border-b border-white/40">
                  {translate("pdcaPlan.dynamic.tipoDeImpacto")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">
                  {translate("pdcaPlan.dynamic.probabilidad")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">
                  {translate("pdcaPlan.dynamic.impacto")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">
                  {translate("pdcaPlan.dynamic.prioridad")}
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="font-bold text-white text-center w-24 border-r border-white/40"
                >
                  {translate("pdcaPlan.dynamic.rpn")}
                  <br />
                  <span className="text-[9px] font-normal">
                    {translate("pdcaPlan.dynamic.probabilidadXImpactoXPrioridad")}
                  </span>
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="font-bold text-white text-center border-b border-white/40"
                >
                  {translate("pdcaPlan.dynamic.respuestaAlRiesgo")}
                </TableHead>
                <TableHead rowSpan={2} className="w-10 border-l border-white/40" />
              </TableRow>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {`${translate("pdcaPlan.dynamic.alcance")}\n${translate("pdcaPlan.dynamic.costo")}\n${translate("pdcaPlan.dynamic.tiempo")}`}
                </TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {`${translate("pdcaPlan.dynamic.1Nada")}\n${translate("pdcaPlan.dynamic.2Bajo")}\n${translate("pdcaPlan.dynamic.3Medio")}\n${translate("pdcaPlan.dynamic.4Alto")}`}
                </TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {`${translate("pdcaPlan.dynamic.1Nada")}\n${translate("pdcaPlan.dynamic.2Bajo")}\n${translate("pdcaPlan.dynamic.3Moderado")}\n${translate("pdcaPlan.dynamic.4Alto")}`}
                </TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {`${translate("pdcaPlan.dynamic.1Nada")}\n${translate("pdcaPlan.dynamic.2Bajo")}\n${translate("pdcaPlan.dynamic.3Medio")}\n${translate("pdcaPlan.dynamic.4Alto")}`}
                </TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {`${translate("pdcaPlan.dynamic.aceptar")}\n${translate("pdcaPlan.dynamic.evitar")}\n${translate("pdcaPlan.dynamic.mitigar")}`}
                </TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/40">
                  {translate("pdcaPlan.dynamic.responsable2")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaPlan.dynamic.fechaLMite2")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                    {translate("pdcaPlan.dynamic.noHayRiesgosIdentificados")}
                  </TableCell>
                </TableRow>
              )}
              {items?.map((riesgo_item, indice_fila) => (
                <AnalisisRiesgosRow
                  key={riesgo_item.id}
                  registro_riesgo={riesgo_item}
                  indice_fila={indice_fila}
                  al_actualizar_campo={actualizar_campo}
                  al_eliminar={eliminar_riesgo}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
