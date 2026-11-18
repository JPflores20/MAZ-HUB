/**
 * @fileoverview Vista de flujo visual horizontal para eventos en la línea de tiempo del problema.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AutoResizeTextarea } from "../../components/auto_resize_textarea";

export interface EventoLineaTiempo {
  id: string;
  time: string;
  description: string;
}

interface PropiedadesFlujoVisual {
  events: EventoLineaTiempo[];
  on_update_event: (evento_id: string, campo: "time" | "description", valor: string) => void;
  on_remove_event: (evento_id: string) => void;
}

/**
 * Renderiza eventos alternados por encima y por debajo de la línea temporal central.
 */
export const ProblemTimelineFlow: React.FC<PropiedadesFlujoVisual> = ({
  events,
  on_update_event,
  on_remove_event,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border rounded-lg p-6 bg-card text-foreground overflow-x-auto">
      <div style={{ minWidth: `${Math.max(600, events.length * 160)}px` }}>
        <div className="relative">
          <div
            className="absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2 bg-slate-800 z-0 flex items-center px-8"
            style={{ clipPath: "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)" }}
          >
            {events.length === 0 && (
              <span className="text-sm text-slate-400 w-full text-center">
                {translate("pdcaPlan.dynamic.agregaEventosParaVerLa")}
              </span>
            )}
          </div>

          <div className="flex justify-between relative z-10 min-h-[400px]">
            {events.map((evento_item, indice_evento) => {
              const va_arriba = indice_evento % 2 === 0;
              const indice_lado = Math.floor(indice_evento / 2);
              const clase_longitud = indice_lado % 2 === 0 ? "h-24" : "h-6";

              return (
                <div
                  key={evento_item.id}
                  className="relative flex-1 flex justify-center w-32 group"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 w-24 h-8 flex items-center justify-center z-20">
                    <input
                      value={evento_item.time}
                      onChange={(evento) =>
                        on_update_event(evento_item.id, "time", evento.target.value)
                      }
                      placeholder="..."
                      className="text-sm w-full text-center bg-transparent border-none outline-none focus:ring-1 focus:ring-white placeholder:text-gray-400 text-white"
                    />
                  </div>
                  {va_arriba ? (
                    <div className="absolute bottom-[calc(50%+16px)] flex flex-col items-center justify-end">
                      <AutoResizeTextarea
                        value={evento_item.description}
                        onChange={(texto) =>
                          on_update_event(evento_item.id, "description", texto)
                        }
                        placeholder={translate("pdcaPlan.dynamic.descripciN")}
                        className="bg-blue-300 w-32 min-h-[4rem] p-2 rounded-sm border border-blue-400 text-xs shadow-sm text-center resize-none outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-blue-600/70 text-gray-900 leading-tight block"
                      />
                      <div className={`w-px bg-blue-400 relative ${clase_longitud}`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 border-t-2 border-r-2 border-blue-400 rotate-[135deg]" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-[calc(50%+16px)] flex flex-col items-center justify-start">
                      <div className={`w-px bg-blue-400 relative ${clase_longitud}`}>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-2 h-2 border-b-2 border-l-2 border-blue-400 rotate-[135deg]" />
                      </div>
                      <AutoResizeTextarea
                        value={evento_item.description}
                        onChange={(texto) =>
                          on_update_event(evento_item.id, "description", texto)
                        }
                        placeholder={translate("pdcaPlan.dynamic.descripciN")}
                        className="bg-blue-300 w-32 min-h-[4rem] p-2 rounded-sm border border-blue-400 text-xs shadow-sm text-center resize-none outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-blue-600/70 text-gray-900 leading-tight block"
                      />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-20 w-6 h-6 -right-4 top-1/2 -translate-y-1/2"
                    onClick={() => on_remove_event(evento_item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
