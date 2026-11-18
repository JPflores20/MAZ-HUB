/**
 * @fileoverview Printable and inline-editable Context & Identification table for Fase 1 Resumen.
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaAnomalyContext } from "@/domain/models/rda";
import { OFFICIAL_ETAPAS, OFFICIAL_PLANTAS } from "@/domain/pdca";
import type { DirectoryUser } from "@/features/auth/auth_context";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { RdaResponsibleCell } from "../utils/rda_responsible_cell";
import { normalize_official_value, resolve_select_options } from "../utils/rda_step_helpers";
import { RdaResumenContextImpactRow } from "./rda_resumen_context_impact_row";
import { RdaResumenContextRow2 } from "./rda_resumen_context_row2";
import {
  format_resumen_date,
  RESUMEN_INPUT_CLASS,
  RESUMEN_SELECT_CLASS,
  RESUMEN_TD_CLASS,
  RESUMEN_TH_CLASS,
} from "./rda_resumen_styles";

interface RdaResumenContextTableProps {
  rda: Rda;
  all_rdas: Rda[];
  is_editable: boolean;
  responsibles_list: string[];
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_change_context: (field_name: keyof RdaAnomalyContext, value: string) => void;
  on_toggle_responsible: (user_name: string) => void;
  on_add_custom_responsible: (custom_name: string) => void;
}

/** Displays plant, date, team, initiators, responsibles, area, trigger, equipment, folio, and impact. */
export function RdaResumenContextTable({
  rda,
  all_rdas,
  is_editable,
  responsibles_list,
  available_users,
  resolve_user,
  on_change_context,
  on_toggle_responsible,
  on_add_custom_responsible,
}: RdaResumenContextTableProps) {
  const { t } = useTranslation();
  const context = rda.context;

  const planta_options = resolve_select_options(OFFICIAL_PLANTAS, context?.planta);
  const etapa_options = resolve_select_options(OFFICIAL_ETAPAS, context?.etapa);

  return (
    <table className="w-full border-collapse mb-6">
      <tbody>
        <tr>
          <th className={RESUMEN_TH_CLASS}>{t("rda.plant")}</th>
          <th className={RESUMEN_TH_CLASS}>{t("rda.anomalyDate")}</th>
          <th className={RESUMEN_TH_CLASS}>{t("rda.shiftTeam")}</th>
          <th className={RESUMEN_TH_CLASS}>{t("rda.initiatedBy")}</th>
          <th className={RESUMEN_TH_CLASS}>{t("rda.responsible")}</th>
          <th className={RESUMEN_TH_CLASS}>{t("rda.stage")}</th>
        </tr>
        <tr>
          <td className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <select
                value={normalize_official_value(OFFICIAL_PLANTAS, context?.planta)}
                onChange={(change_event) => on_change_context("planta", change_event.target.value)}
                className={RESUMEN_SELECT_CLASS}
              >
                <option value="">Seleccionar...</option>
                {planta_options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              context.planta || "-"
            )}
          </td>
          <td className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <input
                type="text"
                value={context?.fecha || ""}
                onChange={(change_event) => on_change_context("fecha", change_event.target.value)}
                placeholder="Ej. 15-oct o 2026-10-15"
                className={RESUMEN_INPUT_CLASS}
              />
            ) : (
              format_resumen_date(context.fecha)
            )}
          </td>
          <td className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <input
                type="text"
                value={context?.turno || ""}
                onChange={(change_event) => on_change_context("turno", change_event.target.value)}
                placeholder="Turno / Equipo"
                className={RESUMEN_INPUT_CLASS}
              />
            ) : (
              context.turno || "-"
            )}
          </td>
          <td className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <input
                type="text"
                value={context?.iniciadoPor || ""}
                onChange={(change_event) =>
                  on_change_context("iniciadoPor", change_event.target.value)
                }
                placeholder="Nombre de quien inicia"
                className={RESUMEN_INPUT_CLASS}
              />
            ) : (
              context.iniciadoPor || "-"
            )}
          </td>
          <td className={RESUMEN_TD_CLASS}>
            <RdaResponsibleCell
              assigned_names={responsibles_list}
              available_users={available_users}
              resolve_user={resolve_user}
              is_editable={is_editable}
              on_toggle_user={on_toggle_responsible}
              on_add_custom_name={on_add_custom_responsible}
              compact_trigger_variant="table"
            />
          </td>
          <td className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <select
                value={normalize_official_value(OFFICIAL_ETAPAS, context?.etapa)}
                onChange={(change_event) => on_change_context("etapa", change_event.target.value)}
                className={RESUMEN_SELECT_CLASS}
              >
                <option value="">Seleccionar...</option>
                {etapa_options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              context.etapa || "-"
            )}
          </td>
        </tr>

        <RdaResumenContextRow2
          context={context}
          all_rdas={all_rdas}
          is_editable={is_editable}
          on_change_context={on_change_context}
        />

        <RdaResumenContextImpactRow
          context={context}
          is_editable={is_editable}
          on_change_context={on_change_context}
        />
      </tbody>
    </table>
  );
}
