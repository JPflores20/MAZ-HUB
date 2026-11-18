/**
 * @fileoverview Printable and inline-editable Root-Cause Validation row inside Fase 1 Resumen.
 */

import { Trash2 } from "lucide-react";
import type { RdaValidationAction } from "@/domain/models/rda";
import { CATEGORIAS_6M_LIST, resolve_select_options } from "../utils/rda_step_helpers";
import {
  format_resumen_date,
  get_resumen_status_cell_props,
  RESUMEN_INPUT_CLASS,
  RESUMEN_SELECT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TD_JUSTIFY_CLASS,
} from "./rda_resumen_styles";

interface RdaResumenValidationRowProps {
  row: RdaValidationAction;
  row_index: number;
  is_editable: boolean;
  on_patch_row: (patch: Partial<RdaValidationAction>) => void;
  on_delete_row: () => void;
}

/** Renders one printable validation row with editable selects/inputs and root-cause indicator. */
export function RdaResumenValidationRow({
  row,
  row_index,
  is_editable,
  on_patch_row,
  on_delete_row,
}: RdaResumenValidationRowProps) {
  const root_cause_class =
    row.esCausaRaiz?.toUpperCase() === "SI"
      ? "border border-black/30 p-1 text-xs text-center font-bold bg-red-500 text-white"
      : row.esCausaRaiz?.toUpperCase() === "NO"
        ? "border border-black/30 p-1 text-xs text-center font-bold bg-[#00B050] text-white"
        : RESUMEN_TD_CLASS;

  return (
    <tr>
      <td className={RESUMEN_TD_CLASS}>{row_index + 1}</td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <select
            value={row.categoria || "Máquina"}
            onChange={(change_event) => on_patch_row({ categoria: change_event.target.value })}
            className={RESUMEN_SELECT_CLASS}
          >
            {resolve_select_options(CATEGORIAS_6M_LIST, row.categoria).map((category_name) => (
              <option key={category_name} value={category_name}>
                {category_name}
              </option>
            ))}
          </select>
        ) : (
          row.categoria
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={row.causaPotencial || ""}
            onChange={(change_event) => on_patch_row({ causaPotencial: change_event.target.value })}
            placeholder="Causa potencial..."
            className={`${RESUMEN_INPUT_CLASS} text-left`}
          />
        ) : (
          row.causaPotencial
        )}
      </td>
      <td className={RESUMEN_TD_JUSTIFY_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={row.accion || ""}
            onChange={(change_event) => on_patch_row({ accion: change_event.target.value })}
            placeholder="Acción de validación..."
            className={`${RESUMEN_INPUT_CLASS} text-left`}
          />
        ) : (
          row.accion
        )}
      </td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <input
            type="text"
            value={row.responsable || ""}
            onChange={(change_event) => on_patch_row({ responsable: change_event.target.value })}
            placeholder="Responsable..."
            className={RESUMEN_INPUT_CLASS}
          />
        ) : (
          row.responsable
        )}
      </td>
      <td className={RESUMEN_TD_CLASS}>
        {is_editable ? (
          <input
            type="date"
            value={row.fechaLimite || ""}
            onChange={(change_event) => on_patch_row({ fechaLimite: change_event.target.value })}
            className={RESUMEN_INPUT_CLASS}
          />
        ) : (
          format_resumen_date(row.fechaLimite)
        )}
      </td>
      <td {...get_resumen_status_cell_props(row.estatus)}>
        {is_editable ? (
          <select
            value={row.estatus || "Pendiente"}
            onChange={(change_event) =>
              on_patch_row({ estatus: change_event.target.value as RdaValidationAction["estatus"] })
            }
            className="w-full bg-transparent text-xs text-center font-bold outline-none cursor-pointer"
          >
            <option value="Pendiente" className="text-black bg-white">Pendiente</option>
            <option value="En progreso" className="text-black bg-white">En progreso</option>
            <option value="Completa" className="text-black bg-white">Completa</option>
            <option value="Retrasado" className="text-black bg-white">Retrasado</option>
          </select>
        ) : (
          row.estatus
        )}
      </td>
      <td className={root_cause_class}>
        {is_editable ? (
          <div className="flex items-center justify-center gap-1">
            <select
              value={row.esCausaRaiz || "Pendiente"}
              onChange={(change_event) =>
                on_patch_row({
                  esCausaRaiz: change_event.target.value as RdaValidationAction["esCausaRaiz"],
                })
              }
              className="bg-transparent text-xs text-center font-bold outline-none cursor-pointer"
            >
              <option value="Pendiente" className="text-black bg-white">Pendiente</option>
              <option value="SI" className="text-black bg-white">SI</option>
              <option value="NO" className="text-black bg-white">NO</option>
            </select>
            <button
              type="button"
              onClick={on_delete_row}
              className="opacity-60 hover:opacity-100 text-current p-0.5 cursor-pointer print:hidden"
              title="Eliminar fila"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ) : (
          row.esCausaRaiz
        )}
      </td>
    </tr>
  );
}
