/**
 * @fileoverview Main `/rda` view orchestrator managing status cards, filters, Table/Kanban toggle, and editor.
 */

import { lazy, Suspense } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccessRequestDialog, can_user_edit_rda } from "@/shared/components/access_request";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { export_rdas_to_excel } from "./rda_bank_helpers";
import { RdaDeleteDialog } from "./rda_delete_dialog";
import { RdaFiltersBar } from "./rda_filters_bar";
import { RdaKanbanBoard } from "./rda_kanban_board";
import { RdaStatusCards } from "./rda_status_cards";
import { RdaTableView } from "./rda_table_view";
import { useRdaBank } from "./use_rda_bank";

const LazyRdaDialog = lazy(() =>
  import("../dialog/rda_dialog").then((dialog_module) => ({ default: dialog_module.RdaDialog })),
);

/** Renders the `/rda` global bank or opens the interactive RDA dialog editor when active. */
export function RdaBankView() {
  const { t } = useTranslation();
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("rdaModule")}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">{t("myRdas")}</h1>
          <div className="mt-1">
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {all_rdas.length} {t("reportsRegistered")}{" "}
                {permissions.canViewAll
                  ? t("globalView")
                  : `• Banco global de RDAs (${user_rdas.length} con acceso directo)`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void handle_refresh()}
            disabled={is_refreshing || loading}
            className="hidden sm:flex bg-card mr-2"
            title="Sincronizar con la nube"
          >
            <RefreshCw className={`size-4 ${is_refreshing ? "animate-spin" : ""}`} />
          </Button>
          {permissions.canCreate && (
            <Button
              variant="default"
              onClick={handle_create_new}
              className="bg-primary shadow-sm hover:bg-brand-dark text-primary-foreground"
            >
              <Plus className="mr-1.5 size-4" /> {t("createNewRda")}
            </Button>
          )}
        </div>
      </header>

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
        on_export_excel={() => export_rdas_to_excel(filtered_rdas)}
      />

      {view_mode === "kanban" ? (
        <RdaKanbanBoard
          filtered_rdas={filtered_rdas}
          current_user={current_user}
          permissions={permissions}
          available_users={available_users}
          resolve_user={resolve_user}
          on_edit_rda={handle_edit_rda}
          on_toggle_responsible={handle_toggle_rda_responsible}
        />
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

      <AccessRequestDialog
        open={Boolean(access_request_target)}
        onOpenChange={(is_open) => {
          if (!is_open) set_access_request_target(null);
        }}
        target={access_request_target}
      />
    </div>
  );
}
