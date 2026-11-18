/**
 * @fileoverview Vista de Resumen Ejecutivo One-Pager del proyecto PDCA con modo presentación e impresión PDF.
 */
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type {
  ActionItem,
  DefinicionMeta,
  ImpactMatrixRow,
  ParetoItem,
  VpoCheckpointItem,
} from "@/domain/pdca";
import type { DatosCorrelacionSabor } from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";
import { ResumenMetricsCards } from "./resumen_metrics_cards";
import { ResumenCharts } from "./resumen_charts";
import { ResumenActionTable } from "./resumen_action_table";
import { ResumenDetailsAccordion } from "./resumen_details_accordion";
import { ResumenPrivacyDisclaimer } from "./resumen_privacy_disclaimer";
import {
  ResumenActionToolbar,
  ResumenCorporateAndTeamBanner,
} from "./resumen_print_header";
import {
  META_DEFECTO_RESUMEN,
  construir_acciones_resumen,
  extraer_datos_pareto_resumen,
  resolver_metricas_meta_resumen,
} from "./resumen_data_helpers";

export { extraer_datos_pareto_resumen };

interface PropiedadesFaseResumen {
  pdca_title?: string | undefined;
  document_identifier?: string | undefined;
  goal_definition: DefinicionMeta | undefined;
  vpo_checkpoints: VpoCheckpointItem[] | undefined;
  pareto_data_map: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_data_map: Record<string, ParetoItem[]> | undefined;
  impact_matrix: ImpactMatrixRow[] | undefined;
  final_time_series_data: { mes: string; target: number; actual: number | null }[] | undefined;
  progreso: number;
  action_items?: ActionItem[] | undefined;
  assigned_users?: { name: string; email: string }[] | undefined;
  flavor_correlation_data?: DatosCorrelacionSabor | null | undefined;
  nueva_correlacion_data?: DatosCorrelacionSabor | null | undefined;
  has_flavor_correlation?: boolean | undefined;
  has_nueva_correlacion?: boolean | undefined;
  ishikawa_causes?: Record<string, { text?: string }[]> | undefined;
  five_whys_tables?: unknown[] | undefined;
  conclusiones_causa_raiz?: unknown[] | undefined;
}

/**
 * Consolida KPI, gráficas antes/después, responsables y plan de acción con exportación PDF One-Pager.
 */
export const PdcaPhaseResumen: React.FC<PropiedadesFaseResumen> = ({
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
  assigned_users,
  flavor_correlation_data,
  nueva_correlacion_data,
  has_flavor_correlation,
  has_nueva_correlacion,
}) => {
  const referencia_impresion = useRef<HTMLDivElement>(null);
  const [modo_presentacion, set_modo_presentacion] = useState(false);

  const manejar_descarga_pdf = useReactToPrint({
    contentRef: referencia_impresion,
    documentTitle: `PDCA_${(document_identifier || pdca_title || "Reporte").replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    pageStyle: `
      @page { size: landscape; margin: 8mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      @media print {
        .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
      }
    `,
  });

  const meta = goal_definition || META_DEFECTO_RESUMEN;
  const checks_vpo = vpo_checkpoints || [];
  const pareto_inicial = extraer_datos_pareto_resumen(pareto_data_map);
  const pareto_posterior = extraer_datos_pareto_resumen(nuevo_pareto_data_map);
  const display_actions = construir_acciones_resumen(action_items, impact_matrix);
  const { kpi_label, desde_val, a_val, unidad, gap_text } = resolver_metricas_meta_resumen(meta);

  const conteo_si = checks_vpo.filter((check) => check.status === "YES").length;
  const conteo_no = checks_vpo.filter((check) => check.status === "NO").length;
  const total_valido = checks_vpo.filter((check) => check.status !== "N/A").length;
  const acciones_priorizadas = display_actions.filter((accion) => accion.priorizar === "SI").length;

  return (
    <div
      className={
        modo_presentacion
          ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6 sm:p-10 space-y-5"
          : "space-y-5 pb-6"
      }
    >
      <ResumenActionToolbar
        modo_presentacion={modo_presentacion}
        al_alternar_presentacion={() => set_modo_presentacion((activo) => !activo)}
        al_exportar_pdf={manejar_descarga_pdf}
        pdca_title={pdca_title}
      />

      <div ref={referencia_impresion} className="space-y-5 p-1 bg-background text-foreground print:p-0 print:space-y-4">
        <div className="print:break-inside-avoid">
          <ResumenMetricsCards
            kpi_label={kpi_label}
            desde_val={desde_val}
            a_val={a_val}
            unidad={unidad}
            gap_text={gap_text}
            progreso={progreso}
            yes_count={conteo_si}
            total_valid={total_valido}
            no_count={conteo_no}
            prioritized_actions_count={acciones_priorizadas}
            total_actions_count={display_actions.length}
          />
        </div>

        <ResumenCorporateAndTeamBanner
          pdca_title={pdca_title}
          document_identifier={document_identifier}
          assigned_users={assigned_users}
        />

        <div className="print:break-inside-avoid">
          <ResumenCharts
            time_series={final_time_series_data || []}
            initial_pareto_root={pareto_inicial}
            new_pareto_root={pareto_posterior}
            initial_correlation={flavor_correlation_data}
            new_correlation={nueva_correlacion_data}
            show_correlation_comparison={Boolean(has_flavor_correlation || has_nueva_correlacion)}
          />
        </div>

        <ResumenActionTable display_actions={display_actions} />

        <div className="print:break-inside-avoid">
          <ResumenDetailsAccordion
            meta={meta}
            desde_val={desde_val}
            a_val={a_val}
            unidad={unidad}
            vpo_checks={checks_vpo}
          />
        </div>

        <ResumenPrivacyDisclaimer document_identifier={document_identifier} />
      </div>
    </div>
  );
};
