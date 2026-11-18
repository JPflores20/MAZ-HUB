/**
 * @fileoverview Tabla consolidada de acciones de mejora dentro del Resumen Ejecutivo del PDCA.
 */
import React from "react";
import { ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export interface AccionResumenDisplay {
  issue: string;
  root_cause: string;
  accion: string;
  priorizar: string;
  quick_win: string;
  herramienta_sdca: string;
}

interface PropiedadesTablaAccionesResumen {
  display_actions: AccionResumenDisplay[];
}

/**
 * Presenta las acciones registradas con indicadores visuales de priorización, Quick Win y soporte SDCA.
 */
export const ResumenActionTable: React.FC<PropiedadesTablaAccionesResumen> = ({
  display_actions,
}) => {
  const { t: translate } = useTranslation();

  return (
    <Card className="border-emerald-500/30 shadow-sm overflow-hidden print:border print:shadow-none">
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b bg-emerald-50/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
            {translate("pdcaResumen.step18TableTitle", "Plan de Acción")}
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
        >
          {display_actions.length} {translate("pdcaResumen.actionsRegistered")}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground text-left">
                <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold min-w-[150px]">
                  {translate("pdcaResumen.issueProblem")}
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[180px]">
                  {translate("pdcaResumen.rootCause")}
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[240px]">
                  {translate("pdcaResumen.improvementAction")}
                </th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">
                  {translate("pdcaResumen.prioritize")}
                </th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">
                  {translate("pdcaResumen.quickWin")}
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[120px]">
                  {translate("pdcaResumen.sdcaSop")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {display_actions.map((accion_item, indice_fila) => {
                const esta_priorizada = accion_item.priorizar === "SI";
                return (
                  <tr
                    key={`${accion_item.issue}-${indice_fila}`}
                    className={`print:break-inside-avoid ${
                      esta_priorizada
                        ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/80 transition-colors"
                        : "hover:bg-muted/30 transition-colors"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-center text-muted-foreground">
                      {indice_fila + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{accion_item.issue}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{accion_item.root_cause}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{accion_item.accion}</td>
                    <td className="py-2.5 px-3 text-center">
                      {esta_priorizada ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] py-0 px-2 font-bold">
                          {translate("pdcaResumen.yes")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 text-muted-foreground">
                          {translate("pdcaResumen.no")}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {accion_item.quick_win === "SI" ? (
                        <Badge
                          variant="secondary"
                          className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 text-[10px] py-0 px-2 font-medium"
                        >
                          {translate("pdcaResumen.quickWin")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {accion_item.herramienta_sdca}
                    </td>
                  </tr>
                );
              })}
              {display_actions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {translate("pdcaResumen.noActionsRegisteredStep18", "No hay acciones registradas.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
