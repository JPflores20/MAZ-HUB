import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";

interface ActionDisplayItem {
  issue: string;
  root_cause: string;
  accion: string;
  priorizar: string;
  quickWin: string;
  herramientaSdca: string;
}

interface Props {
  displayActions: ActionDisplayItem[];
}

export const ResumenActionTable: React.FC<Props> = ({ displayActions }) => {
  return (
    <Card className="border-emerald-500/30 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b bg-emerald-50/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
            Tabla Completa del Paso 18 · Plan de Acción
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
        >
          {displayActions.length} acciones registradas
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground text-left">
                <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold min-w-[150px]">Issue / Problema</th>
                <th className="py-2.5 px-3 font-semibold min-w-[180px]">Causa Raíz</th>
                <th className="py-2.5 px-3 font-semibold min-w-[240px]">Acción de Mejora</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">Priorizar</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">Quick Win</th>
                <th className="py-2.5 px-3 font-semibold min-w-[120px]">SDCA / SOP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayActions.map((act, i) => {
                const isPrioritized = act.priorizar === "SI";
                return (
                  <tr
                    key={i}
                    className={
                      isPrioritized
                        ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/80 transition-colors"
                        : "hover:bg-muted/30 transition-colors"
                    }
                  >
                    <td className="py-2.5 px-3 font-bold text-center text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{act.issue}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{act.root_cause}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{act.accion}</td>
                    <td className="py-2.5 px-3 text-center">
                      {act.priorizar === "SI" ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] py-0 px-2 font-bold">
                          SÍ
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-2 text-muted-foreground"
                        >
                          NO
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {act.quickWin === "SI" ? (
                        <Badge
                          variant="secondary"
                          className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 text-[10px] py-0 px-2 font-medium"
                        >
                          Quick Win
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{act.herramientaSdca}</td>
                  </tr>
                );
              })}
              {displayActions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay acciones registradas en el Paso 18.
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
