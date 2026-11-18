/**
 * @fileoverview Tab 2 table tracking overdue/in-process debtors and completion rates per owner.
 */

import type { ResumenDeudorResponsable } from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface PropiedadesTabDeudores {
  lista_deudores: ResumenDeudorResponsable[];
}

/** Renders the per-owner compliance, pending debtor count, closure rate, and average IAL score. */
export function TabDeudoresTable({ lista_deudores }: PropiedadesTabDeudores) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold">
              Control de Deudores y Cumplimiento por Responsable
            </CardTitle>
            <CardDescription>
              Réplica dinámica de la pestaña &quot;Deudores&quot; y &quot;Análisis de Usabilidad&quot;
              del Excel: muestra quiénes tienen análisis en proceso y su calificación promedio de
              calidad.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            {lista_deudores.length} responsables registrados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto max-h-[540px]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#0a1428] text-white sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 text-left font-bold text-xs uppercase">#</th>
                <th className="py-2.5 px-3 text-left font-bold text-xs uppercase">Responsable</th>
                <th className="py-2.5 px-3 text-left font-bold text-xs uppercase">Área</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">5W</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">RDA / PDCA</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">Completos</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase bg-amber-600/90">
                  En Proceso (Deudor)
                </th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">Total General</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">% Cierre</th>
                <th className="py-2.5 px-3 text-center font-bold text-xs uppercase">
                  Calificación IAL Prom.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lista_deudores.map((fila_deudor, indice) => (
                <tr key={fila_deudor.nombre_responsable} className="hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3 text-xs text-muted-foreground font-mono">
                    {indice + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-xs">
                    {fila_deudor.nombre_responsable}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {fila_deudor.area_operativa}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-xs">
                    {fila_deudor.conteo_5w}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-xs">
                    {fila_deudor.conteo_rda_pdca}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600 text-xs">
                    {fila_deudor.total_completos}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {fila_deudor.total_en_proceso > 0 ? (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40 font-bold">
                        {fila_deudor.total_en_proceso} pendiente
                        {fila_deudor.total_en_proceso > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0 (Al día)</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-xs">
                    {fila_deudor.total_asignados}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${
                            fila_deudor.porcentaje_cierre >= 80
                              ? "bg-emerald-500"
                              : fila_deudor.porcentaje_cierre >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${fila_deudor.porcentaje_cierre}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">
                        {fila_deudor.porcentaje_cierre}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {fila_deudor.promedio_calificacion !== null ? (
                      <Badge
                        variant="outline"
                        className={
                          fila_deudor.promedio_calificacion >= 85
                            ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                            : fila_deudor.promedio_calificacion >= 70
                              ? "border-blue-500 text-blue-700 dark:text-blue-400 font-bold"
                              : "border-rose-500 text-rose-700 dark:text-rose-400 font-bold"
                        }
                      >
                        {fila_deudor.promedio_calificacion}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin evaluar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
