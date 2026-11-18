/**
 * @fileoverview Tab 1 table displaying the Master BD Matrix of Process Precursors and Incidents.
 */

import type { RegistroAnalisis5WRda } from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { TabMatrizSeveridadRow } from "./tab_matriz_severidad_row";

interface PropiedadesTabMatrizSeveridad {
  registros_filtrados: RegistroAnalisis5WRda[];
  on_abrir_editar_severidad: (registro: RegistroAnalisis5WRda) => void;
}

/** Renders the severity matrix event list (first 150 matching records) with inline scoring trigger. */
export function TabMatrizSeveridadTable({
  registros_filtrados,
  on_abrir_editar_severidad,
}: PropiedadesTabMatrizSeveridad) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold">
              Matriz de Precursores e Incidentes de Proceso (Hoja BD)
            </CardTitle>
            <CardDescription>
              Fórmula de Severidad: Pérdida &gt;50HL (100) + Paro &gt;3h (50) +
              Destrucción/Retrabajo (50) + Recurrente (50) + Fallo Inusual (50) + Bloqueado (100) +
              Planificación (100).
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Mostrando primeros 150 de {registros_filtrados.length} eventos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto max-h-[580px]">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#0a1428] text-white sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase"># / Fecha</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Hta / KPI</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase min-w-[230px]">
                  Descripción de la Falla
                </th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">
                  Área / Proceso / Equipo
                </th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Marca / Variable</th>
                <th className="py-2.5 px-2.5 text-left font-bold uppercase">Pilares SDCA</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Puntaje Sev.</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Clasificación</th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registros_filtrados.slice(0, 150).map((registro) => (
                <TabMatrizSeveridadRow
                  key={registro.id}
                  registro={registro}
                  on_abrir_editar_severidad={on_abrir_editar_severidad}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
