/**
 * @fileoverview Header banner with RDA module count summary, manual cloud refresh, and create CTA.
 */

import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface RdaBankHeaderProps {
  loading: boolean;
  total_count: number;
  direct_count: number;
  can_view_all: boolean;
  can_create: boolean;
  is_refreshing: boolean;
  on_refresh: () => void;
  on_create_new: () => void;
}

/** Renders the `/rda` page header bar with report counters and create/sync actions. */
export function RdaBankHeader({
  loading,
  total_count,
  direct_count,
  can_view_all,
  can_create,
  is_refreshing,
  on_refresh,
  on_create_new,
}: RdaBankHeaderProps) {
  const { t } = useTranslation();

  return (
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
              {total_count} {t("reportsRegistered")}{" "}
              {can_view_all
                ? t("globalView")
                : `• Banco global de RDAs (${direct_count} con acceso directo)`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={on_refresh}
          disabled={is_refreshing || loading}
          className="hidden sm:flex bg-card mr-2"
          title="Sincronizar con la nube"
        >
          <RefreshCw className={`size-4 ${is_refreshing ? "animate-spin" : ""}`} />
        </Button>
        {can_create && (
          <Button
            variant="default"
            onClick={on_create_new}
            className="bg-primary shadow-sm hover:bg-brand-dark text-primary-foreground"
          >
            <Plus className="mr-1.5 size-4" /> {t("createNewRda")}
          </Button>
        )}
      </div>
    </header>
  );
}
