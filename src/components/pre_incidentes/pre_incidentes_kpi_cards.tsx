/**
 * pre_incidentes_kpi_cards.tsx
 * Tarjetas de resumen de KPIs para la Matriz de Precursores e Incidentes de Proceso:
 * Total de eventos, Precursores contenidos, Precursores en alerta (50 pts) e Incidentes (≥100 pts).
 */
import { AlertOctagon, CheckCircle2, Database, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EstadisticasSeveridad } from "@/data/usabilidad/usabilidad_types";

interface PropiedadesKpiPreIncidentes {
  estadisticas_severidad: EstadisticasSeveridad;
  cargando_excel_base: boolean;
}

export function PreIncidentesKpiCards({
  estadisticas_severidad,
  cargando_excel_base,
}: PropiedadesKpiPreIncidentes) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-blue-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Total Eventos Evaluados
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {cargando_excel_base
                ? "..."
                : estadisticas_severidad.total_eventos.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Matriz Maestra BD</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
            <Database className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Precursores (&lt; 100 pts)
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {estadisticas_severidad.total_precursores.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contenidos antes de ser Incidente
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Precursores en Alerta (50 pts)
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {estadisticas_severidad.precursores_alerta_50pts.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Con 1 criterio de 50 pts activo (ej. Recurrente)
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <ShieldAlert className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-rose-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Incidentes de Proceso (≥ 100 pts)
            </p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {estadisticas_severidad.total_incidentes.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {estadisticas_severidad.pendientes_reporte_qir} requieren envío de QIR
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
            <AlertOctagon className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
