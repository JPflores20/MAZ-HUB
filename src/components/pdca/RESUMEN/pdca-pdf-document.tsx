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
  },
  disclaimerPage: {
    padding: 35,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  disclaimerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: "#059669",
    paddingBottom: 10,
  },
  disclaimerBrand: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#059669",
    textTransform: "uppercase",
  },
  disclaimerSubbrand: {
    fontSize: 8.5,
    color: "#4b5563",
    marginTop: 2,
  },
  disclaimerCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  disclaimerTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: 7.5,
    lineHeight: 1.4,
    color: "#334155",
    textAlign: "justify",
    marginBottom: 5,
  },
  disclaimerLink: {
    fontSize: 7.5,
    color: "#0284c7",
    textDecoration: "underline",
  },
  disclaimerFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  disclaimerFooterText: {
    fontSize: 7.5,
    color: "#94a3b8",
  },
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

      {/* Última Hoja: Aviso de Confidencialidad y Privacidad (Disclaimer) */}
      <Page size="A4" style={styles.disclaimerPage}>
        <View style={styles.disclaimerHeader}>
          <View>
            <Text style={styles.disclaimerBrand}>Cervecería de Zacatecas • Grupo Modelo • AB InBev</Text>
            <Text style={styles.disclaimerSubbrand}>Plataforma MAZ HUB — Módulo PDCA de Mejora Continua</Text>
          </View>
          {document_identifier ? (
            <Text style={styles.documentId}>{document_identifier}</Text>
          ) : null}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>
            Aviso de Confidencialidad y Privacidad (Disclaimer)
          </Text>
          <Text style={styles.disclaimerText}>
            Este documento, reporte y la información técnica u operativa contenida en el mismo son propiedad de Cervecería de Zacatecas / Grupo Modelo / AB InBev y pueden contener información privilegiada o confidencial para uso exclusivo de su destinatario o personal expresamente autorizado. Cualquier divulgación, reproducción, distribución, copia o uso no autorizado expresamente queda prohibido y puede ser ilegal de conformidad con la legislación aplicable. Si usted ha recibido o tenido acceso a este reporte por error, favor de notificar inmediatamente al remitente o administrador de la plataforma MAZ HUB y borrar el presente documento.
          </Text>
          <Text style={styles.disclaimerText}>
            Los Datos Personales y registros operativos en nuestra posesión se encuentran protegidos y se tratan de conformidad con las legislaciones y regulaciones aplicables y nuestro Aviso de Privacidad y Políticas Corporativas, disponible en nuestra página de Internet Global:
          </Text>
          <Text style={styles.disclaimerLink}>
            https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 5 }]}>
            y/o las específicas del país de origen de esta comunicación. Únicamente la persona autorizada por AB InBev podrá garantizar que la información aquí contenida —y la interpretación de esta misma— sea aplicable o apropiada a su situación particular. Para cualquier consulta o aclaración, puede comunicarse con nosotros utilizando nuestro sitio web global "contáctenos" o su persona de contacto autorizada de AB InBev.
          </Text>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>
            Confidentiality and Privacy Statement (Disclaimer)
          </Text>
          <Text style={styles.disclaimerText}>
            This document, report, and any data contained herein are the property of Cervecería de Zacatecas / Grupo Modelo / AB InBev and may contain confidential and/or privileged information intended solely for the use of the named addressee or authorized personnel. Any unauthorized review, dissemination, copying, distribution, or use is prohibited and may be illegal. If you are not the intended recipient or if you have received this document in error, please immediately notify the sender or MAZ HUB administrator and delete this document permanently.
          </Text>
          <Text style={styles.disclaimerText}>
            Personal Data and operational records in our possession are protected and treated pursuant to applicable data protection regulations and our Privacy Statement available on our global Internet website:
          </Text>
          <Text style={styles.disclaimerLink}>
            https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 5 }]}>
            and/or the country-specific policy. Only an AB InBev authorized person in this matter can provide assurances that the information contained herein —and your interpretation of it— is applicable or appropriate to your particular situation. For any query, you may contact us using our global “contact us” website or your designated AB InBev contact person.
          </Text>
        </View>

        <View style={styles.disclaimerFooter}>
          <Text style={styles.disclaimerFooterText}>Documento generado automáticamente por plataforma MAZ HUB</Text>
          <Text style={styles.disclaimerFooterText}>Confidencial — Uso Interno Autorizado</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PdcaPdfDocument;
