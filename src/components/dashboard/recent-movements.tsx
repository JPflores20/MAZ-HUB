import { PhaseBadge } from "@/components/pdca/pdca-badge";

interface RecentMovement {
  id: string;
  title: string;
  area: string;
  date: string;
  progress: number;
  phase: string;
  type: string;
}

interface RecentMovementsProps {
  recientes: RecentMovement[];
}

export function RecentMovements({ recientes }: RecentMovementsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
        Movimientos recientes
      </h2>
      <ul className="mt-4">
        {recientes.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {p.type}
                </span>
                <p className="text-sm font-semibold leading-tight">{p.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {p.area} • actualizado {p.date}
              </p>
              <div className="mt-3">
                <span className="block h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-brand-yellow"
                    style={{ width: `${p.progress}%` }}
                  />
                </span>
              </div>
            </div>
            <div className="shrink-0">
              {p.type === "PDCA" ? (
                <PhaseBadge phase={p.phase as any} />
              ) : (
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-current text-blue-600 bg-blue-500/10">
                  {p.phase}
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
