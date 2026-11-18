/**
 * @fileoverview Row 2 (department, area, trigger, affected equipment, auto-folio) for Fase 1 Resumen.
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaAnomalyContext } from "@/domain/models/rda";
import { OFFICIAL_AREAS, OFFICIAL_DEPARTAMENTOS } from "@/domain/pdca";
import { generate_next_rda_folio } from "../utils/rda_name";
import { normalize_official_value, resolve_select_options } from "../utils/rda_step_helpers";
import {
  RESUMEN_INPUT_CLASS,
  RESUMEN_SELECT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TH_CLASS,
} from "./rda_resumen_styles";

interface RdaResumenContextRow2Props {
  context: RdaAnomalyContext;
  all_rdas: Rda[];
  is_editable: boolean;
  on_change_context: (field_name: keyof RdaAnomalyContext, value: string) => void;
}

/** Renders Row 2 organizational metadata and folio assignment cells in Fase 1 Resumen. */
export function RdaResumenContextRow2({
  context,
  all_rdas,
  is_editable,
  on_change_context,
}: RdaResumenContextRow2Props) {
  const { t } = useTranslation();
  const depto_options = resolve_select_options(OFFICIAL_DEPARTAMENTOS, context?.departamento);
  const area_options = resolve_select_options(OFFICIAL_AREAS, context?.area);

  return (
    <>
      <tr>
        <th className={RESUMEN_TH_CLASS}>{t("rda.department")}</th>
        <th className={RESUMEN_TH_CLASS}>{t("rda.area")}</th>
        <th className={RESUMEN_TH_CLASS}>{t("rda.trigger")}</th>
        <th colSpan={2} className={RESUMEN_TH_CLASS}>
          {t("rda.affectedEquipment")}
        </th>
        <th className={RESUMEN_TH_CLASS}>{t("rda.rdaFolio")}</th>
      </tr>
      <tr>
        <td className={RESUMEN_TD_CLASS}>
          {is_editable ? (
            <select
              value={normalize_official_value(OFFICIAL_DEPARTAMENTOS, context?.departamento)}
              onChange={(change_event) =>
                on_change_context("departamento", change_event.target.value)
              }
              className={RESUMEN_SELECT_CLASS}
            >
              <option value="">Seleccionar...</option>
              {depto_options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            context.departamento || "-"
          )}
        </td>
        <td className={RESUMEN_TD_CLASS}>
          {is_editable ? (
            <select
              value={normalize_official_value(OFFICIAL_AREAS, context?.area)}
              onChange={(change_event) => on_change_context("area", change_event.target.value)}
              className={RESUMEN_SELECT_CLASS}
            >
              <option value="">Seleccionar...</option>
              {area_options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            context.area || "-"
          )}
        </td>
        <td className={RESUMEN_TD_CLASS}>
          {is_editable ? (
            <input
              type="text"
              value={context?.disparador || ""}
              onChange={(change_event) => on_change_context("disparador", change_event.target.value)}
              placeholder="Disparador..."
              className={RESUMEN_INPUT_CLASS}
            />
          ) : (
            context.disparador || "-"
          )}
        </td>
        <td colSpan={2} className={RESUMEN_TD_CLASS}>
          {is_editable ? (
            <input
              type="text"
              value={context?.equiposAfectados || ""}
              onChange={(change_event) =>
                on_change_context("equiposAfectados", change_event.target.value)
              }
              placeholder="Equipos afectados..."
              className={RESUMEN_INPUT_CLASS}
            />
          ) : (
            context.equiposAfectados || "-"
          )}
        </td>
        <td className={RESUMEN_TD_CLASS}>
          {is_editable ? (
            <div className="space-y-0.5">
              <input
                type="text"
                value={context?.folio || ""}
                onChange={(change_event) => on_change_context("folio", change_event.target.value)}
                placeholder="RDA_2026_01"
                className={`${RESUMEN_INPUT_CLASS} font-mono font-semibold`}
              />
              {!context?.folio?.trim() && (
                <button
                  type="button"
                  onClick={() => on_change_context("folio", generate_next_rda_folio(all_rdas))}
                  className="block w-full text-center text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer print:hidden"
                >
                  + Generar automático
                </button>
              )}
            </div>
          ) : (
            context.folio || "-"
          )}
        </td>
      </tr>
    </>
  );
}
