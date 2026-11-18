/**
 * @fileoverview Hook orchestrating RDA bank listing, filters, deep-linking, responsible toggles, and CRUD.
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Rda } from "@/domain/models/rda";
import { useAuth } from "@/features/auth/auth_context";
import {
  type AccessRequestTarget,
  build_rda_access_target,
  can_user_access_rda,
  can_user_delete_rda,
  can_user_edit_rda,
} from "@/shared/components/access_request";
import { useRdas } from "@/shared/context/rda_context";
import { delete_rda, update_rda } from "@/shared/services/rda/rda_firestore_mutations";
import {
  build_new_rda_record,
  build_rda_available_areas,
  build_toggled_responsible_rda,
  filter_rda_records,
} from "./rda_bank_helpers";

const RDA_VIEW_MODE_KEY = "maz_hub_rda_view_mode";

/** Manages `/rda` table/Kanban state, access prompts, creation, saving, and deletion. */
export function useRdaBank() {
  const { currentUser: current_user, permissions } = useAuth();
  const {
    rdaList: user_rdas,
    allRdas: all_rdas,
    loading,
    refresh,
    updateRdaInCache: update_rda_in_cache,
    removeRdaFromCache: remove_rda_from_cache,
  } = useRdas();

  const [selected_rda, set_selected_rda] = useState<Rda | null>(null);
  const [is_dialog_open, set_is_dialog_open] = useState(false);
  const [rda_to_delete, set_rda_to_delete] = useState<string | null>(null);
  const [access_request_target, set_access_request_target] = useState<AccessRequestTarget | null>(
    null,
  );
  const [search_term, set_search_term] = useState("");
  const [area_filter, set_area_filter] = useState("all");
  const [status_filter, set_status_filter] = useState("all");
  const [is_refreshing, set_is_refreshing] = useState(false);
  const [view_mode, set_view_mode] = useState<"table" | "kanban">(() => {
    try {
      return localStorage.getItem(RDA_VIEW_MODE_KEY) === "kanban" ? "kanban" : "table";
    } catch {
      return "table";
    }
  });

  const handle_change_view_mode = (next_mode: "table" | "kanban") => {
    set_view_mode(next_mode);
    try {
      localStorage.setItem(RDA_VIEW_MODE_KEY, next_mode);
    } catch {
      // Ignore storage access errors
    }
  };

  useEffect(() => {
    if (loading || all_rdas.length === 0) return;
    try {
      const target_id = sessionStorage.getItem("maz_hub_open_rda_id");
      if (!target_id) return;
      sessionStorage.removeItem("maz_hub_open_rda_id");
      const found_rda = all_rdas.find((rda_record) => rda_record.id === target_id);
      if (found_rda) {
        if (can_user_access_rda(found_rda, current_user, permissions)) {
          set_selected_rda(found_rda);
          set_is_dialog_open(true);
        } else {
          set_access_request_target(build_rda_access_target(found_rda));
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [loading, all_rdas, current_user, permissions]);

  const handle_toggle_rda_responsible = async (rda_record: Rda, person_name: string) => {
    if (!permissions.canManageAssignment || !can_user_edit_rda(rda_record, current_user, permissions)) {
      return;
    }
    const updated_rda = build_toggled_responsible_rda(rda_record, person_name);
    if (!updated_rda) return;
    try {
      const saved_rda = await update_rda(updated_rda);
      update_rda_in_cache(saved_rda);
    } catch (assign_error) {
      console.error("Error al asignar responsables al RDA:", assign_error);
      toast.error("No se pudo actualizar la asignación de responsables.");
    }
  };

  const handle_create_new = () => {
    if (!permissions.canCreate || current_user?.role === "viewer" || current_user?.role === "intern") {
      return;
    }
    set_selected_rda(build_new_rda_record(all_rdas, current_user));
    set_is_dialog_open(true);
  };

  const handle_edit_rda = (rda_record: Rda) => {
    if (!can_user_access_rda(rda_record, current_user, permissions)) {
      set_access_request_target(build_rda_access_target(rda_record));
      return;
    }
    set_selected_rda(rda_record);
    set_is_dialog_open(true);
  };

  const handle_request_delete = (rda_record: Rda) => {
    if (!can_user_delete_rda(rda_record, current_user)) return;
    set_rda_to_delete(rda_record.id);
  };

  const confirm_delete_rda = async () => {
    if (!rda_to_delete) return;
    const target_rda = all_rdas.find((rda_record) => rda_record.id === rda_to_delete);
    if (!target_rda || !can_user_delete_rda(target_rda, current_user)) {
      set_rda_to_delete(null);
      return;
    }
    await delete_rda(rda_to_delete);
    remove_rda_from_cache(rda_to_delete);
    set_rda_to_delete(null);
  };

  const handle_save_rda = async (rda_record: Rda) => {
    const saved_rda = await update_rda(rda_record);
    update_rda_in_cache(saved_rda);
    return saved_rda;
  };

  const handle_refresh = async () => {
    set_is_refreshing(true);
    await refresh();
    set_is_refreshing(false);
  };

  const available_areas = useMemo(() => build_rda_available_areas(all_rdas), [all_rdas]);
  const filtered_rdas = useMemo(
    () => filter_rda_records(all_rdas, search_term, area_filter, status_filter),
    [all_rdas, search_term, area_filter, status_filter],
  );

  return {
    current_user,
    permissions,
    user_rdas,
    all_rdas,
    loading,
    selected_rda,
    set_selected_rda,
    is_dialog_open,
    set_is_dialog_open,
    rda_to_delete,
    set_rda_to_delete,
    access_request_target,
    set_access_request_target,
    search_term,
    set_search_term,
    area_filter,
    set_area_filter,
    status_filter,
    set_status_filter,
    is_refreshing,
    view_mode,
    available_areas,
    filtered_rdas,
    handle_change_view_mode,
    handle_toggle_rda_responsible,
    handle_create_new,
    handle_edit_rda,
    handle_request_delete,
    confirm_delete_rda,
    handle_save_rda,
    handle_refresh,
  };
}
