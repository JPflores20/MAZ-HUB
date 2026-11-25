/**
 * @fileoverview PDCA project bank view coordinating filters, table/Kanban views, access prompts, and editor dialog.
 */

import { Suspense, lazy } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { ErrorBoundary } from "@/shared/ui/error_boundary";
import { Skeleton } from "@/shared/ui/skeleton";
import { DashboardFilters } from "./dashboard_filters";
import { PdcaDeleteAlertDialog } from "./pdca_delete_alert_dialog";
import { ProjectTable } from "./project_table";
import { usePdcaBank } from "./use_pdca_bank";

const LazyAccessRequestDialog = lazy(() =>
  import("@/shared/components/access_request/access_request_dialog").then((dialog_module) => ({
    default: dialog_module.AccessRequestDialog,
  })),
);

const LazyPdcaDialog = lazy(() =>
  import("@/features/pdca/dialog/pdca_dialog_wrapper").then((pdca_module) => ({
    default: pdca_module.PdcaDialog,
  })),
);

/** Renders the `/` PDCA project bank or the active PDCA editor dialog when selected. */
export function PdcaBankView() {
  const { t } = useTranslation();
  const {
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
  } = usePdcaBank();

  if (selected_pdca || is_creating_new) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
          <ErrorBoundary>
            <LazyPdcaDialog
              pdca={selected_pdca}
              open={true}
              onOpenChange={(is_open) => {
                if (!is_open) {
                  set_selected_id(null);
                  set_is_creating_new(false);
                }
              }}
            />
          </ErrorBoundary>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("pdcaModule")}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">{t("myPdcas")}</h1>
          <div className="mt-1">
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user_pdcas.length} ciclos en el Banco de PDCAs •{" "}
                <span className="font-medium text-foreground">
                  {accessible_pdcas.length} con acceso habilitado para ti
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void handle_refresh()}
            disabled={is_refreshing}
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${is_refreshing ? "animate-spin" : ""}`} />
          </Button>
          {permissions.canCreate && (
            <Button
              size="lg"
              className="bg-primary shadow-sm hover:bg-brand-dark"
              onClick={() => open_pdca(null)}
            >
              <Plus /> {t("createNewPdca")}
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="space-y-6 mt-6">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : (
        <>
          <ErrorBoundary>
            <DashboardFilters
              user_pdcas={user_pdcas}
              filter={filter}
              setFilter={set_filter}
              metrics={metrics}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <ProjectTable
              rows={rows}
              query={query}
              setQuery={set_query}
              filter={filter}
              setFilter={set_filter}
              current_user={current_user}
              is_admin={is_admin}
              set_selected_id={handle_select_pdca_id}
              request_delete={request_delete}
              handle_deadline_change={(pdca_id, selected_date, is_no_limit) =>
                void handle_deadline_change(pdca_id, selected_date, is_no_limit)
              }
              handle_remove_deadline={(click_event, pdca_id) =>
                void handle_remove_deadline(click_event, pdca_id)
              }
            />
          </ErrorBoundary>
        </>
      )}

      {access_request_target && (
        <Suspense fallback={null}>
          <LazyAccessRequestDialog
            open={true}
            onOpenChange={(is_open) => !is_open && set_access_request_target(null)}
            target={access_request_target}
          />
        </Suspense>
      )}

      <PdcaDeleteAlertDialog
        open={!!delete_id}
        on_open_change={(is_open) => !is_open && set_delete_id(null)}
        on_confirm_delete={confirm_delete}
      />
    </div>
  );
}
