// @ts-nocheck
import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { IshikawaInteractivo } from "@/components/pdca/1.PLAN/paso16/ishikawa-interactive";
import { getRdaName } from "./rda-name";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  rda: Rda;
  onChange?: (rda: Rda) => void;
}

export function RdaPhase1Resumen({ rda }: Props) {
  const { t } = useTranslation();

  // Helpers
  const concatenatedProblem = [
    rda.problemDescription?.que,
    rda.problemDescription?.como,
    rda.problemDescription?.cuando,
    rda.problemDescription?.donde,
    rda.problemDescription?.quien,
    rda.problemDescription?.cual,
  ]
    .filter(Boolean)
    .map((s) => s?.trim())
    .join(" ");

  const immediateActionText = rda.immediateActions?.[0]?.accion || "No definido";
  const observacionesText = rda.observacionesAdicionales || "No definido";

  // Ishikawa data
  const currentIshikawa = rda.ishikawa?.[0] || { effect: "", causes: {} };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    const datePart = isoString.includes("T") ? isoString.split("T")[0] : isoString;
    const [year, month, day] = datePart.split("-");
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return isoString;
  };

  // Common classes for print-like tables
  const thClass =
    "border border-black/30 bg-[#0078D7] p-1.5 font-bold text-[10px] text-center text-white uppercase";
  const tdClass =
    "border border-black/30 p-1.5 text-xs text-center text-blue-800 font-medium bg-white";
  const headerDivClass =
    "bg-[#0078D7] border border-black/30 p-1.5 font-bold text-center text-xs uppercase text-white mt-6";
  const textDivClass =
    "border border-t-0 border-black/30 p-3 text-xs text-blue-800 text-center font-medium bg-white min-h-[40px]";

  const printRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Resumen_${rda.context?.folio || rda.id}`,
    pageStyle: `@page { size: landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; }`
  });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 print:hidden">
        <Button onClick={handleDownloadPdf} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>
      <div id="rda-resumen-content" ref={printRef} className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-border w-full overflow-x-auto text-black print:p-0 print:border-none print:shadow-none">
      <h1 className="text-xl font-bold tracking-wide uppercase text-center mb-4">
        {t("rda.anomalyReport")}
      </h1>

      {/* Context Table */}
      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr>
            <th className={thClass}>{t("rda.plant")}</th>
            <th className={thClass}>{t("rda.anomalyDate")}</th>
            <th className={thClass}>{t("rda.shiftTeam")}</th>
            <th className={thClass}>{t("rda.initiatedBy")}</th>
            <th className={thClass}>{t("rda.responsible")}</th>
            <th className={thClass}>{t("rda.stage")}</th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.planta || "-"}</td>
            <td className={tdClass}>{formatDate(rda.context.fecha)}</td>
            <td className={tdClass}>{rda.context.turno || "-"}</td>
            <td className={tdClass}>{rda.context.iniciadoPor || "-"}</td>
            <td className={tdClass}>{rda.context.responsable || "-"}</td>
            <td className={tdClass}>{rda.context.etapa || "-"}</td>
          </tr>
          <tr>
            <th className={thClass}>{t("rda.department")}</th>
            <th className={thClass}>{t("rda.area")}</th>
            <th className={thClass}>{t("rda.trigger")}</th>
            <th colSpan={2} className={thClass}>
              {t("rda.affectedEquipment")}
            </th>
            <th className={thClass}>{t("rda.rdaFolio")}</th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.departamento || "-"}</td>
            <td className={tdClass}>{rda.context.area || "-"}</td>
            <td className={tdClass}>{rda.context.disparador || "-"}</td>
            <td colSpan={2} className={tdClass}>
              {rda.context.equiposAfectados || "-"}
            </td>
            <td className={tdClass}>{rda.context.folio || "-"}</td>
          </tr>
          <tr>
            <th className={thClass}>
              {t("rda.downtime")}
              <br />
              (números)
            </th>
            <th className={thClass}>
              {t("rda.units")}
              <br />
              (Tiempo de paro)
            </th>
            <th className={thClass}>
              {t("rda.lossesWaste")}
              <br />
              (números)
            </th>
            <th className={thClass}>
              {t("rda.units")}
              <br />
              (pérdidas)
            </th>
            <th className={thClass}>
              {t("rda.nonConformingProducts")}
              <br />
              (números)
            </th>
            <th className={thClass}>
              {t("rda.units")}
              <br />
              (producto no conforme)
            </th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.tiempoParo || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesTiempoParo || "-"}</td>
            <td className={tdClass}>{rda.context.perdidas || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesPerdidas || "-"}</td>
            <td className={tdClass}>{rda.context.productosNoConformes || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesNoConformes || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Descripcion */}
      <div className={headerDivClass}>
        {t("rdaInternal.abnormalityDescriptionSummary")}
      </div>
      <div className={textDivClass}>{concatenatedProblem || "-"}</div>

      {/* Acciones Correctivas */}
      <div className={headerDivClass}>{t("rda.immediateCorrectiveActions")}</div>
      <div className={textDivClass}>{immediateActionText}</div>

      {/* Observaciones */}
      <div className={headerDivClass}>{t("rdaInternal.observationsDetails")}</div>
      <div className={textDivClass}>{observacionesText}</div>

      {/* Analisis de Causa Raiz Header */}
      <div className={headerDivClass}>{t("rda.rootCauseAnalysisWarning")}</div>
      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr>
            <th className={`${thClass} border-t-0 w-[40%]`}>
              {t("rdaInternal.analyzedInOtherReports")}
            </th>
            <td className={`${tdClass} border-t-0 w-[10%]`}>
              {rda.analizadoEnOtrosReportes || "No"}
            </td>
            <th className={`${thClass} border-t-0 w-[20%]`}>{t("rda.participants")}</th>
            <td className={`${tdClass} border-t-0 w-[30%]`}>{rda.participantesRC || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Ishikawa */}
      <div className="mb-8 pointer-events-none border border-black/30 p-2">
        <IshikawaInteractivo
          tituloPersonalizado={t("rdaInternal.causeEffectDiagram")}
          causasRegistradas={currentIshikawa.causes || {}}
          alCambiarCausas={() => {}}
          efectoPrincipal={getRdaName(rda)}
          alCambiarEfecto={() => {}}
          defaultExpanded={true}
          hidePrioritizationTable={true}
        />
      </div>

      {/* Validacion de causa raiz */}
      <div className={headerDivClass}>{t("rda.rootCauseValidationActions")}</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={thClass}>#</th>
            <th className={thClass}>{t("rda.category")}</th>
            <th className={thClass}>{t("rda.potentialCause")}</th>
            <th className={thClass}>{t("rda.action")}</th>
            <th className={thClass}>{t("rdaInternal.responsible")}</th>
            <th className={thClass}>{t("rda.deadline")}</th>
            <th className={thClass}>{t("rda.status")}</th>
            <th className={thClass}>{t("rdaInternal.possibleRootCause")}</th>
          </tr>
        </thead>
        <tbody>
          {rda.validationActions?.map((val, idx) => (
            <tr key={val.id}>
              <td className={tdClass}>{idx + 1}</td>
              <td className={tdClass}>{val.categoria}</td>
              <td className={tdClass}>{val.causaPotencial}</td>
              <td className={tdClass}>{val.accion}</td>
              <td className={tdClass}>{val.responsable}</td>
              <td className={tdClass}>{formatDate(val.fechaLimite)}</td>
              <td
                className={`${tdClass} ${val.estatus === "Completa" ? "bg-green-400 text-black" : ""}`}
              >
                {val.estatus}
              </td>
              <td
                className={
                  val.esCausaRaiz?.toUpperCase() === "SI"
                    ? "border border-black/30 p-1.5 text-xs text-center font-bold bg-red-500 text-white"
                    : val.esCausaRaiz?.toUpperCase() === "NO"
                      ? "border border-black/30 p-1.5 text-xs text-center font-bold bg-[#00B050] text-white"
                      : tdClass
                }
              >
                {val.esCausaRaiz}
              </td>
            </tr>
          ))}
          {(!rda.validationActions || rda.validationActions.length === 0) && (
            <tr>
              <td colSpan={8} className={`${tdClass} text-muted-foreground`}>
                {t("rda.noValidationActions")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Estandarizacion */}
      <div className={headerDivClass}>{t("rda.standardizationChecklist")}</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th colSpan={2} className={thClass}>
              {t("rda.standardsEvaluation")}
            </th>
            <th colSpan={2} className={thClass}>
              {t("rda.vpoToolsToConsider")}
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              id1: "mapeo",
              q1: t("rdaInternal.qUpdateProcessMapping"),
              id2: "chk_checklist",
              q2: t("rdaInternal.qUpdateChecklist"),
            },
            {
              id1: "owd",
              q1: t("rdaInternal.qNeedOwdForSop"),
              id2: "chk_pisic",
              q2: t("rdaInternal.qPiSicMonitoring"),
            },
            {
              id1: "sop",
              q1: t("rdaInternal.qUpdateSop"),
              id2: "chk_sap",
              q2: t("rdaInternal.qSapInvestigation"),
            },
            {
              id1: "capacitacion",
              q1: t("rdaInternal.qSopTrainingChanges"),
              id2: "chk_sla",
              q2: t("rdaInternal.qCreateSla"),
            },
            {
              id1: "monitoreo_ip",
              q1: t("rdaInternal.qIpMonitoringToRoutine"),
              id2: "chk_gops",
              q2: t("rdaInternal.qReviewExistingGops"),
            },
          ].map((row, i) => (
            <tr key={i}>
              <td
                className={`border border-black/30 p-1.5 text-center font-bold text-white w-[60px] ${rda.checklistEstandarizacion?.[row.id1] ? "bg-[#00B050]" : "bg-red-500 dark:bg-red-600"}`}
              >
                {rda.checklistEstandarizacion?.[row.id1] ? t("rdaInternal.yes") : t("rdaInternal.no")}
              </td>
              <td className="border border-black/30 p-1.5 text-xs text-left text-blue-800 bg-white font-medium">
                {row.q1}
              </td>
              <td
                className={`border border-black/30 p-1.5 text-center font-bold text-white w-[60px] ${rda.checklistEstandarizacion?.[row.id2] ? "bg-[#00B050]" : "bg-red-500 dark:bg-red-600"}`}
              >
                {rda.checklistEstandarizacion?.[row.id2] ? t("rdaInternal.yes") : t("rdaInternal.no")}
              </td>
              <td className="border border-black/30 p-1.5 text-xs text-left text-blue-800 bg-white font-medium">
                {row.q2}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDA */}
      <div className={headerDivClass}>
        {t("rdaInternal.preventionPda")}
      </div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={thClass}>#</th>
            <th className={thClass}>{t("rda.date")}</th>
            <th className={thClass}>{t("rda.subject")}</th>
            <th className={thClass}>{t("rda.action")}</th>
            <th className={thClass}>{t("rda.comments")}</th>
            <th className={thClass}>{t("rdaInternal.responsible")}</th>
            <th className={thClass}>{t("rda.deadline")}</th>
            <th className={thClass}>{t("rda.status")}</th>
          </tr>
        </thead>
        <tbody>
          {rda.pda?.map((action, idx) => (
            <tr key={action.id}>
              <td className={tdClass}>{idx + 1}</td>
              <td className={tdClass}>{formatDate(action.fecha)}</td>
              <td className={tdClass}>{action.asunto || "-"}</td>
              <td className={tdClass}>{action.accion || "-"}</td>
              <td className={tdClass}>{action.comentarios || "-"}</td>
              <td className={tdClass}>{action.responsable || "-"}</td>
              <td className={tdClass}>{formatDate(action.fechaLimite)}</td>
              <td
                className={`${tdClass} ${action.estatus === "Complete" ? "bg-green-400 text-black" : action.estatus === "In Progress" ? "bg-yellow-200 text-black" : ""}`}
              >
                {action.estatus || "-"}
              </td>
            </tr>
          ))}
          {(!rda.pda || rda.pda.length === 0) && (
            <tr>
              <td colSpan={8} className={`${tdClass} text-muted-foreground`}>
                {t("rda.noPdaActions")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Aviso de Confidencialidad y Privacidad (Disclaimer en última hoja - solo PDF) */}
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
                Plataforma MAZ HUB — Reporte de Anomalía (RDA)
              </p>
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
}
