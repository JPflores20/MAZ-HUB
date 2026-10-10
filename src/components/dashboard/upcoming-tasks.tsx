interface UpcomingTask {
  id: string;
  description: string;
  deadline: string;
  owner: string;
  type: string;
}

interface UpcomingTasksProps {
  tareas: UpcomingTask[];
}

export function UpcomingTasks({ tareas }: UpcomingTasksProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
        Próximos compromisos
      </h2>
      <ul className="mt-4">
        {tareas.slice(0, 6).map((t) => (
          <li key={t.id} className="border-b border-border last:border-0 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-start gap-2 mb-1">
              <span className="mt-0.5 shrink-0 text-[9px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground">
                {t.type}
              </span>
              <p className="text-sm font-medium leading-tight">{t.description}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t.owner} • {t.deadline}
            </p>
          </li>
        ))}
        {tareas.length === 0 && (
          <li className="py-6 text-center text-xs text-muted-foreground">
            No hay compromisos pendientes.
          </li>
        )}
      </ul>
    </div>
  );
}
