import { ClipboardList, CheckCircle2, Clock, Target } from "lucide-react";

interface KpiData {
  label: string;
  value: number | string;
  icon: React.ElementType;
  hint: string;
  colorClass: string;
}

interface KpiCardsProps {
  activos: number;
  cerrados: number;
  avance: number;
  pendientes: number;
}

export function KpiCards({ activos, cerrados, avance, pendientes }: KpiCardsProps) {
  const kpis: KpiData[] = [
    {
      label: "Proyectos activos",
      value: activos,
      icon: ClipboardList,
      hint: "PDCAs y RDAs en curso",
      colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Proyectos en cierre",
      value: cerrados,
      icon: CheckCircle2,
      hint: "Listos para estandarizar / cerrar",
      colorClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: "Avance promedio",
      value: `${avance}%`,
      icon: Target,
      hint: "Todos los ciclos",
      colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Tareas pendientes",
      value: pendientes,
      icon: Clock,
      hint: "Planes de acción abiertos",
      colorClass: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    },
  ];

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {k.label}
            </span>
            <div className={`rounded-full p-2.5 ${k.colorClass}`}>
              <k.icon className="size-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-4xl font-bold">{k.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}
