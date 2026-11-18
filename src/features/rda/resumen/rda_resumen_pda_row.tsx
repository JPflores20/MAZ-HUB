/**
 * @fileoverview Printable and inline-editable PDA action row for Fase 1 Resumen.
 */

import { Trash2 } from "lucide-react";
import type { ActionItem } from "@/domain/pdca";
import { CINCO_MEDIOS_OPTIONS, resolve_select_options } from "../utils/rda_step_helpers";
import {
  format_resumen_date,
  get_resumen_status_cell_props,
  RESUMEN_INPUT_CLASS,
  RESUMEN_SELECT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TD_JUSTIFY_CLASS,
} from "./rda_resumen_styles";

export type RdaExtendedPdaItem = ActionItem & {
  estatus?: string;
  fechaCreacion?: string;
  fechaLimite?: string;
  asunto?: string;
  medioBasicoLabel?: string;
};

interface RdaResumenPdaRowProps {
  action: RdaExtendedPdaItem;
  row_index: number;
  is_editable: boolean;
  on_patch_row: (patch: Partial<RdaExtendedPdaItem>) => void;
  on_delete_row: () => void;
}

/** Renders one printable/editable PDA recurrence-prevention action row inside Fase 1 Resumen. */
export function RdaResumenPdaRow({
  action,
  row_index,
  is_editable,
  on_patch_row,
  on_delete_row,
}: RdaResumenPdaRowProps) {
  const raw_status = action.estatus || action.status || "Pendiente";
  const selected_medios = action.medioBasicoLabel || action.analisis5Medios || "";

  return (
    <tr>
      <td className={RESUMEN_TD_CLASS}>{row_index + 1}</td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <input
            type="date"
            value={action.fechaCreacion || action.fecha || ""}
            onChange={(change_event) =>
              on_patch_row({ fechaCreacion: change_event.target.value, fecha: change_event.target.value })
            }
            className={RESUMEN_INPUT_CLASS}
          />
        ) : (
          format_resumen_date(action.fechaCreacion || action.fecha)
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={action.asunto || action.causaRaiz || action.tema || ""}
            onChange={(change_event) =>
              on_patch_row({ causaRaiz: change_event.target.value, asunto: change_event.target.value })
            }
            placeholder="Causa raíz / Asunto..."
            className={`${RESUMEN_INPUT_CLASS} text-left`}
          />
        ) : (
          action.asunto || action.causaRaiz || action.tema || "-"
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={action.accion || ""}
            onChange={(change_event) => on_patch_row({ accion: change_event.target.value })}
            placeholder="Acción correctiva / preventiva..."
            className={`${RESUMEN_INPUT_CLASS} text-left`}
          />
        ) : (
          action.accion || "-"
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={action.comentarios || ""}
            onChange={(change_event) => on_patch_row({ comentarios: change_event.target.value })}
            placeholder="Comentarios..."
            className={`${RESUMEN_INPUT_CLASS} text-left`}
          />
        ) : (
          action.comentarios || "-"
        )}
      </td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={action.responsable || ""}
            onChange={(change_event) => on_patch_row({ responsable: change_event.target.value })}
            placeholder="Responsable..."
            className={RESUMEN_INPUT_CLASS}
          />
        ) : (
          action.responsable || "-"
        )}
      </td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <input
            type="date"
            value={action.fechaLimite || action.fecha || ""}
            onChange={(change_event) =>
              on_patch_row({ fechaLimite: change_event.target.value, fecha: change_event.target.value })
            }
            className={RESUMEN_INPUT_CLASS}
          />
        ) : (
          format_resumen_date(action.fechaLimite || action.fecha)
        )}
      </td>
      <td {...get_resumen_status_cell_props(raw_status)}>
        {is_editable ? (
          <select
            value={raw_status}
            onChange={(change_event) =>
              on_patch_row({
                status: change_event.target.value as ActionItem["status"],
                estatus: change_event.target.value,
                done: change_event.target.value === "Completada",
              })
            }
            className="w-full bg-transparent text-xs text-center font-bold outline-none cursor-pointer"
          >
            <option value="Pendiente" className="text-black bg-white">Pendiente</option>
            <option value="En progreso" className="text-black bg-white">En progreso</option>
            <option value="Completada" className="text-black bg-white">Completada</option>
            <option value="Retrasado" className="text-black bg-white">Retrasado</option>
          </select>
        ) : (
          raw_status
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <div className="flex items-center gap-1">
            <select
              value={selected_medios}
              onChange={(change_event) =>
                on_patch_row({
                  analisis5Medios: change_event.target.value,
                  medioBasicoLabel: change_event.target.value,
                })
              }
              className={`${RESUMEN_SELECT_CLASS} text-left flex-1`}
            >
              <option value="">-</option>
              {resolve_select_options(CINCO_MEDIOS_OPTIONS, selected_medios).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={on_delete_row}
              className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer print:hidden shrink-0"
              title="Eliminar acción"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ) : (
          selected_medios || "-"
        )}
      </td>
    </tr>
  );
}
