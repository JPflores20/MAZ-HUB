/**
 * @fileoverview Printable and inline-editable Recurrence Prevention PDA table for Fase 1 Resumen.
 */

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ActionItem } from "@/domain/pdca";
import { RESUMEN_HEADER_DIV_CLASS, RESUMEN_TD_CLASS, RESUMEN_TH_CLASS } from "./rda_resumen_styles";
import { type RdaExtendedPdaItem, RdaResumenPdaRow } from "./rda_resumen_pda_row";

interface RdaResumenPdaTableProps {
  pda_actions: ActionItem[];
  is_editable: boolean;
  on_change_pda: (next_pda: ActionItem[]) => void;
  on_add_pda_row: () => void;
}

/** Displays all preventive PDA rows with direct row creation and removal inside Resumen. */
export function RdaResumenPdaTable({
  pda_actions,
  is_editable,
  on_change_pda,
  on_add_pda_row,
}: RdaResumenPdaTableProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className={`${RESUMEN_HEADER_DIV_CLASS} flex flex-wrap items-center justify-between gap-2 px-3`}>
        <span className="flex-1 text-center">{t("rdaInternal.preventionPda")}</span>
        {is_editable && (
          <button
            type="button"
            onClick={on_add_pda_row}
            className="inline-flex items-center gap-1 rounded bg-white text-[#0078D7] hover:bg-blue-50 px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer print:hidden"
          >
            <Plus className="size-3" /> Agregar acción PDA
          </button>
        )}
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={RESUMEN_TH_CLASS}>#</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.date")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.subject")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.action")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.comments")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rdaInternal.responsible")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.deadline")}</th>
            <th className={RESUMEN_TH_CLASS}>{t("rda.status")}</th>
            <th className={RESUMEN_TH_CLASS}>Análisis 5 medios básicos para cero averías</th>
          </tr>
        </thead>
        <tbody>
          {pda_actions.map((action_row, row_index) => (
            <RdaResumenPdaRow
              key={action_row.id || row_index}
              action={action_row as RdaExtendedPdaItem}
              row_index={row_index}
              is_editable={is_editable}
              on_patch_row={(patch) => {
                const next_pda = [...pda_actions];
                next_pda[row_index] = { ...action_row, ...patch } as ActionItem;
                on_change_pda(next_pda);
              }}
              on_delete_row={() =>
                on_change_pda(pda_actions.filter((_item, idx) => idx !== row_index))
              }
            />
          ))}
          {pda_actions.length === 0 && (
            <tr>
              <td colSpan={9} className={`${RESUMEN_TD_CLASS} text-muted-foreground`}>
                {t("rda.noPdaActions")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
