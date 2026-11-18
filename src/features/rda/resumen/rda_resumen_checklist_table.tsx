/**
 * @fileoverview Interactive & printable Standardization & VPO Knowledge Checklist inside Fase 1 Resumen.
 */

import { useTranslation } from "react-i18next";
import { RESUMEN_HEADER_DIV_CLASS, RESUMEN_TH_CLASS } from "./rda_resumen_styles";

const RESUMEN_CHECKLIST_ROWS = [
  {
    id1: "mapeo",
    q1_key: "rdaInternal.qUpdateProcessMapping",
    id2: "chk_checklist",
    q2_key: "rdaInternal.qUpdateChecklist",
  },
  {
    id1: "owd",
    q1_key: "rdaInternal.qNeedOwdForSop",
    id2: "chk_pisic",
    q2_key: "rdaInternal.qPiSicMonitoring",
  },
  {
    id1: "sop",
    q1_key: "rdaInternal.qUpdateSop",
    id2: "chk_sap",
    q2_key: "rdaInternal.qSapInvestigation",
  },
  {
    id1: "capacitacion",
    q1_key: "rdaInternal.qSopTrainingChanges",
    id2: "chk_sla",
    q2_key: "rdaInternal.qCreateSla",
  },
  {
    id1: "monitoreo_ip",
    q1_key: "rdaInternal.qIpMonitoringToRoutine",
    id2: "chk_gops",
    q2_key: "rdaInternal.qReviewExistingGops",
  },
] as const;

interface RdaResumenChecklistTableProps {
  checklist: Record<string, boolean>;
  is_editable: boolean;
  on_toggle_item: (item_id: string) => void;
}

/** Renders the two-column print checklist where editable cells toggle Sí/No on click. */
export function RdaResumenChecklistTable({
  checklist,
  is_editable,
  on_toggle_item,
}: RdaResumenChecklistTableProps) {
  const { t } = useTranslation();

  const render_toggle_cell = (item_id: string) => {
    const is_checked = Boolean(checklist[item_id]);
    return (
      <td
        onClick={() => is_editable && on_toggle_item(item_id)}
        className={`border border-black/30 p-1.5 text-center font-bold text-white w-[60px] ${
          is_editable ? "cursor-pointer select-none hover:opacity-90" : ""
        } ${is_checked ? "bg-red-500 dark:bg-red-600" : "bg-[#00B050]"}`}
        style={{
          backgroundColor: is_checked ? "#EF4444" : "#00B050",
          color: "#FFFFFF",
        }}
        title={is_editable ? "Clic para cambiar Sí / No" : undefined}
      >
        {is_checked ? t("rdaInternal.yes") : t("rdaInternal.no")}
      </td>
    );
  };

  return (
    <>
      <div className={RESUMEN_HEADER_DIV_CLASS}>{t("rda.standardizationChecklist")}</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th colSpan={2} className={RESUMEN_TH_CLASS}>
              {t("rda.standardsEvaluation")}
            </th>
            <th colSpan={2} className={RESUMEN_TH_CLASS}>
              {t("rda.vpoToolsToConsider")}
            </th>
          </tr>
        </thead>
        <tbody>
          {RESUMEN_CHECKLIST_ROWS.map((row_spec) => (
            <tr key={row_spec.id1}>
              {render_toggle_cell(row_spec.id1)}
              <td className="border border-black/30 p-1.5 text-xs text-justify text-blue-800 bg-white font-medium">
                {t(row_spec.q1_key)}
              </td>
              {render_toggle_cell(row_spec.id2)}
              <td className="border border-black/30 p-1.5 text-xs text-justify text-blue-800 bg-white font-medium">
                {t(row_spec.q2_key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
