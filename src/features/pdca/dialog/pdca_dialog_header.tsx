/**
 * @fileoverview Encabezado principal del editor PDCA con folio, insignia de fase, botón de guardado y progreso.
 */
import React from "react";
import { ArrowLeft, Check, UploadCloud, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { differenceInDays, startOfDay } from "date-fns";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/class_names";
import type { Phase } from "@/domain/pdca";
import { PhaseBadge } from "../components/pdca_badge";
import { parse_date_string } from "../utils/date_helpers";
import { ALL_STEP_IDS, TOTAL_STEPS } from "./pdca_step_constants";

export { ALL_STEP_IDS, TOTAL_STEPS };

interface PropiedadesEncabezadoDialogoPdca {
  current_phase: Phase;
  document_identifier: string;
  pdca_title: string;
  last_updated: string;
  creation_date?: string;
  deadline_string?: string | null;
  completed_steps: Set<string>;
  na_steps: Set<string>;
  is_saving_in_progress: boolean;
  has_pending_modifications: boolean;
  is_user_permitted_to_edit: boolean;
  on_trigger_firestore_save: () => Promise<boolean>;
  on_go_back: () => void;
}

/**
 * Calcula la etiqueta visual de días restantes o vencimiento respecto a la fecha límite del PDCA.
 */
function renderizar_estado_vencimiento(
  deadline_string: string | null | undefined,
  translate: TFunction,
): React.ReactNode {
  if (!deadline_string) return null;
  if (deadline_string === "Sin límite") {
    return <span className="text-muted-foreground ml-2">{translate("pdcaDialog.noTimeLimit")}</span>;
  }
  const fecha_limite = parse_date_string(deadline_string);
  if (!fecha_limite) return null;

  const diferencia_dias = differenceInDays(fecha_limite, startOfDay(new Date()));
  if (diferencia_dias < 0) {
    return (
      <span className="text-red-500 dark:text-red-400 font-bold ml-2">
        {translate("pdcaDialog.expiredBy", { days: Math.abs(diferencia_dias) })}
      </span>
    );
  }
  if (diferencia_dias === 0) {
    return (
      <span className="text-amber-500 font-bold ml-2">
        {translate("pdcaDialog.expiresToday")}
      </span>
    );
  }
  return (
    <span className="text-emerald-500 font-medium ml-2">
      {translate("pdcaDialog.daysLeft", { days: diferencia_dias })}
    </span>
  );
}

/**
 * Muestra controles superiores de navegación, sincronización con Firestore y progreso global del proyecto.
 */
export const PdcaDialogHeader: React.FC<PropiedadesEncabezadoDialogoPdca> = ({
  current_phase,
  document_identifier,
  pdca_title,
  last_updated,
  creation_date,
  deadline_string,
  completed_steps,
  na_steps,
  is_saving_in_progress,
  has_pending_modifications,
  is_user_permitted_to_edit,
  on_trigger_firestore_save,
  on_go_back,
}) => {
  const { t: translate } = useTranslation();
  const pasos_validos = ALL_STEP_IDS.filter((paso_id) => !na_steps.has(paso_id));
  const cantidad_completados = pasos_validos.filter((paso_id) =>
    completed_steps.has(paso_id),
  ).length;
  const porcentaje_avance =
    pasos_validos.length > 0
      ? Math.round((cantidad_completados / pasos_validos.length) * 100)
      : 0;
  const nodo_fecha_limite = renderizar_estado_vencimiento(deadline_string, translate);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={on_go_back}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-secondary/60 text-foreground font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer group"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </span>
        <span>{translate("pdcaDialog.backToPdcas", "Volver a Mis PDCAs")}</span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {document_identifier || translate("pdcaDialog.newPdca")}
          </span>
          <PhaseBadge phase={current_phase} />
          {creation_date && (
            <span className="text-xs text-muted-foreground ml-2">
              {translate("pdcaDialog.opened")} {creation_date}
            </span>
          )}
          {nodo_fecha_limite && <span className="text-xs">| {nodo_fecha_limite}</span>}
          {last_updated && (
            <span className="text-xs text-muted-foreground ml-2">
              | {translate("table.updated")}: {last_updated}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2">
            {is_saving_in_progress ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                <UploadCloud className="size-3.5 animate-bounce" />{" "}
                {translate("pdcaDialog.saving")}
              </span>
            ) : has_pending_modifications ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Save className="size-3.5" /> {translate("pdcaDialog.pendingChanges")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="size-3.5" /> {translate("pdcaDialog.synchronized")}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => void on_trigger_firestore_save()}
            disabled={is_saving_in_progress || !is_user_permitted_to_edit}
            className={cn(
              "font-semibold text-xs h-8 gap-1.5 transition-all shadow-sm",
              has_pending_modifications && is_user_permitted_to_edit
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            <UploadCloud className="size-3.5" />
            {is_saving_in_progress
              ? translate("pdcaDialog.saving")
              : translate("pdcaDialog.savePdca")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
          {pdca_title || translate("pdcaDialog.newPdca")}
        </h1>

        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {translate("pdcaDialog.progress")}{" "}
            <span className="text-primary">{porcentaje_avance}%</span>
            <span className="text-xs text-muted-foreground ml-1 font-normal">
              ({cantidad_completados}/{TOTAL_STEPS} {translate("pdcaDialog.steps")})
            </span>
          </div>
          <div className="mt-1.5 h-2 w-48 bg-secondary/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
              style={{ width: `${porcentaje_avance}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
