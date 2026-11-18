/**
 * @fileoverview Tabla comparativa de resultados finales del KPI principal en el cierre (Paso 34).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";
import { Table, TableBody, TableCell, TableRow } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ConclusionesKpiData } from "@/domain/pdca";

interface PropiedadesConclusionesKpi {
  datos_kpi: ConclusionesKpiData;
  al_cambiar_campo: (campo: keyof ConclusionesKpiData, valor: string) => void;
}

/**
 * Muestra la matriz ejecutiva con fecha de cierre, desempeño del KPI principal y porcentaje de mejora.
 */
export const TablaConclusionesKpi: React.FC<PropiedadesConclusionesKpi> = ({
  datos_kpi,
  al_cambiar_campo,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <Table className="text-xs">
        <TableBody>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/3">
              {translate("pdcaResumen.finishDate")}
            </TableCell>
            <TableCell className="p-0 border-r border-border w-1/3">
              <DatePicker
                date={
                  datos_kpi.fechaFinalizacion
                    ? new Date(datos_kpi.fechaFinalizacion + "T12:00:00")
                    : undefined
                }
                setDate={(fecha) =>
                  al_cambiar_campo("fechaFinalizacion", fecha ? format(fecha, "yyyy-MM-dd") : "")
                }
                className="h-10 text-xs shadow-none border-0 rounded-none w-full bg-transparent border-transparent hover:bg-transparent"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/6">
              {translate("pdcaResumen.kpi")}
            </TableCell>
            <TableCell className="p-0 w-1/6">
              <Input
                value={datos_kpi.kpiName}
                onChange={(evento) => al_cambiar_campo("kpiName", evento.target.value)}
                className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
              {translate("pdcaResumen.improvedPi")}
            </TableCell>
            <TableCell className="p-0 border-r border-border">
              <textarea
                value={datos_kpi.mejoroPi}
                onChange={(evento) => al_cambiar_campo("mejoroPi", evento.target.value)}
                className="w-full h-full min-h-[60px] resize-none text-xs p-2 focus-visible:outline-none border-0"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
              {translate("pdcaResumen.from")}
            </TableCell>
            <TableCell className="p-0">
              <Input
                value={datos_kpi.kpiDe}
                onChange={(evento) => al_cambiar_campo("kpiDe", evento.target.value)}
                className="h-full text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              rowSpan={3}
              className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center"
            >
              ¿Este pdca/ITF mejoró los {translate("pdcaResumen.kpi")}(s)?
            </TableCell>
            <TableCell rowSpan={3} className="p-0 border-r border-border">
              <textarea
                value={datos_kpi.mejoroKpi}
                onChange={(evento) => al_cambiar_campo("mejoroKpi", evento.target.value)}
                className="w-full h-full min-h-[100px] resize-none text-xs p-2 focus-visible:outline-none border-0"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              {translate("pdcaResumen.to")}
            </TableCell>
            <TableCell className="p-0">
              <Input
                value={datos_kpi.kpiA}
                onChange={(evento) => al_cambiar_campo("kpiA", evento.target.value)}
                className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              {translate("pdcaResumen.greenIs")}
            </TableCell>
            <TableCell className="p-0">
              <Select
                value={datos_kpi.kpiVerdeEs || "Más alto"}
                onValueChange={(opcion) => al_cambiar_campo("kpiVerdeEs", opcion)}
              >
                <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Más alto">{translate("pdcaResumen.higher")}</SelectItem>
                  <SelectItem value="Más bajo">{translate("pdcaResumen.lower")}</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              {translate("pdcaResumen.improvementPercent")}
            </TableCell>
            <TableCell className="p-0 bg-[#00B050]">
              <Input
                value={datos_kpi.kpiMejora}
                onChange={(evento) => al_cambiar_campo("kpiMejora", evento.target.value)}
                className="h-10 text-xs font-bold text-white shadow-none border-0 rounded-none text-center focus-visible:ring-0 bg-transparent placeholder:text-white/70"
                placeholder="%"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
