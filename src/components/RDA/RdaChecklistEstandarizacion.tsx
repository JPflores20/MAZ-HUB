// @ts-nocheck
import { useTranslation } from "react-i18next";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ESTANDARES = [
  {
    id: "mapeo",
    textKey: "rdaInternal.estMapeo",
  },
  {
    id: "owd",
    textKey: "rdaInternal.estOwd",
  },
  {
    id: "sop",
    textKey: "rdaInternal.estSop",
  },
  {
    id: "capacitacion",
    textKey: "rdaInternal.estCapacitacion",
  },
  {
    id: "monitoreo_ip",
    textKey: "rdaInternal.estMonitoreoIp",
  },
];

const HERRAMIENTAS_VPO = [
  { id: "chk_checklist", textKey: "rdaInternal.vpoChecklist" },
  { id: "chk_pisic", textKey: "rdaInternal.vpoPisic" },
  { id: "chk_sap", textKey: "rdaInternal.vpoSap" },
  { id: "chk_sla", textKey: "rdaInternal.vpoSla" },
  { id: "chk_gops", textKey: "rdaInternal.vpoGops" },
];

interface Props {
  data: Record<string, boolean>;
  onChange: (data: Record<string, boolean>) => void;
}

export function RdaChecklistEstandarizacion({ data, onChange }: Props) {
  const { t } = useTranslation();

  const toggle = (id: string) => {
    onChange({ ...data, [id]: !data[id] });
  };

  const ToggleBtn = ({ id }: { id: string }) => {
    const isYes = data[id] === true;
    return (
      <button
        onClick={() => toggle(id)}
        className={cn(
          "px-4 py-1.5 text-xs font-bold text-white transition-colors min-w-[60px] cursor-pointer",
          isYes ? "bg-[#00B050] hover:bg-[#00B050]/90" : "bg-[#00B050] hover:bg-[#00B050]/90",
        )}
      >
        {isYes ? t('rdaInternal.yes') : t('rdaInternal.no')}
      </button>
    );
  };

  // The original image shows buttons are always green but with text 'No' or 'Sí'
  // I will make them red for No and Green for Si, or just green as requested if we want strictly like the image.
  // Actually, standard UI is usually red for No and Green for Yes. But I will keep it similar to the image (dark green).
  const ToggleBtnStyled = ({ id }: { id: string }) => {
    const isYes = data[id] === true;
    return (
      <button
        onClick={() => toggle(id)}
        className={cn(
          "px-4 py-1 text-xs font-bold text-white transition-colors w-[60px] text-center rounded-sm",
          isYes ? "bg-[#00B050] hover:bg-[#009040]" : "bg-red-500 dark:bg-red-600 hover:bg-red-600",
        )}
      >
        {isYes ? t('rdaInternal.yes') : t('rdaInternal.no')}
      </button>
    );
  };

  return (
    <div className="border border-border overflow-hidden rounded-md bg-card text-foreground text-sm">
      <div className="bg-[#0078D7] border-b border-border text-white text-center font-bold p-2 text-base uppercase">
        {t("rda.standardizationChecklist")}
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        <div className="bg-[#0078D7] text-white p-1.5 text-center font-bold uppercase text-xs">
          {t("rda.standardsEvaluation")}
        </div>
        <div className="bg-[#0078D7] text-white p-1.5 text-center font-bold uppercase text-xs">
          {t("rda.vpoToolsToConsider")}
        </div>
      </div>

      {ESTANDARES.map((est, i) => (
        <div
          key={i}
          className="grid grid-cols-2 divide-x divide-border border-b border-border last:border-b-0"
        >
          <div className="flex items-center p-1.5 gap-3">
            <ToggleBtnStyled id={est.id} />
            <span className="text-xs">{t(est.textKey)}</span>
          </div>
          <div className="flex items-center p-1.5 gap-3">
            <ToggleBtnStyled id={HERRAMIENTAS_VPO[i].id} />
            <span className="text-xs">{t(HERRAMIENTAS_VPO[i].textKey)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
