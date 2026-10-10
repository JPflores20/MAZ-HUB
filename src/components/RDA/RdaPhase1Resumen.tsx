// @ts-nocheck
import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { IshikawaInteractivo } from "@/components/pdca/1.PLAN/paso16/ishikawa-interactive";

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

  // Common classes for print-like tables
  const thClass =
    "border border-black/30 bg-[#0078D7] p-1.5 font-bold text-[10px] text-center text-white uppercase";
  const tdClass =
    "border border-black/30 p-1.5 text-xs text-center text-blue-800 font-medium bg-white";
  const headerDivClass =
    "bg-[#0078D7] border border-black/30 p-1.5 font-bold text-center text-xs uppercase text-white mt-6";
  const textDivClass =
    "border border-t-0 border-black/30 p-3 text-xs text-blue-800 text-center font-medium bg-white min-h-[40px]";

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-border w-full overflow-x-auto text-black print:p-0 print:border-none print:shadow-none">
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
            <td className={tdClass}>{rda.context.fecha || "-"}</td>
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
          efectoPrincipal={currentIshikawa.effect || ""}
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
              <td className={tdClass}>{val.fechaLimite}</td>
              <td
                className={`${tdClass} ${val.estatus === "Completa" ? "bg-green-400 text-black" : ""}`}
              >
                {val.estatus}
              </td>
              <td className={tdClass}>{val.esCausaRaiz}</td>
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
              <td className={tdClass}>{action.fecha || "-"}</td>
              <td className={tdClass}>{action.asunto || "-"}</td>
              <td className={tdClass}>{action.accion || "-"}</td>
              <td className={tdClass}>{action.comentarios || "-"}</td>
              <td className={tdClass}>{action.responsable || "-"}</td>
              <td className={tdClass}>{action.fechaLimite || "-"}</td>
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
    </div>
  );
}
