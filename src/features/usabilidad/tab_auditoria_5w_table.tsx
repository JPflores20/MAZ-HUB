/**
 * @fileoverview Tab 3 table displaying 5W/IAL quality audit scores under the 7-criteria rubric.
 */

import { ClipboardCheck } from "lucide-react";
import { normalizar_calificacion_porcentaje } from "@/domain/calculators/usabilidad_calculators";
import type { RegistroAnalisis5WRda } from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface PropiedadesTabAuditoria5W {
  registros_filtrados: RegistroAnalisis5WRda[];
  on_abrir_modal_rubrica: (registro: RegistroAnalisis5WRda) => void;
}

/** Renders up to 150 filtered 5W/RDA records with their IAL score and audit action button. */
export function TabAuditoria5WTable({
  registros_filtrados,
  on_abrir_modal_rubrica,
}: PropiedadesTabAuditoria5W) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold">
              Evaluación de Calidad de Análisis 5W (Rúbrica Oficial de 7 Puntos - Interaction Log)
            </CardTitle>
            <CardDescription>
              Evalúa o consulta la calificación IAL de cada análisis bajo los 7 criterios VPO (cada
              criterio aporta 14.28% a la calificación total).
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Mostrando primeros 150 de {registros_filtrados.length} registros filtrados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto max-h-[560px]">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#0a1428] text-white sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Fecha / Sem</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">ID IAL / Hta</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase min-w-[240px]">
                  Descripción de la Falla
                </th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Responsable</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Área / Proceso</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Estatus</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Calificación IAL</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registros_filtrados.slice(0, 150).map((registro) => {
                const porcentaje_calif = normalizar_calificacion_porcentaje(
                  registro.calificacion_ial,
                );
                return (
                  <tr key={registro.id} className="hover:bg-muted/50">
                    <td className="py-2 px-2.5 whitespace-nowrap font-mono">
                      <div>{registro.fecha_evento}</div>
                      <span className="text-[10px] text-muted-foreground">
                        Sem {registro.semana_evento}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {registro.id_ial || "S/N"}
                      </div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {registro.tipo_herramienta}
                      </Badge>
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="font-medium line-clamp-2">{registro.descripcion_falla}</div>
                      {registro.rubrica_5w?.comentarios_mejora && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 italic">
                          💬 &quot;{registro.rubrica_5w.comentarios_mejora}&quot;
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5 font-medium">{registro.nombre_responsable}</td>
                    <td className="py-2 px-2.5">
                      <div className="font-semibold text-[11px]">{registro.area_operativa}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {registro.proceso_cervecero}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <Badge
                        variant={registro.estatus_analisis === "Completo" ? "default" : "secondary"}
                        className={
                          registro.estatus_analisis === "Completo"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }
                      >
                        {registro.estatus_analisis}
                      </Badge>
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      {porcentaje_calif !== null ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            porcentaje_calif >= 85
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : porcentaje_calif >= 70
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {porcentaje_calif}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Sin calificar</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => on_abrir_modal_rubrica(registro)}
                      >
                        <ClipboardCheck className="size-3.5 mr-1" />
                        Evaluar 7 Pts
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
