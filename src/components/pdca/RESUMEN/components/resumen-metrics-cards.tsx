import React from "react";
import { useTranslation } from "react-i18next";
import { Activity, TrendingUp, ListChecks } from "lucide-react";

interface Props {
  kpiLabel: string;
  desdeVal: string;
  aVal: string;
  unidad: string;
  gapText: string;
  progreso: number;
  yesCount: number;
  totalValid: number;
  noCount: number;
  prioritizedActionsCount: number;
  totalActionsCount: number;
}

export const ResumenMetricsCards: React.FC<Props> = ({
  kpiLabel,
  desdeVal,
  aVal,
  unidad,
  gapText,
  progreso,
  yesCount,
  totalValid,
  noCount,
  prioritizedActionsCount,
  totalActionsCount,
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Box 1: Target / GAP & {t('pdcaResumen.indicator')} */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Activity className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">{t('pdcaResumen.>indicator<')}</p>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
              {t('pdcaResumen.gapPrefix')}{gapText}
            </span>
          </div>
          <p className="text-sm font-bold truncate mt-0.5">{kpiLabel}</p>
          <p className="text-[11px] text-muted-foreground">
            Target:{" "}
            <strong className="text-foreground font-semibold">
              {desdeVal} → {aVal} {unidad}
            </strong>
          </p>
        </div>
      </div>

      {/* Box 2: {t('pdcaResumen.pdcaAdvanceSdcaCheck')} */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              {t('pdcaResumen.pdcaAdvanceSdcaCheck')}
            </p>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {progreso}%
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>
              SDCA Check:{" "}
              <strong className="text-foreground font-semibold">
                {yesCount}/{totalValid}
              </strong>
            </span>
            <span>{noCount > 0 ? `${noCount} {t('pdcaResumen.pending')}` : "{t('pdcaResumen.upToDate')}"}</span>
          </div>
        </div>
      </div>

      {/* Box 3: {t('pdcaResumen.planActions')} */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
        <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <ListChecks className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground leading-tight">
            {t('pdcaResumen.planActions')}
          </p>
          <p className="text-xl font-bold">
            {prioritizedActionsCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">
             {t('pdcaResumen.of')}{totalActionsCount}{t('pdcaResumen.totals')}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">{t('pdcaResumen.prioritizedForExecution')}</p>
        </div>
      </div>
    </div>
  );
};
