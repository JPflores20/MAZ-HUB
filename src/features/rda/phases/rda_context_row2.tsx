/**
 * @fileoverview Row 2 (department, area, trigger, equipment, auto-folio) for RdaContextForm.
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaAnomalyContext } from "@/domain/models/rda";
import { OFFICIAL_AREAS, OFFICIAL_DEPARTAMENTOS } from "@/domain/pdca";
import { Input } from "@/shared/ui/input";
import { TableCell, TableHead, TableRow } from "@/shared/ui/table";
import { generate_next_rda_folio } from "../utils/rda_name";
import { normalize_official_value, resolve_select_options } from "../utils/rda_step_helpers";

interface RdaContextRow2Props {
  context: RdaAnomalyContext;
  all_rdas: Rda[];
  disabled?: boolean | undefined;
  head_class: string;
  cell_class: string;
  input_class: string;
  select_class: string;
  on_change_field: (field_name: keyof RdaAnomalyContext, value: string) => void;
}

/** Renders Row 2 organizational selectors, trigger/equipment inputs, and folio generator. */
export function RdaContextRow2({
  context,
  all_rdas,
  disabled,
  head_class,
  cell_class,
  input_class,
  select_class,
  on_change_field,
}: RdaContextRow2Props) {
  const { t } = useTranslation();
  const departamento_options = resolve_select_options(OFFICIAL_DEPARTAMENTOS, context.departamento);
  const area_options = resolve_select_options(OFFICIAL_AREAS, context.area);

  return (
    <>
      <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
        <TableHead className={head_class}>{t("rdaInternal.thDepartamento")}</TableHead>
        <TableHead className={head_class}>{t("rdaInternal.thArea")}</TableHead>
        <TableHead className={head_class}>{t("rdaInternal.thDisparador")}</TableHead>
        <TableHead colSpan={2} className={head_class}>
          {t("rdaInternal.thEquipoAfectado")}
        </TableHead>
        <TableHead className={`${head_class} border-r-0`}>{t("rdaInternal.thFolioRda")}</TableHead>
      </TableRow>

      <TableRow className="border-b border-border">
        <TableCell className={cell_class}>
          <select
            className={select_class}
            disabled={disabled}
            value={normalize_official_value(OFFICIAL_DEPARTAMENTOS, context.departamento)}
            onChange={(change_event) => on_change_field("departamento", change_event.target.value)}
          >
            <option value="">Seleccionar departamento...</option>
            {departamento_options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </TableCell>
        <TableCell className={cell_class}>
          <select
            className={select_class}
            disabled={disabled}
            value={normalize_official_value(OFFICIAL_AREAS, context.area)}
            onChange={(change_event) => on_change_field("area", change_event.target.value)}
          >
            <option value="">Seleccionar área...</option>
            {area_options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </TableCell>
        <TableCell className={cell_class}>
          <Input
            className={input_class}
            value={context.disparador}
            onChange={(change_event) => on_change_field("disparador", change_event.target.value)}
            placeholder={t("rdaInternal.phDisparador")}
          />
        </TableCell>
        <TableCell colSpan={2} className={cell_class}>
          <Input
            className={input_class}
            value={context.equiposAfectados}
            onChange={(change_event) =>
              on_change_field("equiposAfectados", change_event.target.value)
            }
            placeholder={t("rdaInternal.phEquipoAfectado")}
          />
        </TableCell>
        <TableCell className="p-2 align-top">
          <div className="space-y-1">
            <Input
              className={`${input_class} font-mono font-semibold`}
              value={context.folio}
              onChange={(change_event) => on_change_field("folio", change_event.target.value)}
              placeholder="RDA_2026_01"
            />
            {!context.folio?.trim() && !disabled && (
              <button
                type="button"
                onClick={() => on_change_field("folio", generate_next_rda_folio(all_rdas))}
                className="w-full text-center text-[10px] font-semibold text-primary hover:underline cursor-pointer"
              >
                + Generar automático
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
