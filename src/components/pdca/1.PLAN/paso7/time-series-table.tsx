import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ElementoSerie {
  mes: string;
  target: number;
  actual: number | null;
}

interface PropiedadesTablaSeries {
  datosSeries: ElementoSerie[];
  metaYtd: number;
  actualYtd: number;
  formatearValor: (valor: number | null | undefined) => string;
  alActualizarMes: (indice: number, nuevoValor: string) => void;
  alActualizarMeta: (indice: number, nuevoValor: string) => void;
  alActualizarActual: (indice: number, nuevoValor: string) => void;
  alAgregarFila: () => void;
  alEliminarFila: (indice: number) => void;
}

export function TablaSeries({
  datosSeries,
  metaYtd,
  actualYtd,
  formatearValor,
  alActualizarMes,
  alActualizarMeta,
  alActualizarActual,
  alAgregarFila,
  alEliminarFila,
}: PropiedadesTablaSeries) {
  return (
    <div className="w-full xl:w-[40%] overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">PERÍODO</th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">META</th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">ACTUAL</th>
            <th className="p-1 w-[10%]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                onClick={alAgregarFila}
              >
                <Plus className="size-3" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {datosSeries.map((serieItem, indiceActual) => (
            <tr key={indiceActual} className="border-b border-border/40 group">
              <td className="border-r border-border/40 p-0 font-semibold bg-[#E2E2E2] dark:bg-secondary/30">
                <Input
                  value={serieItem.mes}
                  onChange={(eventoCambioInput) => alActualizarMes(indiceActual, eventoCambioInput.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={serieItem.target || ""}
                  onChange={(eventoCambioInput) => alActualizarMeta(indiceActual, eventoCambioInput.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={serieItem.actual ?? ""}
                  onChange={(eventoCambioInput) => alActualizarActual(indiceActual, eventoCambioInput.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="p-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => alEliminarFila(indiceActual)}
                >
                  <X className="size-3" />
                </Button>
              </td>
            </tr>
          ))}
          <tr className="border-b border-border/40">
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              YTD Target
            </td>
            <td className="border-r border-border/40 p-2 font-bold font-mono text-[#0078D7]">
              {formatearValor(metaYtd)}
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
          </tr>
          <tr>
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              YTD Actual
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
            <td className="border-r border-border/40 p-2 font-bold font-mono text-muted-foreground">
              {formatearValor(actualYtd)}
            </td>
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
