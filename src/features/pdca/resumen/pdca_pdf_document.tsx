/**
 * @fileoverview Plantilla PDF @react-pdf/renderer para el Resumen Ejecutivo y Plan de Acción del PDCA.
 */
import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type {
  ActionItem,
  DefinicionMeta,
  ImpactMatrixRow,
  ParetoItem,
  VpoCheckpointItem,
} from "@/domain/pdca";
import { estilos_pdf_pdca } from "./pdca_pdf_styles";
import { PdcaPdfDisclaimerPage } from "./pdca_pdf_disclaimer_page";
import {
  META_DEFECTO_RESUMEN,
  construir_acciones_resumen,
  resolver_metricas_meta_resumen,
} from "./resumen_data_helpers";

interface PropiedadesDocumentoPdfPdca {
  pdca_title?: string | undefined;
  document_identifier?: string | undefined;
  goal_definition?: DefinicionMeta | undefined;
  vpo_checkpoints?: VpoCheckpointItem[] | undefined;
  pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  impact_matrix?: ImpactMatrixRow[] | undefined;
  final_time_series_data?: { mes: string; target: number; actual: number | null }[] | undefined;
  progreso: number;
  action_items?: ActionItem[] | undefined;
}

/**
 * Construye el reporte PDF multipágina con indicadores KPI, matriz de acciones y página legal.
 */
export const PdcaPdfDocument: React.FC<PropiedadesDocumentoPdfPdca> = ({
  pdca_title = "Sin Título",
  document_identifier = "",
  goal_definition,
  impact_matrix,
  action_items,
  progreso,
}) => {
  const { kpi_label, desde_val, a_val, unidad, gap_text } = resolver_metricas_meta_resumen(
    goal_definition || META_DEFECTO_RESUMEN,
  );
  const display_actions = construir_acciones_resumen(action_items, impact_matrix);

  return (
    <Document>
      <Page size="A4" style={estilos_pdf_pdca.page}>
        <View style={estilos_pdf_pdca.header}>
          <Text style={estilos_pdf_pdca.corporateTitle}>Reporte Ejecutivo PDCA</Text>
          {document_identifier ? (
            <Text style={estilos_pdf_pdca.documentId}>{document_identifier}</Text>
          ) : null}
        </View>

        <View style={estilos_pdf_pdca.projectTitleContainer}>
          <Text style={estilos_pdf_pdca.projectTitle}>{pdca_title}</Text>
          <Text style={{ fontSize: 10, color: "#6b7280" }}>Progreso Actual: {progreso}%</Text>
        </View>

        <Text style={estilos_pdf_pdca.sectionTitle}>Definición de Meta (KPI)</Text>
        <View style={estilos_pdf_pdca.kpiRow}>
          <View style={estilos_pdf_pdca.kpiBox}>
            <Text style={estilos_pdf_pdca.kpiLabel}>Indicador</Text>
            <Text style={estilos_pdf_pdca.kpiValue}>{kpi_label}</Text>
          </View>
          <View style={estilos_pdf_pdca.kpiBox}>
            <Text style={estilos_pdf_pdca.kpiLabel}>Valor Inicial</Text>
            <Text style={estilos_pdf_pdca.kpiValue}>
              {desde_val} {unidad}
            </Text>
          </View>
          <View style={estilos_pdf_pdca.kpiBox}>
            <Text style={estilos_pdf_pdca.kpiLabel}>Valor Objetivo</Text>
            <Text style={estilos_pdf_pdca.kpiValue}>
              {a_val} {unidad}
            </Text>
          </View>
          <View style={estilos_pdf_pdca.kpiBox}>
            <Text style={estilos_pdf_pdca.kpiLabel}>Gap (Diferencia)</Text>
            <Text style={estilos_pdf_pdca.kpiValue}>{gap_text}</Text>
          </View>
        </View>

        <Text style={estilos_pdf_pdca.sectionTitle}>Plan de Acción (Principales Resultados)</Text>
        <View style={estilos_pdf_pdca.table}>
          <View style={estilos_pdf_pdca.tableRow}>
            <View style={[estilos_pdf_pdca.tableColHeader, estilos_pdf_pdca.tableColIssue]}>
              <Text style={estilos_pdf_pdca.tableCellHeader}>Tema / Problema</Text>
            </View>
            <View style={[estilos_pdf_pdca.tableColHeader, estilos_pdf_pdca.tableColCause]}>
              <Text style={estilos_pdf_pdca.tableCellHeader}>Causa Raíz</Text>
            </View>
            <View style={[estilos_pdf_pdca.tableColHeader, estilos_pdf_pdca.tableColAction]}>
              <Text style={estilos_pdf_pdca.tableCellHeader}>Acción de Mejora</Text>
            </View>
            <View style={[estilos_pdf_pdca.tableColHeader, estilos_pdf_pdca.tableColSmall]}>
              <Text style={estilos_pdf_pdca.tableCellHeader}>Priorizar</Text>
            </View>
            <View style={[estilos_pdf_pdca.tableColHeader, estilos_pdf_pdca.tableColSmall]}>
              <Text style={estilos_pdf_pdca.tableCellHeader}>Quick Win</Text>
            </View>
          </View>

          {display_actions.length === 0 ? (
            <View style={estilos_pdf_pdca.tableRow}>
              <View style={[estilos_pdf_pdca.tableCol, { width: "100%" }]}>
                <Text style={estilos_pdf_pdca.tableCell}>No hay acciones registradas.</Text>
              </View>
            </View>
          ) : (
            display_actions.map((accion_item, indice_fila) => (
              <View style={estilos_pdf_pdca.tableRow} key={`${accion_item.issue}-${indice_fila}`}>
                <View style={[estilos_pdf_pdca.tableCol, estilos_pdf_pdca.tableColIssue]}>
                  <Text style={estilos_pdf_pdca.tableCell}>{accion_item.issue}</Text>
                </View>
                <View style={[estilos_pdf_pdca.tableCol, estilos_pdf_pdca.tableColCause]}>
                  <Text style={estilos_pdf_pdca.tableCell}>{accion_item.root_cause}</Text>
                </View>
                <View style={[estilos_pdf_pdca.tableCol, estilos_pdf_pdca.tableColAction]}>
                  <Text style={estilos_pdf_pdca.tableCell}>{accion_item.accion}</Text>
                </View>
                <View style={[estilos_pdf_pdca.tableCol, estilos_pdf_pdca.tableColSmall]}>
                  <Text style={estilos_pdf_pdca.tableCell}>{accion_item.priorizar}</Text>
                </View>
                <View style={[estilos_pdf_pdca.tableCol, estilos_pdf_pdca.tableColSmall]}>
                  <Text style={estilos_pdf_pdca.tableCell}>{accion_item.quick_win}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Page>

      <PdcaPdfDisclaimerPage document_identifier={document_identifier} />
    </Document>
  );
};

export default PdcaPdfDocument;
