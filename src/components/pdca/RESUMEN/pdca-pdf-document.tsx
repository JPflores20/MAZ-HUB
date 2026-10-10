import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  DefinicionMeta,
  VpoCheckpointItem,
  ParetoItem,
  ImpactMatrixRow,
  ActionItem,
} from "@/data/pdca";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#059669", // emerald-600
    paddingBottom: 10,
  },
  corporateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669", // emerald-600
  },
  documentId: {
    fontSize: 10,
    color: "#6b7280", // gray-500
  },
  projectTitleContainer: {
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#374151",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  kpiBox: {
    width: "23%",
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
  kpiLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    padding: 5,
  },
  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
    padding: 5,
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
  },
  tableCell: {
    margin: "auto",
    fontSize: 8,
    color: "#4b5563",
  },
  tableColIssue: {
    width: "25%",
  },
  tableColCause: {
    width: "25%",
  },
  tableColAction: {
    width: "30%",
  },
  tableColSmall: {
    width: "10%",
  }
});

interface PdcaPdfDocumentProps {
  pdca_title?: string;
  document_identifier?: string;
  goal_definition?: DefinicionMeta;
  vpo_checkpoints?: VpoCheckpointItem[];
  pareto_data_map?: Record<string, ParetoItem[]>;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]>;
  impact_matrix?: ImpactMatrixRow[];
  final_time_series_data?: { mes: string; target: number; actual: number | null }[];
  progreso: number;
  action_items?: ActionItem[];
}

export const PdcaPdfDocument: React.FC<PdcaPdfDocumentProps> = ({
  pdca_title = "Sin Título",
  document_identifier = "",
  goal_definition,
  vpo_checkpoints,
  impact_matrix,
  action_items,
  progreso,
}) => {
  const meta = goal_definition || {
    kpi: "",
    pis: "",
    desdeValor: "",
    aValor: "",
    unidadMedida: "",
  };

  const kpiLabel = meta.kpi || "-";
  const desdeVal = (meta as any).desde_valor || meta.desdeValor || "-";
  const aVal = (meta as any).a_valor || meta.aValor || "-";
  const unidad = (meta as any).unidad_medida || meta.unidadMedida || "";

  let gapText = "-";
  const numDesde = parseFloat(desdeVal);
  const numA = parseFloat(aVal);
  if (!isNaN(numDesde) && !isNaN(numA)) {
    const diff = +(numA - numDesde).toFixed(2);
    gapText = `${diff > 0 ? "+" : ""}${diff} ${unidad}`.trim();
  }

  const matrix = impact_matrix || [];
  const displayActions =
    Array.isArray(action_items) && action_items.length > 0
      ? action_items.map((act) => ({
          issue: act.tema || act.what || "-",
          root_cause: act.causaRaiz || act.causaRaiz2 || "-",
          accion: act.accion || act.accion2 || act.what || "-",
          priorizar: act.priorizar || "NO",
          quickWin: act.quickWin || "NO",
        }))
      : matrix.map((m) => ({
          issue: m.issue || "-",
          root_cause: m.root_cause || m.rootCause || "-",
          accion: m.accion || "-",
          priorizar: m.priorizar || "NO",
          quickWin: "NO",
        }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Corporativo */}
        <View style={styles.header}>
          <Text style={styles.corporateTitle}>Reporte Ejecutivo PDCA</Text>
          {document_identifier ? (
            <Text style={styles.documentId}>{document_identifier}</Text>
          ) : null}
        </View>

        {/* Título del Proyecto */}
        <View style={styles.projectTitleContainer}>
          <Text style={styles.projectTitle}>{pdca_title}</Text>
          <Text style={{ fontSize: 10, color: "#6b7280" }}>Progreso Actual: {progreso}%</Text>
        </View>

        {/* KPIs y Meta */}
        <Text style={styles.sectionTitle}>Definición de Meta (KPI)</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Indicador</Text>
            <Text style={styles.kpiValue}>{kpiLabel}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Valor Inicial</Text>
            <Text style={styles.kpiValue}>{desdeVal} {unidad}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Valor Objetivo</Text>
            <Text style={styles.kpiValue}>{aVal} {unidad}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Gap (Diferencia)</Text>
            <Text style={styles.kpiValue}>{gapText}</Text>
          </View>
        </View>

        {/* Plan de Acción (Tabla) */}
        <Text style={styles.sectionTitle}>Plan de Acción (Principales Resultados)</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.tableColIssue]}>
              <Text style={styles.tableCellHeader}>Tema / Problema</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColCause]}>
              <Text style={styles.tableCellHeader}>Causa Raíz</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColAction]}>
              <Text style={styles.tableCellHeader}>Acción de Mejora</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColSmall]}>
              <Text style={styles.tableCellHeader}>Priorizar</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColSmall]}>
              <Text style={styles.tableCellHeader}>Quick Win</Text>
            </View>
          </View>
          
          {displayActions.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "100%" }]}>
                <Text style={styles.tableCell}>No hay acciones registradas.</Text>
              </View>
            </View>
          ) : (
            displayActions.map((act, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={[styles.tableCol, styles.tableColIssue]}>
                  <Text style={styles.tableCell}>{act.issue}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColCause]}>
                  <Text style={styles.tableCell}>{act.root_cause}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColAction]}>
                  <Text style={styles.tableCell}>{act.accion}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColSmall]}>
                  <Text style={styles.tableCell}>{act.priorizar}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColSmall]}>
                  <Text style={styles.tableCell}>{act.quickWin}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PdcaPdfDocument;
