/**
 * @fileoverview Shared assignee mutation, avatar handler builder, and Excel export helpers for PDCA views.
 */

import { toast } from "sonner";
import * as xlsx from "xlsx";
import { sanitize_rows_for_spreadsheet } from "@/core/security";
import type { Pdca } from "@/domain/pdca";
import type { DirectoryUser } from "@/features/auth/auth_context";
import { update_pdca_assigned_users } from "@/shared/services/pdca/pdca_firestore_mutations";
import { get_computed_pdca_progress } from "./pdca_progress_helpers";

export type TogglePdcaUserHandler = (
  pdca_entry: Pdca,
  target_user: { name: string; email: string },
) => Promise<void>;

/** Toggles a collaborator assignment on a PDCA document in Firestore and refreshes state. */
export async function toggle_pdca_assigned_user(
  pdca_entry: Pdca,
  target_user: { name: string; email: string },
  refresh_pdcas: () => Promise<void>,
): Promise<void> {
  const current_assigned = pdca_entry.asignados || [];
  const matches_user = (assignee: { name: string; email: string }) =>
    (target_user.email && assignee.email.toLowerCase() === target_user.email.toLowerCase()) ||
    assignee.name.toLowerCase() === target_user.name.toLowerCase();

  const next_assigned = current_assigned.some(matches_user)
    ? current_assigned.filter((assignee) => !matches_user(assignee))
    : [...current_assigned, target_user];

  try {
    await update_pdca_assigned_users(pdca_entry.id, next_assigned);
    await refresh_pdcas();
  } catch (assign_error) {
    console.error("Error al asignar usuarios al PDCA:", assign_error);
    toast.error("No se pudo actualizar la asignación de usuarios.");
  }
}

/** Builds optional ResponsibleAvatarStack callbacks gated by edit/assignment permissions. */
export function build_assignee_handlers(
  pdca_entry: Pdca,
  allow_assign: boolean,
  on_toggle_pdca_user: TogglePdcaUserHandler,
) {
  const handle_directory_user = (target_user: DirectoryUser) => {
    void on_toggle_pdca_user(pdca_entry, {
      name: target_user.name,
      email: target_user.email,
    });
  };

  return {
    onToggleUser: allow_assign ? handle_directory_user : undefined,
    onRemoveUser: allow_assign ? handle_directory_user : undefined,
    onAddCustomName: allow_assign
      ? (custom_name: string) =>
          void on_toggle_pdca_user(pdca_entry, {
            name: custom_name.toUpperCase(),
            email: `${custom_name.toLowerCase().replace(/\s+/g, ".")}@colaborador.local`,
          })
      : undefined,
  };
}

/** Exports the filtered PDCA rows into a formula-injection-sanitized Excel workbook. */
export function export_pdcas_to_excel(rows: Pdca[]): void {
  const sanitized_rows = sanitize_rows_for_spreadsheet(
    rows.map((pdca_entry) => ({
      ID: pdca_entry.id,
      "Título del Proyecto": pdca_entry.titulo,
      "Responsables Asignados":
        (pdca_entry.asignados || []).map((assignee) => assignee.name).join(", ") || "Sin asignar",
      "Autor / Creador": pdca_entry.autor || "Sin autor",
      "Email del Autor": pdca_entry.autorEmail || "",
      Área: pdca_entry.area,
      "Fase Actual": pdca_entry.fase,
      "Progreso (%)": get_computed_pdca_progress(pdca_entry),
      "Fecha Límite": pdca_entry.fechaFinalizacion || "Sin asignar",
      "Última Actualización": pdca_entry.actualizado,
    })),
  );

  const worksheet = xlsx.utils.json_to_sheet(sanitized_rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Proyectos");
  xlsx.writeFile(workbook, "Proyectos_PDCA.xlsx");
}
