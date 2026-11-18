/**
 * @fileoverview Clickable Abierto, Cerrado, and Evaluado status KPI cards for `/rda`.
 */

import { useTranslation } from "react-i18next";
import type { Rda } from "@/domain/models/rda";
import { Skeleton } from "@/shared/ui/skeleton";
import { get_rda_status } from "../utils/rda_status";

interface RdaStatusCardsProps {
  all_rdas: Rda[];
  loading: boolean;
  status_filter: string;
  on_toggle_status: (status_id: string) => void;
}

/** Renders summary count cards that toggle the status filter on click. */
export function RdaStatusCards({
  all_rdas,
  loading,
  status_filter,
  on_toggle_status,
}: RdaStatusCardsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
      </div>
    );
  }

  const cards = [
    {
      id: "Abierto",
      label: t("openStatus", "Abierto"),
      count: all_rdas.filter((rda_record) => get_rda_status(rda_record) === "Abierto").length,
      color: "border-t-blue-600",
      dot_class: "bg-blue-600",
      description: "RDAs en estatus abierto",
    },
    {
      id: "Cerrado",
      label: t("closedStatus", "Cerrado"),
      count: all_rdas.filter((rda_record) => get_rda_status(rda_record) === "Cerrado").length,
      color: "border-t-emerald-600",
      dot_class: "bg-emerald-600",
      description: "Fases 1, 2 y 3 completas",
    },
    {
      id: "Evaluado",
      label: t("evaluatedStatus", "Evaluado"),
      count: all_rdas.filter((rda_record) => get_rda_status(rda_record) === "Evaluado").length,
      color: "border-t-purple-600",
      dot_class: "bg-purple-600",
      description: "Fases 4 y 5 completas",
    },
  ];

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card_item) => {
        const is_selected = status_filter === card_item.id;
        return (
          <button
            key={card_item.id}
            type="button"
            onClick={() => on_toggle_status(card_item.id)}
            className={`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 cursor-pointer ${card_item.color} ${
              is_selected ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${card_item.dot_class}`} />
                <span className="text-sm font-semibold uppercase">{card_item.label}</span>
              </div>
              <span className="text-2xl font-bold">{card_item.count}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{card_item.description}</p>
          </button>
        );
      })}
    </div>
  );
}
