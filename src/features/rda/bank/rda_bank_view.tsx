/**
 * @fileoverview Main `/rda` view orchestrator managing status cards, filters, Table/Kanban toggle, and editor.
 */

import { lazy, Suspense } from "react";
import { can_user_edit_rda } from "@/shared/components/access_request";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { Skeleton } from "@/shared/ui/skeleton";
import { RdaBankHeader } from "./rda_bank_header";
import { export_rdas_to_excel } from "./rda_bank_helpers";
import { RdaDeleteDialog } from "./rda_delete_dialog";
import { RdaFiltersBar } from "./rda_filters_bar";
import { RdaStatusCards } from "./rda_status_cards";
import { RdaTableView } from "./rda_table_view";
import { useRdaBank } from "./use_rda_bank";

const LazyRdaKanbanBoard = lazy(() =>
  import("./rda_kanban_board").then((kanban_module) => ({
    default: kanban_module.RdaKanbanBoard,
  })),
);

const LazyAccessRequestDialog = lazy(() =>
  import("@/shared/components/access_request/access_request_dialog").then((dialog_module) => ({
    default: dialog_module.AccessRequestDialog,
  })),
);

const LazyRdaDialog = lazy(() =>
  import("../dialog/rda_dialog").then((dialog_module) => ({ default: dialog_module.RdaDialog })),
);

/** Renders the `/rda` global bank or opens the interactive RDA dialog editor when active. */
export function RdaBankView() {
  const { directory: available_users, resolve_user } = useDirectoryUsers();
  const {
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
  } = useRdaBank();

  if (selected_rda || is_dialog_open) {
    const is_editable_rda = selected_rda
      ? can_user_edit_rda(selected_rda, current_user, permissions)
      : false;
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
          <LazyRdaDialog
            rda={selected_rda}
            open={true}
            isEditable={is_editable_rda}
            onOpenChange={(is_open) => {
              if (!is_open) {
                set_selected_rda(null);
                set_is_dialog_open(false);
              }
            }}
            onSave={is_editable_rda ? handle_save_rda : undefined}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <RdaBankHeader
        loading={loading}
        total_count={all_rdas.length}
        direct_count={user_rdas.length}
        can_view_all={permissions.canViewAll}
        can_create={permissions.canCreate}
        is_refreshing={is_refreshing}
        on_refresh={() => void handle_refresh()}
        on_create_new={handle_create_new}
      />

      <RdaStatusCards
        all_rdas={all_rdas}
        loading={loading}
        status_filter={status_filter}
        on_toggle_status={(status_id) =>
          set_status_filter((previous_status) => (previous_status === status_id ? "all" : status_id))
        }
      />

      <RdaFiltersBar
        search_term={search_term}
        on_search_change={set_search_term}
        area_filter={area_filter}
        on_area_change={set_area_filter}
        available_areas={available_areas}
        status_filter={status_filter}
        on_clear_status={() => set_status_filter("all")}
        view_mode={view_mode}
        on_change_view_mode={handle_change_view_mode}
        on_export_excel={() => void export_rdas_to_excel(filtered_rdas)}
      />

      {view_mode === "kanban" ? (
        <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-xl" />}>
          <LazyRdaKanbanBoard
            filtered_rdas={filtered_rdas}
            current_user={current_user}
            permissions={permissions}
            available_users={available_users}
            resolve_user={resolve_user}
            on_edit_rda={handle_edit_rda}
            on_toggle_responsible={handle_toggle_rda_responsible}
          />
        </Suspense>
      ) : (
        <RdaTableView
          filtered_rdas={filtered_rdas}
          loading={loading}
          current_user={current_user}
          permissions={permissions}
          available_users={available_users}
          resolve_user={resolve_user}
          on_edit_rda={handle_edit_rda}
          on_request_access={set_access_request_target}
          on_request_delete={handle_request_delete}
          on_toggle_responsible={handle_toggle_rda_responsible}
        />
      )}

      <RdaDeleteDialog
        open={!!rda_to_delete}
        on_open_change={(is_open) => !is_open && set_rda_to_delete(null)}
        on_confirm_delete={confirm_delete_rda}
      />

      {access_request_target && (
        <Suspense fallback={null}>
          <LazyAccessRequestDialog
            open={true}
            onOpenChange={(is_open) => {
              if (!is_open) set_access_request_target(null);
            }}
            target={access_request_target}
          />
        </Suspense>
      )}
    </div>
  );
}
