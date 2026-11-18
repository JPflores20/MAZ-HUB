/**
 * @fileoverview Tabla editable de períodos (Target vs. Actual) para alimentar la serie temporal del KPI.
 */
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export interface ElementoSerieTemporal {
  mes: string;
  target: number;
  actual: number | null;
}

interface PropiedadesTablaSeries {
  datos_series: ElementoSerieTemporal[];
  meta_ytd: number;
  actual_ytd: number;
  formatear_valor: (valor: number | null | undefined) => string;
  al_actualizar_mes: (indice_fila: number, nuevo_mes: string) => void;
  al_actualizar_meta: (indice_fila: number, nuevo_valor: string) => void;
  al_actualizar_actual: (indice_fila: number, nuevo_valor: string) => void;
  al_agregar_fila: () => void;
  al_eliminar_fila: (indice_fila: number) => void;
}

/**
 * Muestra filas mensuales/semanales editables junto con los promedios calculados YTD.
 */
export function TablaSeries({
  datos_series,
  meta_ytd,
  actual_ytd,
  formatear_valor,
  al_actualizar_mes,
  al_actualizar_meta,
  al_actualizar_actual,
  al_agregar_fila,
  al_eliminar_fila,
}: PropiedadesTablaSeries) {
  const { t: translate } = useTranslation();

  return (
    <div className="w-full xl:w-[40%] overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">
              {translate("pdcaPlan.dynamic.perOdo")}
            </th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">
              {translate("pdcaPlan.dynamic.meta")}
            </th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">
              {translate("pdcaPlan.dynamic.actual")}
            </th>
            <th className="p-1 w-[10%]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                onClick={al_agregar_fila}
              >
                <Plus className="size-3" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {datos_series.map((serie_item, indice_fila) => (
            <tr key={`${serie_item.mes}-${indice_fila}`} className="border-b border-border/40 group">
              <td className="border-r border-border/40 p-0 font-semibold bg-[#E2E2E2] dark:bg-secondary/30">
                <Input
                  value={serie_item.mes}
                  onChange={(evento) => al_actualizar_mes(indice_fila, evento.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={serie_item.target || ""}
                  onChange={(evento) => al_actualizar_meta(indice_fila, evento.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={serie_item.actual ?? ""}
                  onChange={(evento) => al_actualizar_actual(indice_fila, evento.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="p-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => al_eliminar_fila(indice_fila)}
                >
                  <X className="size-3" />
                </Button>
              </td>
            </tr>
          ))}
          <tr className="border-b border-border/40">
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              {translate("pdcaPlan.dynamic.ytdTarget")}
            </td>
            <td className="border-r border-border/40 p-2 font-bold font-mono text-[#0078D7]">
              {formatear_valor(meta_ytd)}
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10" />
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10" />
          </tr>
          <tr>
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              {translate("pdcaPlan.dynamic.ytdActual")}
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10" />
            <td className="border-r border-border/40 p-2 font-bold font-mono text-muted-foreground">
              {formatear_valor(actual_ytd)}
            </td>
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
