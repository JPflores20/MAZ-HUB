/**
 * @fileoverview Table row component for editing an individual PDCA/SDCA action commitment.
 */

import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DatePicker } from "@/shared/ui/date_picker";
import { Input } from "@/shared/ui/input";
import { TableCell, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/utils/class_names";
import {
  ACTION_STATUS_COLORS,
  type ActionStatusValue,
  type ExtendedActionItem,
  parse_action_date,
} from "./action_kanban_types";

interface ActionKanbanRowProps {
  action_item: ExtendedActionItem;
  on_update_field: (
    action_id: string,
    field_name: keyof ExtendedActionItem,
    field_value: string | boolean,
  ) => void;
  on_update_status: (action_id: string, next_status: ActionStatusValue) => void;
  on_remove: (action_id: string) => void;
}

const TEXT_COLUMNS: {
  field: "tema" | "causa" | "what" | "comentarios" | "who";
  placeholder: string;
  extra_class?: string;
}[] = [
  { field: "tema", placeholder: "Tema..." },
  { field: "causa", placeholder: "Causa raíz..." },
  { field: "what", placeholder: "Acción..." },
  { field: "comentarios", placeholder: "Comentarios..." },
  { field: "who", placeholder: "Responsable", extra_class: "text-center text-muted-foreground" },
];

/** Renders a single editable action commitment row with date picker, status select, and delete CTA. */
export function ActionKanbanRow({
  action_item,
  on_update_field,
  on_update_status,
  on_remove,
}: ActionKanbanRowProps) {
  const current_status = (action_item.status || "NO INICIADO") as ActionStatusValue;
  const status_badge_class = ACTION_STATUS_COLORS[current_status] || "bg-[#5D6770] text-white";

  return (
    <TableRow className="hover:bg-muted/30">
      {TEXT_COLUMNS.map((column_spec) => (
        <TableCell key={column_spec.field} className="p-0 border-r">
          <Input
            value={action_item[column_spec.field] || ""}
            onChange={(change_event) =>
              on_update_field(action_item.id, column_spec.field, change_event.target.value)
            }
            placeholder={column_spec.placeholder}
            className={cn(
              "h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs",
              column_spec.extra_class,
            )}
          />
        </TableCell>
      ))}

      <TableCell className="p-1 border-r relative">
        <DatePicker
          date={parse_action_date(action_item.when)}
          setDate={(selected_date) => {
            if (selected_date && !Number.isNaN(selected_date.getTime())) {
              const iso_day = selected_date.toISOString().split("T")[0];
              if (iso_day) on_update_field(action_item.id, "when", iso_day);
            } else {
              on_update_field(action_item.id, "when", "");
            }
          }}
          className="h-8 w-full text-xs shadow-none border-0 bg-transparent flex justify-center text-muted-foreground font-medium"
        />
      </TableCell>

      <TableCell className="p-1 border-r">
        <div className="relative w-full h-8">
          <select
            value={current_status}
            onChange={(change_event) =>
              on_update_status(action_item.id, change_event.target.value as ActionStatusValue)
            }
            className={cn(
              "w-full h-full text-[10px] font-bold text-center border-0 outline-none cursor-pointer rounded-sm appearance-none",
              status_badge_class,
            )}
          >
            <option value="NO INICIADO" className="bg-[#5D6770] text-white">
              NO INICIADO
            </option>
            <option value="EN PROGRESO" className="bg-[#FFC000] text-black">
              EN PROGRESO
            </option>
            <option value="COMPLETADO" className="bg-[#00B050] text-white">
              COMPLETADO
            </option>
            <option value="Pendiente" className="hidden">
              Pendiente
            </option>
            <option value="En progreso" className="hidden">
              En progreso
            </option>
            <option value="Completada" className="hidden">
              Completada
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </TableCell>

      <TableCell className="p-0 border-r">
        <Input
          value={action_item.sdca || ""}
          onChange={(change_event) =>
            on_update_field(action_item.id, "sdca", change_event.target.value)
          }
          placeholder="Herramienta SDCA"
          className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-[10px] text-center text-muted-foreground uppercase"
        />
      </TableCell>

      <TableCell className="p-0 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => on_remove(action_item.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
