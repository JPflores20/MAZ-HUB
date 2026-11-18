/**
 * @fileoverview Línea de tiempo de historial y auditoría de cambios en un proyecto PDCA.
 */
import { History, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PdcaHistoryEvent } from "@/domain/pdca";

interface PropiedadesHistorialPdca {
  history: PdcaHistoryEvent[];
}

/**
 * Ordena cronológicamente de forma descendente y renderiza la bitácora de actividad del PDCA.
 */
export function PdcaHistory({ history }: PropiedadesHistorialPdca) {
  const historial_ordenado = [...history].sort(
    (evento_reciente, evento_anterior) =>
      new Date(evento_anterior.timestamp).getTime() - new Date(evento_reciente.timestamp).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="size-5 text-primary" />
        <h3 className="font-semibold text-lg">Historial de Actividad</h3>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {historial_ordenado.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 italic">
            No hay registros de historial aún.
          </p>
        ) : (
          historial_ordenado.map((evento_item, indice_evento) => {
            const fecha_evento = new Date(evento_item.timestamp);
            const fecha_formateada = Number.isNaN(fecha_evento.getTime())
              ? evento_item.timestamp
              : format(fecha_evento, "dd MMM yyyy, HH:mm", { locale: es });

            return (
              <div
                key={evento_item.id || indice_evento}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-secondary/80 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="size-4" />
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-primary">{evento_item.userName}</span>
                    <time className="text-xs text-muted-foreground font-medium">
                      {fecha_formateada}
                    </time>
                  </div>
                  <p className="text-sm text-foreground/90">{evento_item.action}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
