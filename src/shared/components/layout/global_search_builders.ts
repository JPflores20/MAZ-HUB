/**
 * @fileoverview Pure search index builders converting PDCAs, RDAs, actions, and directory users into command palette items.
 */

import { get_rda_display_name } from "@/features/rda/utils/rda_name";
import { get_rda_status } from "@/features/rda/utils/rda_status";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import type { UserPermissions } from "@/features/auth/user_service";
import { can_user_access_pdca, can_user_access_rda } from "@/shared/components/access_request";
import type { DirectoryUser } from "@/shared/components/responsible_profile";

/** Filter tabs supported by GlobalSearchDialog. */
export type SearchCategory = "ALL" | "PDCA" | "RDA" | "ACTION" | "USER";

/** Single normalized search result row rendered inside the command palette. */
export interface SearchResultItem {
  id: string;
  category: "PDCA" | "RDA" | "ACTION" | "USER";
  title: string;
  subtitle: string;
  badgeText: string;
  restricted?: boolean | undefined;
  onSelect: () => void;
}

/**
 * Persists a record identifier into sessionStorage so target views auto-open the chosen item.
 *
 * @param {string} storage_key - Target sessionStorage key (`maz_hub_open_pdca_id` or `maz_hub_open_rda_id`).
 * @param {string} target_id - Record ID to highlight upon route transition.
 */
function persist_target_open_id(storage_key: string, target_id: string): void {
  try {
    sessionStorage.setItem(storage_key, target_id);
  } catch {
    // Ignore storage access errors in private browsing modes
  }
}

/**
 * Appends searchable PDCA records and nested PDCA actions to the index.
 */
export function append_pdca_search_items(params: {
  all_pdcas: Pdca[];
  current_user: UserProfile | null;
  permissions: UserPermissions | undefined;
  on_navigate: (route_path: "/" | "/rda" | "/dashboard") => void;
  collected_items: SearchResultItem[];
}): void {
  const { all_pdcas, current_user, permissions, on_navigate, collected_items } = params;

  all_pdcas.forEach((pdca_entry) => {
    const has_access = can_user_access_pdca(pdca_entry, current_user, permissions);
    const select_pdca = () => {
      persist_target_open_id("maz_hub_open_pdca_id", pdca_entry.id);
      on_navigate("/");
    };

    collected_items.push({
      id: `pdca-${pdca_entry.id}`,
      category: "PDCA",
      title: pdca_entry.titulo || `PDCA ${pdca_entry.id}`,
      subtitle: `${pdca_entry.id} • ${pdca_entry.area || "Sin área"} • Autor: ${pdca_entry.autor || "-"} • ${pdca_entry.problema || ""}`,
      badgeText: has_access ? pdca_entry.fase || "Plan" : "Solicitar permiso",
      restricted: !has_access,
      onSelect: select_pdca,
    });

    (pdca_entry.acciones || []).forEach((action_entry, action_index) => {
      const action_description = (
        action_entry.accion ||
        action_entry.what ||
        action_entry.tema ||
        ""
      ).trim();
      if (!action_description) {
        return;
      }
      collected_items.push({
        id: `act-pdca-${pdca_entry.id}-${action_entry.id || action_index}`,
        category: "ACTION",
        title: action_description,
        subtitle: `PDCA: ${pdca_entry.titulo || pdca_entry.id} • Resp: ${action_entry.responsable || action_entry.who || "Sin asignar"}`,
        badgeText:
          action_entry.done || action_entry.status === "Completada" ? "Completada" : "Acción PDCA",
        restricted: !has_access,
        onSelect: select_pdca,
      });
    });
  });
}

/**
 * Appends searchable RDA reports and nested PDA actions to the index.
 */
export function append_rda_search_items(params: {
  all_rdas: Rda[];
  current_user: UserProfile | null;
  permissions: UserPermissions | undefined;
  on_navigate: (route_path: "/" | "/rda" | "/dashboard") => void;
  collected_items: SearchResultItem[];
}): void {
  const { all_rdas, current_user, permissions, on_navigate, collected_items } = params;

  all_rdas.forEach((rda_entry) => {
    const has_access = can_user_access_rda(rda_entry, current_user, permissions);
    const rda_title = get_rda_display_name(rda_entry, `RDA ${rda_entry.id}`);
    const rda_status = get_rda_status(rda_entry);
    const select_rda = () => {
      persist_target_open_id("maz_hub_open_rda_id", rda_entry.id);
      on_navigate("/rda");
    };

    collected_items.push({
      id: `rda-${rda_entry.id}`,
      category: "RDA",
      title: rda_title,
      subtitle: `Folio: ${rda_entry.context?.folio || rda_entry.id} • ${rda_entry.context?.area || rda_entry.context?.planta || ""} • Equipo: ${rda_entry.context?.equiposAfectados || "-"}`,
      badgeText: has_access ? rda_status : "Solicitar permiso",
      restricted: !has_access,
      onSelect: select_rda,
    });

    (rda_entry.pda || []).forEach((pda_action, action_index) => {
      const action_description = (
        pda_action.accion ||
        pda_action.what ||
        pda_action.tema ||
        ""
      ).trim();
      if (!action_description) {
        return;
      }
      collected_items.push({
        id: `act-rda-${rda_entry.id}-${pda_action.id || action_index}`,
        category: "ACTION",
        title: action_description,
        subtitle: `RDA: ${rda_title} • Resp: ${pda_action.responsable || pda_action.who || "Sin asignar"}`,
        badgeText:
          pda_action.done || pda_action.status === "Completada" ? "Completada" : "PDA RDA",
        restricted: !has_access,
        onSelect: select_rda,
      });
    });
  });
}

/**
 * Appends directory users as searchable entries routing admins to user configuration.
 */
export function append_directory_search_items(params: {
  directory: DirectoryUser[];
  is_admin: boolean;
  on_open_user_settings: (target_uid: string) => void;
  on_navigate_dashboard: () => void;
  collected_items: SearchResultItem[];
}): void {
  const { directory, is_admin, on_open_user_settings, on_navigate_dashboard, collected_items } =
    params;

  directory.forEach((directory_user, user_index) => {
    collected_items.push({
      id: `user-${directory_user.uid || directory_user.email || user_index}`,
      category: "USER",
      title: directory_user.name,
      subtitle: `${directory_user.email || "Sin correo"} • ${directory_user.area || "Sin área"} ${directory_user.position ? `• ${directory_user.position}` : ""}`,
      badgeText: directory_user.role === "admin" ? "Admin" : "Usuario",
      onSelect: () => {
        if (is_admin && directory_user.uid) {
          on_open_user_settings(directory_user.uid);
        } else {
          on_navigate_dashboard();
        }
      },
    });
  });
}
