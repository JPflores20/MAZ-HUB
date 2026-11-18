/**
 * @fileoverview Custom hook orchestrating PDCA bank selection, access requests, deadlines, and deletion.
 */

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import type { Pdca, Phase } from "@/domain/pdca";
import { useAuth } from "@/features/auth/auth_context";
import {
  type AccessRequestTarget,
  build_pdca_access_target,
  can_user_access_pdca,
  can_user_delete_pdca,
  can_user_edit_pdca,
} from "@/shared/components/access_request";
import { usePdcas } from "@/shared/context/pdca_context";
import {
  delete_pdca_from_firestore,
  update_pdca_deadline,
} from "@/shared/services/pdca/pdca_firestore_mutations";
import { compute_pdca_bank_metrics, filter_pdca_bank_rows } from "./pdca_bank_helpers";

/** Manages PDCA bank view state, deep-link opening, access guardrails, and CRUD actions. */
export function usePdcaBank() {
  const { currentUser: current_user, permissions } = useAuth();
  const { allPdcas: all_pdcas, pdcaList: accessible_pdcas, refresh, loading } = usePdcas();

  const [query, set_query] = useState("");
  const [filter, set_filter] = useState<Phase | "Todas">("Todas");
  const [selected_id, set_selected_id] = useState<string | null>(null);
  const [is_creating_new, set_is_creating_new] = useState(false);
  const [delete_id, set_delete_id] = useState<string | null>(null);
  const [is_refreshing, set_is_refreshing] = useState(false);
  const [access_request_target, set_access_request_target] = useState<AccessRequestTarget | null>(
    null,
  );

  const is_admin = current_user?.role === "admin";
  const user_pdcas = all_pdcas;

  const handle_refresh = async () => {
    set_is_refreshing(true);
    await refresh();
    set_is_refreshing(false);
  };

  const handle_select_pdca_id = (pdca_id: string) => {
    const target_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === pdca_id);
    if (!target_pdca) return;
    if (!can_user_access_pdca(target_pdca, current_user, permissions)) {
      set_access_request_target(build_pdca_access_target(target_pdca));
      return;
    }
    set_selected_id(pdca_id);
  };

  useEffect(() => {
    if (loading || user_pdcas.length === 0) return;
    try {
      const target_id = sessionStorage.getItem("maz_hub_open_pdca_id");
      if (!target_id) return;
      sessionStorage.removeItem("maz_hub_open_pdca_id");
      const found_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === target_id);
      if (found_pdca) {
        if (can_user_access_pdca(found_pdca, current_user, permissions)) {
          set_selected_id(target_id);
        } else {
          set_access_request_target(build_pdca_access_target(found_pdca));
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, [loading, user_pdcas, current_user, permissions]);

  const selected_pdca = useMemo(() => {
    if (!selected_id) return null;
    const found_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === selected_id) || null;
    if (found_pdca && !can_user_access_pdca(found_pdca, current_user, permissions)) {
      return null;
    }
    return found_pdca;
  }, [selected_id, user_pdcas, current_user, permissions]);

  const metrics = useMemo(() => compute_pdca_bank_metrics(user_pdcas), [user_pdcas]);
  const rows = useMemo(
    () => filter_pdca_bank_rows(user_pdcas, filter, query),
    [query, filter, user_pdcas],
  );

  const request_delete = (click_event: React.MouseEvent, pdca_id: string) => {
    click_event.stopPropagation();
    const target_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === pdca_id);
    if (!target_pdca || !can_user_delete_pdca(target_pdca, current_user)) return;
    set_delete_id(pdca_id);
  };

  const confirm_delete = async () => {
    if (!delete_id) return;
    const target_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === delete_id);
    if (!target_pdca || !can_user_delete_pdca(target_pdca, current_user)) {
      set_delete_id(null);
      return;
    }
    await delete_pdca_from_firestore(delete_id);
    await refresh();
    set_delete_id(null);
  };

  const handle_deadline_change = async (
    pdca_id: string,
    selected_date: Date | undefined,
    is_no_limit = false,
  ) => {
    const target_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === pdca_id);
    if (!target_pdca || !can_user_edit_pdca(target_pdca, current_user, permissions)) return;
    const formatted_value = is_no_limit
      ? "Sin límite"
      : selected_date && isValid(selected_date)
        ? format(selected_date, "dd/MM/yyyy", { locale: es })
        : null;
    await update_pdca_deadline(pdca_id, formatted_value);
    await refresh();
  };

  const handle_remove_deadline = async (click_event: React.MouseEvent, pdca_id: string) => {
    click_event.stopPropagation();
    const target_pdca = user_pdcas.find((pdca_entry) => pdca_entry.id === pdca_id);
    if (!target_pdca || !can_user_edit_pdca(target_pdca, current_user, permissions)) return;
    await update_pdca_deadline(pdca_id, null);
    await refresh();
  };

  const open_pdca = (pdca_entry: Pdca | null) => {
    if (pdca_entry) {
      handle_select_pdca_id(pdca_entry.id);
      set_is_creating_new(false);
      return;
    }
    if (
      !permissions.canCreate ||
      current_user?.role === "viewer" ||
      current_user?.role === "intern"
    ) {
      return;
    }
    set_selected_id(null);
    set_is_creating_new(true);
  };

  return {
    current_user,
    permissions,
    is_admin,
    loading,
    user_pdcas,
    accessible_pdcas,
    query,
    set_query,
    filter,
    set_filter,
    selected_pdca,
    set_selected_id,
    is_creating_new,
    set_is_creating_new,
    delete_id,
    set_delete_id,
    is_refreshing,
    access_request_target,
    set_access_request_target,
    metrics,
    rows,
    handle_refresh,
    handle_select_pdca_id,
    request_delete,
    confirm_delete,
    handle_deadline_change,
    handle_remove_deadline,
    open_pdca,
  };
}
