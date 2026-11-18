/**
 * @fileoverview Vista tabular editable de eventos cronológicos para la línea de tiempo del problema.
 */
import React from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AutoResizeTextarea } from "../../components/auto_resize_textarea";
import type { EventoLineaTiempo } from "./problem_timeline_flow";

interface PropiedadesTablaTimeline {
  events: EventoLineaTiempo[];
  timeline_filter: "day" | "week" | "month" | "3months";
  on_update_event: (evento_id: string, campo: "time" | "description", valor: string) => void;
  on_remove_event: (evento_id: string) => void;
}

/**
 * Permite editar período y descripción de eventos en formato de tabla plana.
 */
export const ProblemTimelineTable: React.FC<PropiedadesTablaTimeline> = ({
  events,
  timeline_filter,
  on_update_event,
  on_remove_event,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#0070C0] text-white">
          <tr>
            <th className="px-4 py-3 w-1/4 font-semibold border-r border-blue-600 uppercase">
              {translate("pdcaPlan.dynamic.periodo")}
              {timeline_filter})
            </th>
            <th className="px-4 py-3 font-semibold border-r border-blue-600 uppercase">
              {translate("pdcaPlan.dynamic.descripciNEvento")}
            </th>
            <th className="px-4 py-3 w-16 text-center uppercase">
              {translate("pdcaPlan.dynamic.acciones")}
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((evento_item) => (
            <tr key={evento_item.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-2 border-r">
                <Input
                  value={evento_item.time}
                  onChange={(evento) =>
                    on_update_event(evento_item.id, "time", evento.target.value)
                  }
                  placeholder={`Ej: ${timeline_filter === "day" ? "Lun" : "Semana 1"}...`}
                  className="border-none shadow-none focus-visible:ring-1 h-8"
                />
              </td>
              <td className="px-4 py-2 border-r">
                <AutoResizeTextarea
                  value={evento_item.description}
                  onChange={(texto) => on_update_event(evento_item.id, "description", texto)}
                  placeholder={translate("pdcaPlan.dynamic.descripciNDelEvento")}
                  className="border-none shadow-none focus-visible:ring-1 min-h-[32px] pt-1.5"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => on_remove_event(evento_item.id)}
                >
                  <Trash2 className="size-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                {translate("pdcaPlan.dynamic.noHayEventosEnLa")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
