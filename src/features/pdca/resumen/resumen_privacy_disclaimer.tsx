/**
 * @fileoverview Hoja final exclusiva de impresión con aviso corporativo de confidencialidad y privacidad.
 */
import React from "react";

interface PropiedadesAvisoPrivacidad {
  document_identifier?: string | undefined;
}

/**
 * Renderiza el aviso legal bilingüe (ES/EN) al cierre de reportes impresos o exportados a PDF.
 */
export const ResumenPrivacyDisclaimer: React.FC<PropiedadesAvisoPrivacidad> = ({
  document_identifier,
}) => (
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
          <p className="text-xs text-slate-500">Plataforma MAZ HUB — Resumen de Proyecto PDCA</p>
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
            Este reporte y la información técnica u operativa contenida en el mismo son propiedad de
            Cervecería de Zacatecas / Grupo Modelo / AB InBev y pueden contener información
            privilegiada o confidencial para uso exclusivo de su destinatario o personal expresamente
            autorizado. Cualquier divulgación, reproducción, distribución, copia o uso no autorizado
            expresamente queda prohibido y puede ser ilegal de conformidad con la legislación
            aplicable.
          </p>
          <p className="mb-2">
            Los Datos Personales y registros operativos se tratan conforme a nuestro Aviso de
            Privacidad:{" "}
            <a
              href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
            </a>
            .
          </p>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 uppercase mb-1 text-[11px] tracking-wide">
            Confidentiality and Privacy Statement (Disclaimer)
          </h3>
          <p className="mb-2">
            This document, report, and any data contained herein are the property of Cervecería de
            Zacatecas / Grupo Modelo / AB InBev and may contain confidential and/or privileged
            information intended solely for authorized personnel.
          </p>
          <p>
            Privacy Statement:{" "}
            <a
              href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
        <span>Documento generado por plataforma MAZ HUB</span>
        <span>Confidencial — Uso Interno Autorizado</span>
      </div>
    </div>
  </div>
);
