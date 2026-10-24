/**
 * tab_reportes_qir_cards.tsx
 * Pestaña 3 de Pre Incidentes Proceso: Tarjetas de Reportes Oficiales de Incidente de Proceso (QIR)
 * de Cuartos Fríos y Cocimientos extraídos del libro Excel 08.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumenReporteIncidente } from "@/data/usabilidad/usabilidad_types";

interface PropiedadesTabReportesQir {
  reportes_incidentes_qir: ResumenReporteIncidente[];
}

export function TabReportesQirCards({
  reportes_incidentes_qir,
}: PropiedadesTabReportesQir) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {reportes_incidentes_qir.map((reporte_qir) => (
        <Card
          key={reporte_qir.id}
          className="border-l-4 border-l-rose-600 shadow-sm"
        >
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase text-rose-600">
                  {reporte_qir.titulo_hoja} · Severidad:{" "}
                  {reporte_qir.nivel_severidad}
                </div>
                <CardTitle className="text-lg font-extrabold mt-0.5">
                  Marca: {reporte_qir.marca_afectada} — Volumen No Conforme:{" "}
                  {reporte_qir.volumen_no_conforme}
                </CardTitle>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>
                  <strong>Ocurrencia:</strong> {reporte_qir.fecha_ocurrencia}
                </div>
                <div>
                  <strong>Reporte:</strong> {reporte_qir.fecha_reporte}
                </div>
                <div>
                  <strong>Contacto:</strong> {reporte_qir.contacto_responsable}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border">
              <span className="font-bold uppercase text-muted-foreground block mb-1">
                Condición Conductora: {reporte_qir.condicion_conductora}
              </span>
              <p className="text-foreground leading-relaxed">
                {reporte_qir.detalles_incidente}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <span className="font-bold uppercase text-amber-700 dark:text-amber-400 block mb-1">
                  Causas Principales (5 Por Qué):
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {reporte_qir.causas_principales}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <span className="font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                  Acciones Tomadas para Prevenir Recurrencia:
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {reporte_qir.acciones_preventivas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
