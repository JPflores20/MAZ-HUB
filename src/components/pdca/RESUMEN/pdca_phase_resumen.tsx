import React from "react";
import type {
  DefinicionMeta,
  VpoCheckpointItem,
  ParetoItem,
  ImpactMatrixRow,
  ActionItem,
} from "@/data/pdca";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdcaPdfDocument from "./pdca-pdf-document";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumenMetricsCards } from "./components/resumen-metrics-cards";
import { ResumenCharts } from "./components/resumen-charts";
import { ResumenActionTable } from "./components/resumen-action-table";
import { ResumenDetailsAccordion } from "./components/resumen-details-accordion";

interface PhaseResumenProps {
  pdca_title?: string;
  document_identifier?: string;
  goal_definition: DefinicionMeta | undefined;
  vpo_checkpoints: VpoCheckpointItem[] | undefined;
  pareto_data_map: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_data_map: Record<string, ParetoItem[]> | undefined;
  impact_matrix: ImpactMatrixRow[] | undefined;
  final_time_series_data: { mes: string; target: number; actual: number | null }[] | undefined;
  progreso: number;
  action_items?: ActionItem[] | undefined;
}

/**
 * Resumen del PDCA.
 * Muestra KPIs, estado de avance, métricas, tabla de acciones e información base de forma consolidada.
 */
export const PdcaPhaseResumen: React.FC<PhaseResumenProps> = ({
  pdca_title,
  document_identifier,
  goal_definition,
  vpo_checkpoints,
  pareto_data_map,
  nuevo_pareto_data_map,
  impact_matrix,
  final_time_series_data,
  progreso,
  action_items,
}) => {
  const meta = goal_definition || {
    kpi: "",
    pis: "",
    desdeValor: "",
    aValor: "",
    unidadMedida: "",
  };
  const vpoChecks = vpo_checkpoints || [];
  const initialParetoRoot = pareto_data_map?.["root"] || [];
  const newParetoRoot = nuevo_pareto_data_map?.["root"] || [];
  const matrix = impact_matrix || [];

  // YTD Jan-Dec time series from Paso 26 / Paso 7
  const timeSeries = final_time_series_data || [];

  const yesCount = vpoChecks.filter((c) => c.status === "YES").length;
  const noCount = vpoChecks.filter((c) => c.status === "NO").length;
  const totalValid = vpoChecks.filter((c) => c.status !== "N/A").length;

  const kpiLabel = meta.kpi || "-";
  const desdeVal = (meta as any).desde_valor || meta.desdeValor || "-";
  const aVal = (meta as any).a_valor || meta.aValor || "-";
  const unidad = (meta as any).unidad_medida || meta.unidadMedida || "";

  // Combine actions from impact_matrix and action_items
  const displayActions =
    Array.isArray(action_items) && action_items.length > 0
      ? action_items.map((act) => ({
          issue: act.tema || act.what || "-",
          root_cause: act.causaRaiz || act.causaRaiz2 || "-",
          accion: act.accion || act.accion2 || act.what || "-",
          priorizar: act.priorizar || "NO",
          quickWin: act.quickWin || "NO",
          herramientaSdca: act.herramientaSdca || "-",
        }))
      : matrix.map((m) => ({
          issue: m.issue || "-",
          root_cause: m.root_cause || m.rootCause || "-",
          accion: m.accion || "-",
          priorizar: m.priorizar || "NO",
          quickWin: "NO",
          herramientaSdca: "-",
        }));

  const prioritizedActionsCount = displayActions.filter((a) => a.priorizar === "SI").length;

  // Calculate GAP if numeric
  let gapText = "-";
  const numDesde = parseFloat(desdeVal);
  const numA = parseFloat(aVal);
  if (!isNaN(numDesde) && !isNaN(numA)) {
    const diff = +(numA - numDesde).toFixed(2);
    gapText = `${diff > 0 ? "+" : ""}${diff} ${unidad}`.trim();
  }

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-5 pb-6">
      {/* ── BOTÓN EXPORTAR A PDF ── */}
      <div className="flex justify-end">
        {isClient && (
          <PDFDownloadLink
            document={
              <PdcaPdfDocument
                pdca_title={pdca_title}
                document_identifier={document_identifier}
                goal_definition={goal_definition}
                vpo_checkpoints={vpo_checkpoints}
                impact_matrix={impact_matrix}
                action_items={action_items}
                progreso={progreso}
              />
            }
            fileName={`PDCA_${document_identifier || "Reporte"}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs">
                <Download className="size-4" />
                {loading ? "Generando PDF..." : "Descargar PDF Ejecutivo"}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* ── FILA 1: Métricas Principales ── */}
      <ResumenMetricsCards
        kpiLabel={kpiLabel}
        desdeVal={desdeVal}
        aVal={aVal}
        unidad={unidad}
        gapText={gapText}
        progreso={progreso}
        yesCount={yesCount}
        totalValid={totalValid}
        noCount={noCount}
        prioritizedActionsCount={prioritizedActionsCount}
        totalActionsCount={displayActions.length}
      />

      {/* ── FILA 2: Gráficos y Visuales ── */}
      <ResumenCharts
        timeSeries={timeSeries}
        initialParetoRoot={initialParetoRoot}
        newParetoRoot={newParetoRoot}
      />

      {/* ── FILA 3: Tabla Completa del Paso 18 ── */}
      <ResumenActionTable displayActions={displayActions} />

      {/* ── SECCIÓN ADICIONAL: Paso 1 & Paso 2 ── */}
      <ResumenDetailsAccordion
        meta={meta}
        desdeVal={desdeVal}
        aVal={aVal}
        unidad={unidad}
        vpoChecks={vpoChecks}
      />
    </div>
  );
};
