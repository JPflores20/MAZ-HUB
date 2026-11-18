/**
 * @fileoverview 5W1H abnormality summary, immediate containment, observations, and root-cause header blocks.
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaProblemDescription } from "@/domain/models/rda";
import {
  RESUMEN_HEADER_DIV_CLASS,
  RESUMEN_INPUT_CLASS,
  RESUMEN_SELECT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TEXT_DIV_CLASS,
  RESUMEN_TH_CLASS,
} from "./rda_resumen_styles";

interface RdaResumenProblemSectionsProps {
  rda: Rda;
  is_editable: boolean;
  on_change_problem_desc: (field_name: keyof RdaProblemDescription, value: string) => void;
  on_change_immediate_action: (value: string) => void;
  on_change_rda: ((next_rda: Rda) => void) | undefined;
}

const PROBLEM_FIELDS: { key: keyof RdaProblemDescription; label_key: string; fallback: string }[] = [
  { key: "que", label_key: "rdaInternal.what", fallback: "¿Qué?" },
  { key: "como", label_key: "rdaInternal.how", fallback: "¿Cómo?" },
  { key: "cuando", label_key: "rdaInternal.when", fallback: "¿Cuándo?" },
  { key: "donde", label_key: "rdaInternal.where", fallback: "¿Dónde?" },
  { key: "quien", label_key: "rdaInternal.who", fallback: "¿Quién?" },
  { key: "cual", label_key: "rdaInternal.which", fallback: "¿Cuál?" },
];

/** Renders editable/printable narrative sections connecting 5W1H, containment, and team metadata. */
export function RdaResumenProblemSections({
  rda,
  is_editable,
  on_change_problem_desc,
  on_change_immediate_action,
  on_change_rda,
}: RdaResumenProblemSectionsProps) {
  const { t } = useTranslation();

  const concatenated_problem = [
    rda.problemDescription?.que,
    rda.problemDescription?.como,
    rda.problemDescription?.cuando,
    rda.problemDescription?.donde,
    rda.problemDescription?.quien,
    rda.problemDescription?.cual,
  ]
    .filter(Boolean)
    .map((segment) => segment?.trim())
    .join(", ");

  const immediate_action_text = rda.immediateActions?.[0]?.accion || "";
  const observations_text = rda.observacionesAdicionales || "";

  return (
    <>
      <div className={RESUMEN_HEADER_DIV_CLASS}>{t("rdaInternal.abnormalityDescriptionSummary")}</div>
      {is_editable ? (
        <div className="border border-t-0 border-black/30 p-3 bg-white space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 print:hidden">
            {PROBLEM_FIELDS.map(({ key, label_key, fallback }) => {
              const label_text = t(label_key, fallback);
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    {label_text}
                  </label>
                  <input
                    type="text"
                    value={rda.problemDescription?.[key] || ""}
                    onChange={(change_event) => on_change_problem_desc(key, change_event.target.value)}
                    placeholder={`Escribe ${label_text.toLowerCase()}...`}
                    className="w-full rounded border border-slate-300 bg-slate-50/70 px-2 py-1 text-xs text-blue-800 font-medium outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                  />
                </div>
              );
            })}
          </div>
          <div className="text-xs text-blue-800 text-justify font-medium pt-1 border-t border-slate-200 print:border-t-0 print:pt-0">
            {concatenated_problem || (
              <span className="text-slate-400 italic print:hidden">
                Completa los campos 5W1H arriba para generar automáticamente el enunciado de la
                anomalía...
              </span>
            )}
            <span className="hidden print:inline">{!concatenated_problem ? "-" : ""}</span>
          </div>
        </div>
      ) : (
        <div className={RESUMEN_TEXT_DIV_CLASS}>{concatenated_problem || "-"}</div>
      )}

      <div className={RESUMEN_HEADER_DIV_CLASS}>{t("rda.immediateCorrectiveActions")}</div>
      <div className={RESUMEN_TEXT_DIV_CLASS}>
        {is_editable ? (
          <textarea
            rows={2}
            value={immediate_action_text}
            onChange={(change_event) => on_change_immediate_action(change_event.target.value)}
            placeholder="Describe las acciones correctivas inmediatas o de contención tomadas..."
            className="w-full bg-transparent text-xs text-blue-800 text-justify font-medium outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 resize-y placeholder:text-slate-400"
          />
        ) : (
          immediate_action_text || "No definido"
        )}
      </div>

      <div className={RESUMEN_HEADER_DIV_CLASS}>{t("rdaInternal.observationsDetails")}</div>
      <div className={RESUMEN_TEXT_DIV_CLASS}>
        {is_editable ? (
          <textarea
            rows={2}
            value={observations_text}
            onChange={(change_event) =>
              on_change_rda?.({ ...rda, observacionesAdicionales: change_event.target.value })
            }
            placeholder="Escribe observaciones o detalles adicionales de la anomalía..."
            className="w-full bg-transparent text-xs text-blue-800 text-justify font-medium outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 resize-y placeholder:text-slate-400"
          />
        ) : (
          observations_text || "No definido"
        )}
      </div>

      <div className={RESUMEN_HEADER_DIV_CLASS}>{t("rda.rootCauseAnalysisWarning")}</div>
      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr>
            <th className={`${RESUMEN_TH_CLASS} border-t-0 w-[40%]`}>
              {t("rdaInternal.analyzedInOtherReports")}
            </th>
            <td className={`${RESUMEN_TD_CLASS} border-t-0 w-[10%]`}>
              {is_editable ? (
                <select
                  value={rda.analizadoEnOtrosReportes || "No"}
                  onChange={(change_event) =>
                    on_change_rda?.({ ...rda, analizadoEnOtrosReportes: change_event.target.value })
                  }
                  className={RESUMEN_SELECT_CLASS}
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              ) : (
                rda.analizadoEnOtrosReportes || "No"
              )}
            </td>
            <th className={`${RESUMEN_TH_CLASS} border-t-0 w-[20%]`}>{t("rda.participants")}</th>
            <td className={`${RESUMEN_TD_CLASS} border-t-0 w-[30%]`}>
              {is_editable ? (
                <input
                  type="text"
                  value={rda.participantesRC || ""}
                  onChange={(change_event) =>
                    on_change_rda?.({ ...rda, participantesRC: change_event.target.value })
                  }
                  placeholder="Nombres de los participantes..."
                  className={RESUMEN_INPUT_CLASS}
                />
              ) : (
                rda.participantesRC || "-"
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
