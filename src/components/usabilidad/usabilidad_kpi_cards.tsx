/**
 * usabilidad_kpi_cards.tsx
 * Tarjetas de indicadores clave (KPIs) para el módulo de Usabilidad de Herramientas:
 * Total de análisis, Completados, En proceso (Deudores) y Calificación IAL Promedio.
 */
import { Award, BarChart3, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EstadisticasKpiUsabilidad } from "@/data/usabilidad/usabilidad_types";

interface PropiedadesKpiUsabilidad {
  estadisticas_kpi: EstadisticasKpiUsabilidad;
  cargando_excel_base: boolean;
}

export function UsabilidadKpiCards({
  estadisticas_kpi,
  cargando_excel_base,
}: PropiedadesKpiUsabilidad) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-blue-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Total Análisis de Herramientas
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {cargando_excel_base
                ? "..."
                : estadisticas_kpi.total_registros.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[11px]">
                5W: {estadisticas_kpi.conteo_5w}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                RDA: {estadisticas_kpi.conteo_rda}
              </Badge>
              {estadisticas_kpi.conteo_pdca > 0 && (
                <Badge variant="secondary" className="text-[11px]">
                  PDCA: {estadisticas_kpi.conteo_pdca}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
            <BarChart3 className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Análisis Completados
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {estadisticas_kpi.conteo_completos.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-muted-foreground">
                ({estadisticas_kpi.porcentaje_cierre}%)
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Cerrados con herramienta en ciclo SDCA
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
              En Proceso (Deudores)
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {estadisticas_kpi.conteo_en_proceso.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Pendientes de cierre en Interaction Log / RDA
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-600">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Calificación IAL Promedio
            </p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">
              {estadisticas_kpi.promedio_calidad_ial}%
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Sobre {estadisticas_kpi.conteo_auditados} análisis auditados (Meta ≥ 70%)
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
            <Award className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
