/**
 * @fileoverview Dashboard feed card showing the most recent PDCA and RDA updates with phase badges.
 */

import { PhaseBadge } from "@/features/pdca/components/pdca_badge";
import type { Phase } from "@/domain/pdca";
import type { RecentMovementItem } from "./executive_dashboard_helpers";

interface RecentMovementsProps {
  recientes: RecentMovementItem[];
}

/** Displays recent PDCA/RDA project updates alongside progress bars and status badges. */
export function RecentMovements({ recientes }: RecentMovementsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
        Movimientos recientes
      </h2>
      <ul className="mt-4">
        {recientes.map((movement_item) => (
          <li
            key={movement_item.id}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {movement_item.type}
                </span>
                <p className="text-sm font-semibold leading-tight">{movement_item.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {movement_item.area} • actualizado {movement_item.date}
              </p>
              <div className="mt-3">
                <span className="block h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-brand-yellow"
                    style={{ width: `${movement_item.progress}%` }}
                  />
                </span>
              </div>
            </div>
            <div className="shrink-0">
              {movement_item.type === "PDCA" ? (
                <PhaseBadge phase={movement_item.phase as Phase} />
              ) : (
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-current text-blue-600 bg-blue-500/10">
                  {movement_item.phase}
                </span>
              )}
            </div>
          </li>
        ))}
        {recientes.length === 0 && (
          <li className="py-6 text-center text-xs text-muted-foreground">
            No hay registros para mostrar.
          </li>
        )}
      </ul>
    </div>
  );
}
