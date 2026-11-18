/**
 * @fileoverview Pure executive dashboard KPI, recent movements, and upcoming tasks aggregator.
 */

import { get_rda_display_name, get_rda_status } from "@/features/rda";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import { get_computed_pdca_progress } from "./pdca_progress_helpers";

export interface RecentMovementItem {
  id: string;
  title: string;
  area: string;
  date: string;
  progress: number;
  phase: string;
  type: "PDCA" | "RDA";
}

export interface UpcomingTaskItem {
  id: string;
  description: string;
  deadline: string;
  owner: string;
  type: "PDCA" | "RDA";
}

/** Maps RDA lifecycle status to an executive completion percentage. */
export function get_rda_computed_progress(rda_record: Rda): number {
  const rda_status = get_rda_status(rda_record);
  if (rda_status === "Evaluado") return 100;
  if (rda_status === "Cerrado") return 75;
  if (rda_status === "Abierto") return 25;
  return 0;
}

/** Aggregates unified KPI totals, upcoming tasks, and 5 most recent projects across PDCA and RDA modules. */
export function build_executive_dashboard_summary(
  visible_pdcas: Pdca[],
  visible_rdas: Rda[],
): {
  active_count: number;
  closed_count: number;
  average_progress: number;
  pending_count: number;
  upcoming_tasks: UpcomingTaskItem[];
  recent_movements: RecentMovementItem[];
} {
  const active_pdcas = visible_pdcas.filter((entry) => entry.fase !== "Act").length;
  const active_rdas = visible_rdas.filter((entry) => get_rda_status(entry) === "Abierto").length;
  const closed_pdcas = visible_pdcas.filter((entry) => entry.fase === "Act").length;
  const closed_rdas = visible_rdas.filter((entry) => get_rda_status(entry) !== "Abierto").length;

  const total_projects = visible_pdcas.length + visible_rdas.length;
  const total_progress =
    visible_pdcas.reduce((acc, pdca_entry) => acc + get_computed_pdca_progress(pdca_entry), 0) +
    visible_rdas.reduce((acc, rda_entry) => acc + get_rda_computed_progress(rda_entry), 0);

  const pending_pdca_actions = visible_pdcas
    .flatMap((entry) => entry.acciones || [])
    .filter((action_entry) => !action_entry.done && action_entry.status !== "Completada");
  const pending_rda_pda_actions = visible_rdas
    .flatMap((entry) => entry.pda || [])
    .filter((action_entry) => !action_entry.done && action_entry.status !== "Completada");
  const pending_rda_imm_actions = visible_rdas
    .flatMap((entry) => entry.immediateActions || [])
    .filter((action_entry) => action_entry.estatus !== "Completa");

  const upcoming_tasks: UpcomingTaskItem[] = [
    ...pending_pdca_actions.map((task_entry) => ({
      id: `pdca-${task_entry.id}`,
      description: task_entry.what || task_entry.accion || task_entry.tema || "Sin descripción",
      deadline: task_entry.when || task_entry.fecha || "Sin fecha",
      owner: task_entry.who || task_entry.responsable || "Sin asignar",
      type: "PDCA" as const,
    })),
    ...pending_rda_pda_actions.map((task_entry) => ({
      id: `rda-pda-${task_entry.id}`,
      description: task_entry.what || task_entry.accion || task_entry.tema || "Sin descripción",
      deadline: task_entry.when || task_entry.fecha || "Sin fecha",
      owner: task_entry.who || task_entry.responsable || "Sin asignar",
      type: "RDA" as const,
    })),
    ...pending_rda_imm_actions.map((task_entry) => ({
      id: `rda-imm-${task_entry.id}`,
      description: task_entry.accion || task_entry.causaPotencial || "Sin descripción",
      deadline: task_entry.fechaLimite || "Sin fecha",
      owner: task_entry.responsable || "Sin asignar",
      type: "RDA" as const,
    })),
  ];

  const recent_movements: RecentMovementItem[] = [
    ...visible_pdcas.map((pdca_entry) => ({
      id: pdca_entry.id,
      title: pdca_entry.titulo || "Sin título",
      area: pdca_entry.area,
      date: pdca_entry.actualizado,
      progress: get_computed_pdca_progress(pdca_entry),
      phase: pdca_entry.fase,
      type: "PDCA" as const,
    })),
    ...visible_rdas.map((rda_entry) => ({
      id: rda_entry.id,
      title: get_rda_display_name(rda_entry, "Sin título"),
      area: rda_entry.context?.planta || "Otra",
      date: new Date(rda_entry.updatedAt || Date.now()).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      progress: get_rda_computed_progress(rda_entry),
      phase: get_rda_status(rda_entry),
      type: "RDA" as const,
    })),
  ]
    .sort((left_item, right_item) => right_item.id.localeCompare(left_item.id))
    .slice(0, 5);

  return {
    active_count: active_pdcas + active_rdas,
    closed_count: closed_pdcas + closed_rdas,
    average_progress: total_projects === 0 ? 0 : Math.round(total_progress / total_projects),
    pending_count: upcoming_tasks.length,
    upcoming_tasks,
    recent_movements,
  };
}
