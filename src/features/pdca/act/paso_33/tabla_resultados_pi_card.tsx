/**
 * @fileoverview Tarjeta derecha de Resultados Finales con listado dinámico de Indicadores de Proceso (PIs).
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ResultadosFinalesData } from "@/domain/models/pdca";

type FilaPiResultados = NonNullable<ResultadosFinalesData["piRows"]>[number];

interface PropiedadesResultadosPi {
  filas_pi: FilaPiResultados[];
  al_agregar_fila: () => void;
  al_actualizar_fila: (fila_id: string, campo: keyof FilaPiResultados, valor: string) => void;
  al_eliminar_fila: (fila_id: string) => void;
}

/**
 * Permite capturar múltiples PIs evaluados al cierre del proyecto junto con su porcentaje de mejora.
 */
export const TablaResultadosPiCard: React.FC<PropiedadesResultadosPi> = ({
  filas_pi,
  al_agregar_fila,
  al_actualizar_fila,
  al_eliminar_fila,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border border-[#cc0000] rounded-sm overflow-hidden flex flex-col h-full relative">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#cc0000] text-white">
            <tr>
              <th className="font-bold p-2 border-r border-white/20 text-center uppercase">PI</th>
              <th className="font-bold p-2 border-r border-white/20 text-center uppercase">
                {translate("pdcaAct.deUpper")}
              </th>
              <th className="font-bold p-2 border-r border-white/20 text-center uppercase">
                {translate("pdcaAct.aUpper")}
              </th>
              <th className="font-bold p-2 border-r border-white/20 text-center uppercase">
                {translate("pdcaAct.verdeEsUpper")}
              </th>
              <th className="font-bold p-2 text-center uppercase">
                {translate("pdcaAct.pctMejoraUpper")}
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filas_pi.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-muted-foreground border-b border-[#cc0000]">
                  {translate("pdcaAct.noPiRegistrados")}
                </td>
              </tr>
            )}
            {filas_pi.map((fila_pi) => (
              <tr key={fila_pi.id} className="border-b border-[#cc0000]">
                {(["pi", "de", "a"] as const).map((campo) => (
                  <td key={campo} className="p-0 border-r border-[#cc0000]">
                    <Input
                      value={fila_pi[campo]}
                      onChange={(evento) => al_actualizar_fila(fila_pi.id, campo, evento.target.value)}
                      className="border-0 shadow-none h-8 rounded-none text-center"
                    />
                  </td>
                ))}
                <td className="p-0 border-r border-[#cc0000]">
                  <Select
                    value={fila_pi.verdeEs || "-"}
                    onValueChange={(opcion) =>
                      al_actualizar_fila(fila_pi.id, "verdeEs", opcion === "-" ? "" : opcion)
                    }
                  >
                    <SelectTrigger className="w-full h-8 rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Más alto">{translate("pdcaAct.masAlto")}</SelectItem>
                      <SelectItem value="Lower">{translate("pdcaAct.masBajo")}</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-0 bg-green-500/10 dark:bg-green-900/20">
                  <Input
                    value={fila_pi.mejoraPct}
                    onChange={(evento) => al_actualizar_fila(fila_pi.id, "mejoraPct", evento.target.value)}
                    className="border-0 shadow-none h-8 rounded-none text-center bg-transparent font-bold text-green-700"
                    placeholder="%"
                  />
                </td>
                <td className="p-0 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => al_eliminar_fila(fila_pi.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={al_agregar_fila}
        className="w-full rounded-none h-8 text-xs text-[#cc0000] hover:bg-[#cc0000]/10"
      >
        <Plus className="size-3 mr-2" /> {translate("pdcaAct.agregarPi")}
      </Button>
    </div>
  );
};
