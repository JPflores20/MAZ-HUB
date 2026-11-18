/**
 * @fileoverview Before/After comparative indicator table inside RDA Phase 5 Effectiveness Evaluation.
 */

import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RdaEffectivenessEval } from "@/domain/models/rda";
import { Button } from "@/shared/ui/button";

type EffectivenessItem = RdaEffectivenessEval["items"][number];

interface RdaPhase7EvalTableProps {
  items: EffectivenessItem[];
  on_add_item: () => void;
  on_update_item: (item_id: string, field_name: keyof EffectivenessItem, value: string) => void;
  on_remove_item: (item_id: string) => void;
}

/** Editable comparison table tracking pre- and post-action indicator values. */
export function RdaPhase7EvalTable({
  items,
  on_add_item,
  on_update_item,
  on_remove_item,
}: RdaPhase7EvalTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#0078D7] text-white">
          <tr>
            <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
              {t("rdaInternal.concept")}
            </th>
            <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
              {t("rdaInternal.beforeAction")}
            </th>
            <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-left border-r border-white/20">
              {t("rdaInternal.afterAction")}
            </th>
            <th className="px-2 py-3 w-10 border-none" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((metric_item) => (
            <tr key={metric_item.id}>
              <td className="px-2 py-2">
                <input
                  className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                  placeholder={t("rdaInternal.conceptPlaceholder")}
                  value={metric_item.concepto}
                  onChange={(change_event) =>
                    on_update_item(metric_item.id, "concepto", change_event.target.value)
                  }
                />
              </td>
              <td className="px-2 py-2">
                <input
                  className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                  placeholder={t("rdaInternal.beforePlaceholder")}
                  value={metric_item.antes}
                  onChange={(change_event) =>
                    on_update_item(metric_item.id, "antes", change_event.target.value)
                  }
                />
              </td>
              <td className="px-2 py-2">
                <input
                  className="w-full bg-transparent border-0 px-2 py-1 outline-none"
                  placeholder={t("rdaInternal.afterPlaceholder")}
                  value={metric_item.despues}
                  onChange={(change_event) =>
                    on_update_item(metric_item.id, "despues", change_event.target.value)
                  }
                />
              </td>
              <td className="px-2 py-2 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => on_remove_item(metric_item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 bg-secondary/20 border-t border-border">
        <Button variant="outline" size="sm" onClick={on_add_item} className="h-8 text-xs gap-1">
          <Plus className="size-3" />
          {t("rdaInternal.addRow")}
        </Button>
      </div>
    </div>
  );
}
