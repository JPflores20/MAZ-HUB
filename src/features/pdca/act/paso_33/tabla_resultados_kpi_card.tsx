/**
 * @fileoverview Tarjeta izquierda de Resultados Finales con fecha de cierre e impacto en KPI principal.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ResultadosFinalesData } from "@/domain/models/pdca";

interface PropiedadesResultadosKpi {
  datos_resultados: ResultadosFinalesData;
  al_actualizar_datos: (cambios: Partial<ResultadosFinalesData>) => void;
  al_actualizar_kpi: (campo: keyof NonNullable<ResultadosFinalesData["kpi"]>, valor: string) => void;
}

function clase_selector_si_no(valor?: string): string {
  if (valor === "Sí") return "text-green-700 font-bold";
  if (valor === "No") return "text-red-700 dark:text-red-300 font-bold";
  return "text-slate-900 font-medium";
}

/**
 * Muestra la tabla comparativa roja del KPI principal y la valoración de mejora en PI/KPI.
 */
export const TablaResultadosKpiCard: React.FC<PropiedadesResultadosKpi> = ({
  datos_resultados,
  al_actualizar_datos,
  al_actualizar_kpi,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border border-[#cc0000] rounded-sm overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          <tr>
            <td className="bg-[#cc0000] text-white font-bold p-2 w-[40%] border-r border-[#cc0000]">
              {translate("pdcaAct.fechaFinalizacionLabel")}
            </td>
            <td className="p-0 border-b border-[#cc0000]">
              <Input
                type="date"
                value={datos_resultados.fechaFinalizacion || ""}
                onChange={(evento) => al_actualizar_datos({ fechaFinalizacion: evento.target.value })}
                className="border-0 shadow-none h-8 w-full rounded-none"
              />
            </td>
            <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">
              KPI
            </td>
            <td className="border-b border-[#cc0000] p-0 w-[25%] bg-white" />
          </tr>
          <tr>
            <td
              rowSpan={2}
              className="bg-[#cc0000] text-white font-bold p-2 text-center border-r border-[#cc0000] border-b"
            >
              {translate("pdcaAct.mejoroPi")}
            </td>
            <td rowSpan={2} className="p-0 border-b border-[#cc0000]">
              <Select
                value={datos_resultados.mejoroPI || "-"}
                onValueChange={(opcion) => al_actualizar_datos({ mejoroPI: opcion === "-" ? "" : opcion })}
              >
                <SelectTrigger
                  className={`w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full ${clase_selector_si_no(datos_resultados.mejoroPI)}`}
                >
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Sí" className="text-green-700 font-bold">
                    {translate("pdcaAct.si")}
                  </SelectItem>
                  <SelectItem value="No" className="text-red-700 dark:text-red-300 font-bold">
                    {translate("pdcaAct.no")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </td>
            <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">
              {translate("pdcaAct.de")}
            </td>
            <td className="p-0 border-b border-[#cc0000]">
              <Input
                value={datos_resultados.kpi?.de || ""}
                onChange={(evento) => al_actualizar_kpi("de", evento.target.value)}
                className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">
              {translate("pdcaAct.a")}
            </td>
            <td className="p-0 border-b border-[#cc0000]">
              <Input
                value={datos_resultados.kpi?.a || ""}
                onChange={(evento) => al_actualizar_kpi("a", evento.target.value)}
                className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center"
              />
            </td>
          </tr>
          <tr>
            <td
              rowSpan={2}
              className="bg-[#cc0000] text-white font-bold p-2 text-center border-r border-[#cc0000]"
            >
              {translate("pdcaAct.mejoroKpi")}
            </td>
            <td rowSpan={2} className="p-0">
              <Select
                value={datos_resultados.mejoroKPI || "-"}
                onValueChange={(opcion) => al_actualizar_datos({ mejoroKPI: opcion === "-" ? "" : opcion })}
              >
                <SelectTrigger
                  className={`w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full ${clase_selector_si_no(datos_resultados.mejoroKPI)}`}
                >
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Sí" className="text-green-700 font-bold">
                    {translate("pdcaAct.si")}
                  </SelectItem>
                  <SelectItem value="No" className="text-red-700 dark:text-red-300 font-bold">
                    {translate("pdcaAct.no")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </td>
            <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">
              {translate("pdcaAct.verdeEs")}
            </td>
            <td className="p-0 border-b border-[#cc0000]">
              <Select
                value={datos_resultados.kpi?.verdeEs || "-"}
                onValueChange={(opcion) => al_actualizar_kpi("verdeEs", opcion === "-" ? "" : opcion)}
              >
                <SelectTrigger className="w-full h-full min-h-[30px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">-</SelectItem>
                  <SelectItem value="Más alto">{translate("pdcaAct.masAlto")}</SelectItem>
                  <SelectItem value="Lower">{translate("pdcaAct.masBajo")}</SelectItem>
                </SelectContent>
              </Select>
            </td>
          </tr>
          <tr>
            <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-[#cc0000] text-center">
              {translate("pdcaAct.pctMejora")}
            </td>
            <td className="p-0 bg-green-500/20 dark:bg-green-900/30">
              <Input
                value={datos_resultados.kpi?.mejoraPct || ""}
                onChange={(evento) => al_actualizar_kpi("mejoraPct", evento.target.value)}
                className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center bg-transparent font-bold text-green-700"
                placeholder="%"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
