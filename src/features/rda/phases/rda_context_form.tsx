/**
 * @fileoverview General operational context table form for an RDA (plant, date, owners, trigger, equipment, folio).
 */

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { RdaAnomalyContext } from "@/domain/models/rda";
import { OFFICIAL_ETAPAS, OFFICIAL_PLANTAS } from "@/domain/pdca";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { useRdas } from "@/shared/context/rda_context";
import { Calendar } from "@/shared/ui/calendar";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { RdaResponsibleCell } from "../utils/rda_responsible_cell";
import { normalize_official_value, resolve_select_options } from "../utils/rda_step_helpers";
import { RdaContextRow2 } from "./rda_context_row2";
import { RdaContextImpactRow } from "./rda_context_rows";

interface RdaContextFormProps {
  context: RdaAnomalyContext;
  onChange: (context: RdaAnomalyContext) => void;
  disabled?: boolean | undefined;
}

const HEAD_CLASS =
  "font-bold text-white uppercase text-center border-r border-white/20 text-[10px] bg-[#0078D7] py-2 h-auto";
const CELL_CLASS = "p-2 align-top border-r border-border bg-card text-foreground";
const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background text-foreground px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const SELECT_CLASS =
  "w-full h-9 rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer";

function parse_context_date(raw_date?: string): Date | undefined {
  if (!raw_date) return undefined;
  const spanish_parsed = parse(raw_date, "dd-MMM", new Date(), { locale: es });
  if (isValid(spanish_parsed)) return spanish_parsed;
  const fallback_date = new Date(raw_date);
  return isValid(fallback_date) ? fallback_date : undefined;
}

/** Displays editable general data & impact tables for Step 1 of an RDA report. */
export function RdaContextForm({ context, onChange, disabled }: RdaContextFormProps) {
  const { t } = useTranslation();
  const { directory: available_users, resolve_user } = useDirectoryUsers();
  const { allRdas: all_rdas } = useRdas();
  const [is_calendar_open, set_is_calendar_open] = useState(false);

  const assigned_list = useMemo(
    () => (context.responsable || "").split(",").map((person) => person.trim()).filter(Boolean),
    [context.responsable],
  );

  const handle_change = (field_name: keyof RdaAnomalyContext, value: string) => {
    if (disabled) return;
    onChange({ ...context, [field_name]: value });
  };

  const toggle_responsible = (person_name: string) => {
    if (disabled) return;
    const normalized = person_name.trim();
    if (!normalized) return;
    const exists = assigned_list.some((item) => item.toLowerCase() === normalized.toLowerCase());
    const next_list = exists
      ? assigned_list.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
      : [...assigned_list, normalized];
    handle_change("responsable", next_list.join(", "));
  };

  const add_custom_responsible = (custom_name: string) => {
    if (!assigned_list.some((item) => item.toLowerCase() === custom_name.toLowerCase())) {
      handle_change("responsable", [...assigned_list, custom_name].join(", "));
    }
  };

  const planta_options = resolve_select_options(OFFICIAL_PLANTAS, context.planta);
  const etapa_options = resolve_select_options(OFFICIAL_ETAPAS, context.etapa);

  return (
    <div className="border rounded-md overflow-x-auto bg-card text-foreground shadow-sm">
      <Table className="min-w-[1000px] text-xs">
        <TableHeader>
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={HEAD_CLASS}>{t("rdaInternal.thPlanta")}</TableHead>
            <TableHead className={HEAD_CLASS}>{t("rdaInternal.thFecha")}</TableHead>
            <TableHead className={HEAD_CLASS}>{t("rdaInternal.thTurno")}</TableHead>
            <TableHead className={HEAD_CLASS}>{t("rdaInternal.thIniciadoPor")}</TableHead>
            <TableHead className={HEAD_CLASS}>{t("rdaInternal.thResponsable")}</TableHead>
            <TableHead className={`${HEAD_CLASS} border-r-0`}>{t("rdaInternal.thEtapa")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-b border-border">
            <TableCell className={CELL_CLASS}>
              <select
                className={SELECT_CLASS}
                disabled={disabled}
                value={normalize_official_value(OFFICIAL_PLANTAS, context.planta)}
                onChange={(change_event) => handle_change("planta", change_event.target.value)}
              >
                <option value="">Seleccionar planta...</option>
                {planta_options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </TableCell>
            <TableCell className={CELL_CLASS}>
              <Popover open={is_calendar_open} onOpenChange={set_is_calendar_open}>
                <PopoverTrigger asChild>
                  <Input
                    className={INPUT_CLASS}
                    value={context.fecha}
                    onChange={(change_event) => handle_change("fecha", change_event.target.value)}
                    placeholder={t("rdaInternal.phFecha")}
                    disabled={disabled}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parse_context_date(context.fecha)}
                    onSelect={(picked_date) => {
                      if (picked_date) handle_change("fecha", format(picked_date, "dd-MMM", { locale: es }));
                      set_is_calendar_open(false);
                    }}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell className={CELL_CLASS}>
              <Input
                className={INPUT_CLASS}
                value={context.turno}
                onChange={(change_event) => handle_change("turno", change_event.target.value)}
                placeholder={t("rdaInternal.phTurno")}
              />
            </TableCell>
            <TableCell className={CELL_CLASS}>
              <Input
                className={INPUT_CLASS}
                value={context.iniciadoPor}
                onChange={(change_event) => handle_change("iniciadoPor", change_event.target.value)}
                placeholder={t("rdaInternal.phIniciadoPor")}
              />
            </TableCell>
            <TableCell className={CELL_CLASS}>
              <RdaResponsibleCell
                assigned_names={assigned_list}
                available_users={available_users}
                resolve_user={resolve_user}
                is_editable={!disabled}
                on_toggle_user={toggle_responsible}
                on_add_custom_name={add_custom_responsible}
                compact_trigger_variant="form"
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <select
                className={SELECT_CLASS}
                disabled={disabled}
                value={normalize_official_value(OFFICIAL_ETAPAS, context.etapa)}
                onChange={(change_event) => handle_change("etapa", change_event.target.value)}
              >
                <option value="">Seleccionar etapa...</option>
                {etapa_options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </TableCell>
          </TableRow>

          <RdaContextRow2
            context={context}
            all_rdas={all_rdas}
            disabled={disabled}
            head_class={HEAD_CLASS}
            cell_class={CELL_CLASS}
            input_class={INPUT_CLASS}
            select_class={SELECT_CLASS}
            on_change_field={handle_change}
          />

          <RdaContextImpactRow
            context={context}
            head_class={HEAD_CLASS}
            cell_class={CELL_CLASS}
            input_class={INPUT_CLASS}
            on_change_field={handle_change}
          />
        </TableBody>
      </Table>
    </div>
  );
}
