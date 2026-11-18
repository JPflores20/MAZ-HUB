/**
 * @fileoverview Segunda página del PDF generado con el aviso legal bilingüe de confidencialidad y privacidad.
 */
import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import { estilos_pdf_pdca } from "./pdca_pdf_styles";

interface PropiedadesPaginaLegalPdf {
  document_identifier?: string | undefined;
}

/**
 * Renderiza la hoja final de confidencialidad corporativa dentro de @react-pdf/renderer.
 */
export const PdcaPdfDisclaimerPage: React.FC<PropiedadesPaginaLegalPdf> = ({
  document_identifier,
}) => (
  <Page size="A4" style={estilos_pdf_pdca.disclaimerPage}>
    <View style={estilos_pdf_pdca.disclaimerHeader}>
      <View>
        <Text style={estilos_pdf_pdca.disclaimerBrand}>
          Cervecería de Zacatecas • Grupo Modelo • AB InBev
        </Text>
        <Text style={estilos_pdf_pdca.disclaimerSubbrand}>
          Plataforma MAZ HUB — Módulo PDCA de Mejora Continua
        </Text>
      </View>
      {document_identifier ? (
        <Text style={estilos_pdf_pdca.documentId}>{document_identifier}</Text>
      ) : null}
    </View>

    <View style={estilos_pdf_pdca.disclaimerCard}>
      <Text style={estilos_pdf_pdca.disclaimerTitle}>
        Aviso de Confidencialidad y Privacidad (Disclaimer)
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerText}>
        Este documento, reporte y la información técnica u operativa contenida en el mismo son
        propiedad de Cervecería de Zacatecas / Grupo Modelo / AB InBev y pueden contener información
        privilegiada o confidencial para uso exclusivo de personal autorizado.
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerText}>
        Aviso de Privacidad y Políticas Corporativas:
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerLink}>
        https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
      </Text>
    </View>

    <View style={estilos_pdf_pdca.disclaimerCard}>
      <Text style={estilos_pdf_pdca.disclaimerTitle}>
        Confidentiality and Privacy Statement (Disclaimer)
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerText}>
        This document, report, and any data contained herein are the property of Cervecería de
        Zacatecas / Grupo Modelo / AB InBev and may contain confidential and/or privileged
        information intended solely for authorized personnel.
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerLink}>
        https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
      </Text>
    </View>

    <View style={estilos_pdf_pdca.disclaimerFooter}>
      <Text style={estilos_pdf_pdca.disclaimerFooterText}>
        Documento generado automáticamente por plataforma MAZ HUB
      </Text>
      <Text style={estilos_pdf_pdca.disclaimerFooterText}>Confidencial — Uso Interno Autorizado</Text>
    </View>
  </Page>
);
