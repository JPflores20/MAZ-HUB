/**
 * @fileoverview Celdas finales de seguimiento operativo (Comentarios, Responsable, Fecha, Estado y SDCA) de ActionPlanRow.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { format } from "date-fns";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";
import { cn } from "@/shared/utils/class_names";
import { TableCell } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ActionItem } from "@/domain/pdca";
import { COLOR_POR_ESTADO, OPCIONES_ESTADO } from "./action_plan_utils";

interface PropiedadesCeldasSeguimiento {
  fila: ActionItem;
  al_actualizar_campo: (campo: keyof ActionItem, valor: string) => void;
}

const CLAVE_TRADUCCION_ESTADO: Record<ActionItem["status"], string> = {
  Pendiente: "pending",
  "En progreso": "inProgress",
  Retrasado: "delayed",
  Completada: "completed",
};

/**
 * Renderiza comentarios, responsable, fecha compromiso, estatus y herramienta SDCA de una acción.
 */
export const CeldaSeguimientoAccion: React.FC<PropiedadesCeldasSeguimiento> = ({
  fila,
  al_actualizar_campo,
}) => {
  const { t: translate } = useTranslation();

  return (
    <>
      <TableCell className="p-1 border-r min-w-[180px]">
        <TextareaAutosize
          minRows={1}
          value={fila.comentarios || ""}
          onChange={(evento) => al_actualizar_campo("comentarios", evento.target.value)}
          placeholder={translate("pdcaTables.actionPlan.placeholders.comments")}
          className="w-full text-xs text-justify p-2 bg-transparent border-0 resize-none outline-none focus:ring-1 focus:ring-primary rounded"
        />
      </TableCell>

      <TableCell className="p-1 border-r min-w-[140px]">
        <Input
          value={fila.responsable || ""}
          onChange={(evento) => al_actualizar_campo("responsable", evento.target.value)}
          placeholder={translate("pdcaTables.actionPlan.placeholders.responsible")}
          className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
        />
      </TableCell>

      <TableCell className="p-1 border-r">
        <DatePicker
          date={fila.fecha ? new Date(fila.fecha + "T12:00:00") : undefined}
          setDate={(fecha) =>
            al_actualizar_campo("fecha", fecha ? format(fecha, "yyyy-MM-dd") : "")
          }
          className="h-8 text-[11px] px-2 bg-transparent border-0 shadow-none hover:bg-muted/50 rounded"
          placeholder="-"
        />
      </TableCell>

      <TableCell className="p-1 border-r">
        <Select
          value={fila.status}
          onValueChange={(estado) => al_actualizar_campo("status", estado)}
        >
          <SelectTrigger
            className={cn(
              "h-8 text-[10px] font-semibold rounded border px-2 shadow-none [&>span]:line-clamp-none",
              COLOR_POR_ESTADO[fila.status] ?? "bg-transparent text-muted-foreground border-border",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCIONES_ESTADO.map((estado_opcion) => (
              <SelectItem key={estado_opcion} value={estado_opcion}>
                {translate(
                  `pdcaTables.actionPlan.statusOptions.${CLAVE_TRADUCCION_ESTADO[estado_opcion]}`,
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="p-1 border-r min-w-[100px]">
        <Input
          value={fila.herramientaSdca || ""}
          onChange={(evento) => al_actualizar_campo("herramientaSdca", evento.target.value)}
          placeholder={translate("pdcaTables.actionPlan.placeholders.sdca")}
          className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
        />
      </TableCell>
    </>
  );
};
