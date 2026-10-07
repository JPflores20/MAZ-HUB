import React from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConclusionesKpiData } from "@/data/pdca";

interface Props {
  datosKpi: ConclusionesKpiData;
  alCambiarCampo: (campo: keyof ConclusionesKpiData, valor: string) => void;
}

export const TablaConclusionesKpi: React.FC<Props> = ({ datosKpi, alCambiarCampo }) => {
  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <Table className="text-xs">
        <TableBody>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/3">
              Fecha de finalización:
            </TableCell>
            <TableCell className="p-0 border-r border-border w-1/3">
              <DatePicker
                date={datosKpi.fechaFinalizacion ? new Date(datosKpi.fechaFinalizacion + "T12:00:00") : undefined}
                setDate={(d) => alCambiarCampo("fechaFinalizacion", d ? format(d, "yyyy-MM-dd") : "")}
                className="h-10 text-xs shadow-none border-0 rounded-none w-full bg-transparent border-transparent hover:bg-transparent"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/6">
              KPI
            </TableCell>
            <TableCell className="p-0 w-1/6">
              <Input
                value={datosKpi.kpiName}
                onChange={(e) => alCambiarCampo("kpiName", e.target.value)}
                className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
              ¿Este pdca/ITF mejoró los PI?
            </TableCell>
            <TableCell className="p-0 border-r border-border">
              <textarea
                value={datosKpi.mejoroPi}
                onChange={(e) => alCambiarCampo("mejoroPi", e.target.value)}
                className="w-full h-full min-h-[60px] resize-none text-xs p-2 focus-visible:outline-none border-0"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
              De:
            </TableCell>
            <TableCell className="p-0">
              <Input
                value={datosKpi.kpiDe}
                onChange={(e) => alCambiarCampo("kpiDe", e.target.value)}
                className="h-full text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell rowSpan={3} className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
              ¿Este pdca/ITF mejoró los KPI(s)?
            </TableCell>
            <TableCell rowSpan={3} className="p-0 border-r border-border">
              <textarea
                value={datosKpi.mejoroKpi}
                onChange={(e) => alCambiarCampo("mejoroKpi", e.target.value)}
                className="w-full h-full min-h-[100px] resize-none text-xs p-2 focus-visible:outline-none border-0"
              />
            </TableCell>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              A:
            </TableCell>
            <TableCell className="p-0">
              <Input
                value={datosKpi.kpiA}
                onChange={(e) => alCambiarCampo("kpiA", e.target.value)}
                className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              Verde es:
            </TableCell>
            <TableCell className="p-0">
              <Select
                value={datosKpi.kpiVerdeEs || "Más alto"}
                onValueChange={(v) => alCambiarCampo("kpiVerdeEs", v)}
              >
                <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Más alto">Más alto</SelectItem>
                  <SelectItem value="Más bajo">Más bajo</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
              % de Mejora
            </TableCell>
            <TableCell className="p-0 bg-[#00B050]">
              <Input
                value={datosKpi.kpiMejora}
                onChange={(e) => alCambiarCampo("kpiMejora", e.target.value)}
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
