/**
 * @fileoverview Interactive SOP/OWD standardization and VPO knowledge-management checklist matrix.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils/class_names";

const CHECKLIST_PAIRS = [
  { id1: "mapeo", key1: "rdaInternal.estMapeo", id2: "chk_checklist", key2: "rdaInternal.vpoChecklist" },
  { id1: "owd", key1: "rdaInternal.estOwd", id2: "chk_pisic", key2: "rdaInternal.vpoPisic" },
  { id1: "sop", key1: "rdaInternal.estSop", id2: "chk_sap", key2: "rdaInternal.vpoSap" },
  {
    id1: "capacitacion",
    key1: "rdaInternal.estCapacitacion",
    id2: "chk_sla",
    key2: "rdaInternal.vpoSla",
  },
  {
    id1: "monitoreo_ip",
    key1: "rdaInternal.estMonitoreoIp",
    id2: "chk_gops",
    key2: "rdaInternal.vpoGops",
  },
] as const;

interface RdaChecklistEstandarizacionProps {
  data: Record<string, boolean>;
  onChange: (data: Record<string, boolean>) => void;
}

/** Two-column binary Sí/No checklist for RDA standardization and VPO tool triggers. */
export function RdaChecklistEstandarizacion({
  data,
  onChange,
}: RdaChecklistEstandarizacionProps) {
  const { t } = useTranslation();

  const toggle_item = (item_id: string) => {
    onChange({ ...data, [item_id]: !data[item_id] });
  };

  const render_toggle_button = (item_id: string) => {
    const is_yes = data[item_id] === true;
    return (
      <button
        type="button"
        onClick={() => toggle_item(item_id)}
        className={cn(
          "px-4 py-1 text-xs font-bold text-white transition-colors w-[60px] text-center rounded-sm cursor-pointer",
          is_yes ? "bg-red-500 dark:bg-red-600 hover:bg-red-600" : "bg-[#00B050] hover:bg-[#009040]",
        )}
      >
        {is_yes ? t("rdaInternal.yes") : t("rdaInternal.no")}
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

      {CHECKLIST_PAIRS.map((pair_item) => (
        <div
          key={pair_item.id1}
          className="grid grid-cols-2 divide-x divide-border border-b border-border last:border-b-0"
        >
          <div className="flex items-center p-1.5 gap-3">
            {render_toggle_button(pair_item.id1)}
            <span className="text-xs">{t(pair_item.key1)}</span>
          </div>
          <div className="flex items-center p-1.5 gap-3">
            {render_toggle_button(pair_item.id2)}
            <span className="text-xs">{t(pair_item.key2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
