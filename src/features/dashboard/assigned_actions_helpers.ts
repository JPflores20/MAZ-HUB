/**
 * @fileoverview Pure aggregators and urgency calculators for the unified PDCA + RDA actions board.
 */

import { differenceInCalendarDays, isValid, parse, parseISO, startOfDay } from "date-fns";
import { get_rda_display_name } from "@/features/rda";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";

/** Unified representation of any open or completed action from PDCA or RDA records. */
export interface UnifiedActionItem {
  id: string;
  module: "PDCA" | "RDA";
  subType: string;
  projectId: string;
  projectTitle: string;
  description: string;
  owner: string;
  deadlineRaw: string;
  deadlineDate: Date | null;
  done: boolean;
  urgency: "completed" | "overdue" | "soon" | "ontime";
  daysDiff: number | null;
}

const URGENCY_PRIORITY_ORDER: Record<UnifiedActionItem["urgency"], number> = {
  overdue: 0,
  soon: 1,
  ontime: 2,
  completed: 3,
};

/** Parses ISO (`yyyy-MM-dd`) or localized (`dd/MM/yyyy`) action deadlines cleanly. */
export function parse_flexible_action_date(raw_value?: string): Date | null {
  if (!raw_value) return null;
  const trimmed = raw_value.trim();
  if (!trimmed || trimmed === "Sin fecha") return null;

  const parsed_iso = parseISO(trimmed);
  if (isValid(parsed_iso)) return startOfDay(parsed_iso);

  const parsed_dmy = parse(trimmed, "dd/MM/yyyy", new Date());
  if (isValid(parsed_dmy)) return startOfDay(parsed_dmy);

  return null;
}

/** Computes urgency status (`completed`, `overdue`, `soon`, `ontime`) and remaining day delta. */
export function compute_action_urgency(
  is_done: boolean,
  deadline_date: Date | null,
): { urgency: UnifiedActionItem["urgency"]; daysDiff: number | null } {
  if (is_done) return { urgency: "completed", daysDiff: null };
  if (!deadline_date) return { urgency: "ontime", daysDiff: null };

  const today = startOfDay(new Date());
  const days_difference = differenceInCalendarDays(deadline_date, today);
  if (days_difference < 0) return { urgency: "overdue", daysDiff: days_difference };
  if (days_difference <= 7) return { urgency: "soon", daysDiff: days_difference };
  return { urgency: "ontime", daysDiff: days_difference };
}

function build_action_item(params: {
  id: string;
  module: "PDCA" | "RDA";
  sub_type: string;
  project_id: string;
  project_title: string;
  description: string;
  owner: string;
  deadline_raw: string;
  is_done: boolean;
}): UnifiedActionItem | null {
  const clean_description = params.description.trim();
  if (!clean_description) return null;

  const trimmed_deadline = params.deadline_raw.trim();
  const deadline_date = parse_flexible_action_date(trimmed_deadline);
  const { urgency, daysDiff } = compute_action_urgency(params.is_done, deadline_date);

  return {
    id: params.id,
    module: params.module,
    subType: params.sub_type,
    projectId: params.project_id,
    projectTitle: params.project_title,
    description: clean_description,
    owner: params.owner.trim() || "Sin asignar",
    deadlineRaw: trimmed_deadline || "Sin fecha",
    deadlineDate: deadline_date,
    done: params.is_done,
    urgency,
    daysDiff,
  };
}

/** Collects and urgency-sorts all actions across visible PDCAs and RDAs. */
export function collect_unified_actions(pdcas: Pdca[], rdas: Rda[]): UnifiedActionItem[] {
  const collected: UnifiedActionItem[] = [];

  const append_if_valid = (candidate: UnifiedActionItem | null) => {
    if (candidate) collected.push(candidate);
  };

  pdcas.forEach((pdca_entry) => {
    (pdca_entry.acciones || []).forEach((action_row, row_index) => {
      append_if_valid(
        build_action_item({
          id: `pdca-${pdca_entry.id}-${action_row.id || row_index}`,
          module: "PDCA",
          sub_type: "Fase DO",
          project_id: pdca_entry.id,
          project_title: pdca_entry.titulo || `PDCA ${pdca_entry.id}`,
          description: action_row.accion || action_row.what || action_row.tema || "",
          owner: action_row.responsable || action_row.who || "",
          deadline_raw: action_row.fecha || action_row.when || "",
          is_done: Boolean(action_row.done || action_row.status === "Completada"),
        }),
      );
    });
  });

  rdas.forEach((rda_entry) => {
    const rda_title = get_rda_display_name(rda_entry, `RDA ${rda_entry.id}`);

    (rda_entry.pda || []).forEach((pda_row, row_index) => {
      append_if_valid(
        build_action_item({
          id: `rda-pda-${rda_entry.id}-${pda_row.id || row_index}`,
          module: "RDA",
          sub_type: "PDA (Paso 12)",
          project_id: rda_entry.id,
          project_title: rda_title,
          description: pda_row.accion || pda_row.what || pda_row.tema || "",
          owner: pda_row.responsable || pda_row.who || "",
          deadline_raw: pda_row.fecha || pda_row.when || "",
          is_done: Boolean(pda_row.done || pda_row.status === "Completada"),
        }),
      );
    });

    (rda_entry.immediateActions || []).forEach((imm_row, row_index) => {
      append_if_valid(
        build_action_item({
          id: `rda-imm-${rda_entry.id}-${imm_row.id || row_index}`,
          module: "RDA",
          sub_type: "Contención (Paso 3)",
          project_id: rda_entry.id,
          project_title: rda_title,
          description: imm_row.accion || imm_row.causaPotencial || "",
          owner: imm_row.responsable || "",
          deadline_raw: imm_row.fechaLimite || "",
          is_done: Boolean(imm_row.estatus === "Completa"),
        }),
      );
    });

    (rda_entry.validationActions || []).forEach((val_row, row_index) => {
      append_if_valid(
        build_action_item({
          id: `rda-val-${rda_entry.id}-${val_row.id || row_index}`,
          module: "RDA",
          sub_type: "Validación (Paso 9)",
          project_id: rda_entry.id,
          project_title: rda_title,
          description: val_row.accion || val_row.causaPotencial || "",
          owner: val_row.responsable || "",
          deadline_raw: val_row.fechaLimite || "",
          is_done: Boolean(
            val_row.estatus === "Completa" ||
              val_row.esCausaRaiz === "SI" ||
              val_row.esCausaRaiz === "NO",
          ),
        }),
      );
    });
  });

  return collected.sort((left_item, right_item) => {
    if (URGENCY_PRIORITY_ORDER[left_item.urgency] !== URGENCY_PRIORITY_ORDER[right_item.urgency]) {
      return URGENCY_PRIORITY_ORDER[left_item.urgency] - URGENCY_PRIORITY_ORDER[right_item.urgency];
    }
    if (left_item.daysDiff !== null && right_item.daysDiff !== null) {
      return left_item.daysDiff - right_item.daysDiff;
    }
    return 0;
  });
}
