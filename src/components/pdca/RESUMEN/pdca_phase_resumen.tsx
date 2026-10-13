// @ts-nocheck
import React, { useRef } from "react";
import type {
  DefinicionMeta,
  VpoCheckpointItem,
  ParetoItem,
  ImpactMatrixRow,
  ActionItem,
} from "@/data/pdca";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumenMetricsCards } from "./components/resumen-metrics-cards";
import { ResumenCharts } from "./components/resumen-charts";
import { ResumenActionTable } from "./components/resumen-action-table";
import { ResumenDetailsAccordion } from "./components/resumen-details-accordion";
import { useReactToPrint } from "react-to-print";

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
 * Incluye exportación a PDF fiel con gráficas, tarjetas, plan de acción y aviso de privacidad.
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
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PDCA_${(document_identifier || pdca_title || "Reporte").replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    pageStyle: `
      @page { size: landscape; margin: 10mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      @media print {
        .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
      }
    `,
  });

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

  return (
    <div className="space-y-5 pb-6">
      {/* ── BOTÓN EXPORTAR A PDF ── */}
      <div className="flex justify-end print:hidden">
        <Button
          onClick={handleDownloadPdf}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs shadow-sm font-semibold"
        >
          <Download className="size-4" />
          Exportar PDF
        </Button>
      </div>

      {/* ── CONTENIDO IMPRIMIBLE / PANTALLA ── */}
      <div ref={printRef} className="space-y-5 p-1 bg-background text-foreground print:p-0 print:space-y-4">
        {/* Cabecera exclusiva para la impresión */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-[#0078D7] pb-3 mb-2">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0078D7]">
              Cervecería de Zacatecas • Grupo Modelo • AB InBev
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              {pdca_title || "Reporte Resumen de Proyecto PDCA"}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Metodología de Solución de Problemas (PDCA - Plan, Do, Check, Act)
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded font-bold">
              Folio: {document_identifier || "PDCA"}
            </div>
            <div className="text-[10px] text-gray-400">
              Fecha de emisión:{" "}
              {new Date().toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* ── FILA 1: Métricas Principales ── */}
        <div className="print:break-inside-avoid">
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
        </div>

        {/* ── FILA 2: Gráficos y Visuales ── */}
        <div className="print:break-inside-avoid">
          <ResumenCharts
            timeSeries={timeSeries}
            initialParetoRoot={initialParetoRoot}
            newParetoRoot={newParetoRoot}
          />
        </div>

        {/* ── FILA 3: Tabla Completa del Plan de Acción ── */}
        <div>
          <ResumenActionTable displayActions={displayActions} />
        </div>

        {/* ── SECCIÓN ADICIONAL: Project Statement y SDCA Checklist ── */}
        <div className="print:break-inside-avoid">
          <ResumenDetailsAccordion
            meta={meta}
            desdeVal={desdeVal}
            aVal={aVal}
            unidad={unidad}
            vpoChecks={vpoChecks}
          />
        </div>

        {/* ── AVISO DE PRIVACIDAD EN ÚLTIMA HOJA (SOLO PDF) ── */}
        <div
          className="hidden print:block print:mt-0 print:pt-4"
          style={{ pageBreakBefore: "always", breakBefore: "page" }}
        >
          <div className="rounded-xl border border-slate-300 bg-slate-50 p-6 text-slate-700 shadow-sm print:shadow-none print:border-slate-400">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Cervecería de Zacatecas • Grupo Modelo • AB InBev
                </h2>
                <p className="text-xs text-slate-500">
                  Plataforma MAZ HUB — Resumen de Proyecto PDCA
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                Folio: {document_identifier || "PDCA"}
              </span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div>
                <h3 className="font-bold text-slate-800 uppercase mb-1 text-[11px] tracking-wide">
                  Aviso de Confidencialidad y Privacidad (Disclaimer)
                </h3>
                <p className="mb-2">
                  Este reporte y la información técnica u operativa contenida en el mismo son propiedad de Cervecería de Zacatecas / Grupo Modelo / AB InBev y pueden contener información privilegiada o confidencial para uso exclusivo de su destinatario o personal expresamente autorizado. Cualquier divulgación, reproducción, distribución, copia o uso no autorizado expresamente queda prohibido y puede ser ilegal de conformidad con la legislación aplicable. Si usted ha tenido acceso a este reporte por error, favor de notificar inmediatamente al remitente o administrador de la plataforma MAZ HUB y borrar el presente documento.
                </p>
                <p className="mb-2">
                  Los Datos Personales y registros operativos en nuestra posesión se encuentran protegidos y se tratan de conformidad con las legislaciones y regulaciones aplicables y nuestro Aviso de Privacidad y Políticas Corporativas, disponible en nuestra página de Internet Global:{" "}
                  <a
                    href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
                  </a>{" "}
                  y/o las específicas del país de origen de esta comunicación. Únicamente la persona autorizada por AB InBev podrá garantizar que la información aquí contenida —y la interpretación de esta misma— sea aplicable o apropiada a su situación particular. Para cualquier consulta o aclaración, puede comunicarse con nosotros utilizando nuestro sitio web global "contáctenos" o su persona de contacto autorizada de AB InBev.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h3 className="font-bold text-slate-800 uppercase mb-1 text-[11px] tracking-wide">
                  Confidentiality and Privacy Statement (Disclaimer)
                </h3>
                <p className="mb-2">
                  This document, report, and any data contained herein are the property of Cervecería de Zacatecas / Grupo Modelo / AB InBev and may contain confidential and/or privileged information intended solely for the use of the named addressee or authorized personnel. Any unauthorized review, dissemination, copying, distribution, or use is prohibited and may be illegal. If you are not the intended recipient or if you have received this document in error, please notify the sender or MAZ HUB administrator and delete this document permanently.
                </p>
                <p>
                  Personal Data and operational records in our possession are protected and treated pursuant to applicable data protection regulations and our Privacy Statement available on our global Internet website:{" "}
                  <a
                    href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
                  </a>{" "}
                  and/or the country-specific policy. Only an AB InBev authorized person in this matter can provide assurances that the information contained herein —and your interpretation of it— is applicable or appropriate to your particular situation. For any query, you may contact us using our global “contact us” website or your designated AB InBev contact person.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>Documento generado por plataforma MAZ HUB</span>
              <span>Confidencial — Uso Interno Autorizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
