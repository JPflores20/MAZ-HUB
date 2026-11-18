/**
 * @fileoverview Closure summary table and bilingual AB InBev confidentiality disclaimer (print footer).
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaClosure } from "@/domain/models/rda";
import {
  format_resumen_date,
  RESUMEN_HEADER_DIV_CLASS,
  RESUMEN_INPUT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TH_CLASS,
} from "./rda_resumen_styles";

const CLOSURE_FLAGS: { key: Exclude<keyof RdaClosure, "fechaFinalizacion">; label: string }[] = [
  { key: "eliminoCausaRaiz", label: "¿Las acciones correctivas eliminaron la causa raíz?" },
  { key: "requiereEscalar", label: "¿Es requerido escalarlo a nivel de zona?" },
  { key: "necesitaCapex", label: "¿Se necesita CAPEX?" },
  { key: "incluyeComoGop", label: "¿Se incluye como GOP/Buena Práctica/Innovación?" },
];

interface RdaResumenClosureAndDisclaimerProps {
  rda: Rda;
  is_editable: boolean;
  on_change_rda: ((next_rda: Rda) => void) | undefined;
}

/** Renders the printable closure decision row and final-page confidentiality legal notice. */
export function RdaResumenClosureAndDisclaimer({
  rda,
  is_editable,
  on_change_rda,
}: RdaResumenClosureAndDisclaimerProps) {
  const { t } = useTranslation();

  const patch_closure = (patch: Partial<RdaClosure>) => {
    on_change_rda?.({
      ...rda,
      closure: {
        eliminoCausaRaiz: false,
        requiereEscalar: false,
        necesitaCapex: false,
        incluyeComoGop: false,
        fechaFinalizacion: "",
        ...(rda.closure || {}),
        ...patch,
      },
    });
  };

  return (
    <>
      <div className={RESUMEN_HEADER_DIV_CLASS}>Reporte de cierre</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            {CLOSURE_FLAGS.map((flag_spec) => (
              <th key={flag_spec.key} className={RESUMEN_TH_CLASS}>
                {flag_spec.label}
              </th>
            ))}
            <th className={RESUMEN_TH_CLASS}>Fecha de finalización</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {CLOSURE_FLAGS.map((flag_spec) => {
              const flag_value = Boolean(rda.closure?.[flag_spec.key]);
              return (
                <td
                  key={flag_spec.key}
                  onClick={() => is_editable && patch_closure({ [flag_spec.key]: !flag_value })}
                  className={`border border-black/30 p-2 text-xs text-center font-bold text-white bg-[#3C7D22] ${
                    is_editable ? "cursor-pointer select-none hover:bg-[#2f631b]" : ""
                  }`}
                  title={is_editable ? "Clic para cambiar Sí / No" : undefined}
                >
                  {flag_value ? t("rdaInternal.yes", "Sí") : t("rdaInternal.no", "No")}
                </td>
              );
            })}
            <td className={RESUMEN_TD_CLASS}>
              {is_editable ? (
                <input
                  type="date"
                  value={rda.closure?.fechaFinalizacion || ""}
                  onChange={(change_event) =>
                    patch_closure({ fechaFinalizacion: change_event.target.value })
                  }
                  className={RESUMEN_INPUT_CLASS}
                />
              ) : rda.closure?.fechaFinalizacion ? (
                format_resumen_date(rda.closure.fechaFinalizacion)
              ) : (
                ""
              )}
            </td>
          </tr>
        </tbody>
      </table>

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
              <p className="text-xs text-slate-500">Plataforma MAZ HUB — Reporte de Anomalía (RDA)</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              Folio: {rda.context?.folio || rda.id}
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <div>
              <h3 className="font-bold text-slate-800 uppercase mb-1 text-[11px] tracking-wide">
                Aviso de Confidencialidad y Privacidad (Disclaimer)
              </h3>
              <p className="mb-2">
                Este reporte y la información técnica u operativa contenida en el mismo son propiedad
                de Cervecería de Zacatecas / Grupo Modelo / AB InBev y pueden contener información
                privilegiada o confidencial para uso exclusivo de su destinatario o personal
                expresamente autorizado. Cualquier divulgación, reproducción, distribución, copia o
                uso no autorizado expresamente queda prohibido y puede ser ilegal de conformidad con
                la legislación aplicable. Si usted ha tenido acceso a este reporte por error, favor de
                notificar inmediatamente al remitente o administrador de la plataforma MAZ HUB y borrar
                el presente documento.
              </p>
              <p className="mb-2">
                Los Datos Personales y registros operativos en nuestra posesión se encuentran protegidos
                y se tratan de conformidad con las legislaciones y regulaciones aplicables y nuestro
                Aviso de Privacidad y Políticas Corporativas, disponible en nuestra página de Internet
                Global:{" "}
                <a
                  href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
                </a>{" "}
                y/o las específicas del país de origen de esta comunicación. Únicamente la persona
                autorizada por AB InBev podrá garantizar que la información aquí contenida —y la
                interpretación de esta misma— sea aplicable o apropiada a su situación particular. Para
                cualquier consulta o aclaración, puede comunicarse con nosotros utilizando nuestro sitio
                web global &quot;contáctenos&quot; o su persona de contacto autorizada de AB InBev.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase mb-1 text-[11px] tracking-wide">
                Confidentiality and Privacy Statement (Disclaimer)
              </h3>
              <p className="mb-2">
                This document, report, and any data contained herein are the property of Cervecería de
                Zacatecas / Grupo Modelo / AB InBev and may contain confidential and/or privileged
                information intended solely for the use of the named addressee or authorized
                personnel. Any unauthorized review, dissemination, copying, distribution, or use is
                prohibited and may be illegal. If you are not the intended recipient or if you have
                received this document in error, please notify the sender or MAZ HUB administrator and
                delete this document permanently.
              </p>
              <p>
                Personal Data and operational records in our possession are protected and treated
                pursuant to applicable data protection regulations and our Privacy Statement available
                on our global Internet website:{" "}
                <a
                  href="https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  https://www.ab-inbev.com/our-policies/#responsibledisclosurepolicy
                </a>{" "}
                and/or the country-specific policy. Only an AB InBev authorized person in this matter
                can provide assurances that the information contained herein —and your interpretation
                of it— is applicable or appropriate to your particular situation. For any query, you may
                contact us using our global “contact us” website or your designated AB InBev contact
                person.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>Documento generado por plataforma MAZ HUB</span>
            <span>Confidencial — Uso Interno Autorizado</span>
          </div>
        </div>
      </div>
    </>
  );
}
