/**
 * @fileoverview Editable PDCA action commitments table with status tracking and SDCA linkage.
 */

import { Plus } from "lucide-react";
import type { ActionItem } from "@/domain/pdca";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ActionKanbanRow } from "./action_kanban_row";
import {
  type ActionStatusValue,
  create_empty_action_item,
  type ExtendedActionItem,
} from "./action_kanban_types";

interface ActionKanbanProps {
  acciones: ActionItem[];
  setAcciones: (updater: (previous_actions: ActionItem[]) => ActionItem[]) => void;
}

const HEADER_COLUMNS: { label: string; extra_class?: string }[] = [
  { label: "TEMA" },
  { label: "CAUSA RAÍZ" },
  { label: "ACCIÓN" },
  { label: "COMENTARIOS" },
  { label: "RESPONSABLE", extra_class: "w-[140px] text-center" },
  { label: "FECHA", extra_class: "w-[140px] text-center" },
  { label: "ESTADO", extra_class: "w-[140px] text-center" },
  { label: "HERRAMIENTA SDCA", extra_class: "text-center" },
];

/** Renders the action matrix editor allowing rows to be added, updated inline, or removed. */
export function ActionKanban({ acciones, setAcciones }: ActionKanbanProps) {
  const handle_add_action = () => {
    setAcciones((previous_actions) => [...previous_actions, create_empty_action_item()]);
  };

  const handle_update_field = (
    action_id: string,
    field_name: keyof ExtendedActionItem,
    field_value: string | boolean,
  ) => {
    setAcciones((previous_actions) =>
      previous_actions.map((action_item) =>
        action_item.id === action_id
          ? ({ ...action_item, [field_name]: field_value } as ActionItem)
          : action_item,
      ),
    );
  };

  const handle_update_status = (action_id: string, next_status: ActionStatusValue) => {
    setAcciones((previous_actions) =>
      previous_actions.map((action_item) =>
        action_item.id === action_id
          ? ({
              ...action_item,
              status: next_status as ActionItem["status"],
              done: next_status === "COMPLETADO",
            } as ActionItem)
          : action_item,
      ),
    );
  };

  const handle_remove_action = (action_id: string) => {
    setAcciones((previous_actions) =>
      previous_actions.filter((action_item) => action_item.id !== action_id),
    );
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={handle_add_action}>
          <Plus className="size-4 mr-2" /> Agregar Acción
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table className="text-xs min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              {HEADER_COLUMNS.map((column_spec) => (
                <TableHead
                  key={column_spec.label}
                  className={`text-white font-bold h-8 py-1 px-3 border-r border-white/20 ${column_spec.extra_class || ""}`}
                >
                  {column_spec.label}
                </TableHead>
              ))}
              <TableHead className="w-10 h-8 py-1 px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {acciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                  No hay acciones registradas. Haz clic en &quot;Agregar Acción&quot; para comenzar.
                </TableCell>
              </TableRow>
            )}
            {acciones.map((action_item) => (
              <ActionKanbanRow
                key={action_item.id}
                action_item={action_item as ExtendedActionItem}
                on_update_field={handle_update_field}
                on_update_status={handle_update_status}
                on_remove={handle_remove_action}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
