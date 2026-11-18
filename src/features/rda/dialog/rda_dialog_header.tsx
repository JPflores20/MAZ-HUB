/**
 * @fileoverview RDA editor header showing navigation back CTA, cloud sync indicator, title input, and progress.
 */

import { AlertTriangle, ArrowLeft, Check, CircleDot, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Rda } from "@/domain/models/rda";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { get_rda_display_name, get_rda_name, with_rda_name } from "../utils/rda_name";
import { get_rda_status } from "../utils/rda_status";
import { compute_rda_progress, type RdaPhase } from "./rda_dialog_helpers";

interface RdaDialogHeaderProps {
  local_rda: Rda;
  active_tab: RdaPhase;
  sync_status: "saving" | "error" | "dirty" | "saved";
  is_editable: boolean;
  on_back: () => Promise<void>;
  on_save: () => Promise<void>;
  on_change_rda: (next_rda: Rda) => void;
}

/** Renders the top navigation bar, save status pill, editable title heading, and step progress bar. */
export function RdaDialogHeader({
  local_rda,
  active_tab,
  sync_status,
  is_editable,
  on_back,
  on_save,
  on_change_rda,
}: RdaDialogHeaderProps) {
  const { t } = useTranslation();
  const { total_steps, completed_count, progress_pct } = compute_rda_progress(local_rda);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void on_back()}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-secondary/60 text-foreground font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer group"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </span>
        <span>{t("rda.backToMyRdas", "Volver a Mis RDAs")}</span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {local_rda.id || t("rda.newRda")}
          </span>
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            {active_tab}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {t("rda.statusLabel")} {get_rda_status(local_rda, { ignoreLegacyStatus: true })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2" aria-live="polite">
            {sync_status === "saving" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                <UploadCloud className="size-3.5 animate-bounce" /> {t("rda.saving")}
              </span>
            ) : sync_status === "error" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                <AlertTriangle className="size-3.5" />
                {t("rda.saveError", "Error al guardar")}
              </span>
            ) : sync_status === "dirty" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <CircleDot className="size-3.5" />
                {t("rda.unsavedChanges", "Cambios sin guardar")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Check className="size-3.5" />
                {t("rda.synchronized")}
              </span>
            )}
          </div>
          {is_editable && (
            <Button
              size="sm"
              onClick={() => void on_save()}
              disabled={sync_status === "saving"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <UploadCloud className="size-3.5" />
              {t("rda.saveRda")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl flex-1 min-w-[260px]">
          <span className="sr-only">{get_rda_display_name(local_rda, t("rda.newRda"))}</span>
          <input
            type="text"
            readOnly={!is_editable}
            value={get_rda_name(local_rda)}
            onChange={(change_event) =>
              on_change_rda(with_rda_name(local_rda, change_event.target.value))
            }
            placeholder={t("rda.newRda", "Escribe el título / anomalía del RDA...")}
            aria-label="Título del RDA"
            className="w-full bg-transparent border border-transparent hover:border-border focus:border-primary rounded-md px-1.5 py-0.5 -ml-1.5 outline-none text-xl sm:text-2xl font-bold text-foreground placeholder:text-muted-foreground/70 transition-colors"
          />
        </h1>

        <div className="flex-shrink-0 text-right min-w-[180px]">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {t("rda.rdaProgress")}
            <span className="text-primary">{progress_pct}%</span>
            <span className="text-xs text-muted-foreground ml-1 font-normal">
              ({completed_count}/{total_steps} pasos)
            </span>
          </div>
          <Progress value={progress_pct} className="h-2 mt-1.5" />
        </div>
      </div>
    </div>
  );
}
