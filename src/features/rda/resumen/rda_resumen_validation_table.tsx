/**
 * @fileoverview Printable and inline-editable Root-Cause Validation table in Fase 1 Resumen.
 */

import { Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RdaValidationAction } from "@/domain/models/rda";
import { RESUMEN_HEADER_DIV_CLASS, RESUMEN_TD_CLASS, RESUMEN_TH_CLASS } from "./rda_resumen_styles";
import { RdaResumenValidationRow } from "./rda_resumen_validation_row";

interface RdaResumenValidationTableProps {
  validation_actions: RdaValidationAction[];
  is_editable: boolean;
  on_change_validation: (updated_actions: RdaValidationAction[]) => void;
  on_import_from_ishikawa: () => void;
  on_add_validation_row: () => void;
}

/** Displays validation plan rows inside the One-Pager summary with direct Ishikawa import/add CTAs. */
export function RdaResumenValidationTable({
  validation_actions,
  is_editable,
  on_change_validation,
  on_import_from_ishikawa,
  on_add_validation_row,
}: RdaResumenValidationTableProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className={`${RESUMEN_HEADER_DIV_CLASS} flex flex-wrap items-center justify-between gap-2 px-3`}>
        <span className="flex-1 text-center">{t("rda.rootCauseValidationActions")}</span>
        {is_editable && (
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={on_import_from_ishikawa}
              className="inline-flex items-center gap-1 rounded bg-white/15 hover:bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white transition-colors cursor-pointer"
            >
              <Sparkles className="size-3" /> Importar del Ishikawa
            </button>
            <button
              type="button"
              onClick={on_add_validation_row}
              className="inline-flex items-center gap-1 rounded bg-white text-[#0078D7] hover:bg-blue-50 px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
            >
              <Plus className="size-3" /> Agregar fila
            </button>
          </div>
        )}
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={RESUMEN_TH_CLASS}>#</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.category")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.potentialCause")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.action")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rdaInternal.responsible")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.deadline")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.status")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rdaInternal.possibleRootCause")}</th>
          </tr>
        </thead>
        <tbody>
          {validation_actions.map((validation_row, row_index) => (
            <RdaResumenValidationRow
              key={validation_row.id}
              row={validation_row}
              row_index={row_index}
              is_editable={is_editable}
              on_patch_row={(patch) => {
                const next_rows = [...validation_actions];
                next_rows[row_index] = { ...validation_row, ...patch };
                on_change_validation(next_rows);
              }}
              on_delete_row={() =>
                on_change_validation(
                  validation_actions.filter((_row, idx) => idx !== row_index),
                )
              }
            />
          ))}
          {validation_actions.length === 0 && (
            <tr>
              <td colSpan={8} className={`${RESUMEN_TD_CLASS} text-muted-foreground`}>
                {t("rda.noValidationActions")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
