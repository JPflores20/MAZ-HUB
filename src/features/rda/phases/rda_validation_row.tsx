/**
 * @fileoverview Editable validation-action table row with 6M category, root-cause flag, and status styling.
 */

import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import type { RdaValidationAction } from "@/domain/models/rda";
import { Button } from "@/shared/ui/button";
import { DatePicker } from "@/shared/ui/date_picker";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { TableCell, TableRow } from "@/shared/ui/table";

interface RdaValidationRowProps {
  row: RdaValidationAction;
  row_index: number;
  on_update_field: (
    row_id: string,
    field_name: keyof RdaValidationAction,
    value: string,
    row_index: number,
  ) => void;
  on_request_delete: (row: RdaValidationAction, row_index: number) => void;
}

/** Returns color classes matching the validation row execution status. */
function get_validation_status_color(raw_status: string): string {
  switch (raw_status) {
    case "En progreso":
    case "En proceso":
      return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 font-semibold";
    case "Completa":
    case "Completada":
    case "Completo":
      return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800 hover:bg-green-200 font-semibold";
    case "Retrasado":
    case "Retrasada":
      return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-200 font-semibold";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
  }
}

/** Renders a single editable row inside RdaValidationTable. */
export function RdaValidationRow({
  row,
  row_index,
  on_update_field,
  on_request_delete,
}: RdaValidationRowProps) {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell className="align-top p-2">
        <Select
          value={row.categoria}
          onValueChange={(value) => on_update_field(row.id, "categoria", value, row_index)}
        >
          <SelectTrigger className={`h-9 ${get_validation_status_color(row.estatus)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mano de obra">{t("rdaInternal.manpower")}</SelectItem>
            <SelectItem value="Medio ambiente">{t("rdaInternal.environment")}</SelectItem>
            <SelectItem value="Máquina">{t("rdaInternal.machine")}</SelectItem>
            <SelectItem value="Método">{t("rdaInternal.method")}</SelectItem>
            <SelectItem value="Medición">{t("rdaInternal.measurement")}</SelectItem>
            <SelectItem value="Material">{t("rdaInternal.material")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="align-top p-2">
        <TextareaAutosize
          minRows={2}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-justify shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none overflow-hidden leading-relaxed"
          value={row.causaPotencial}
          onChange={(change_event) =>
            on_update_field(row.id, "causaPotencial", change_event.target.value, row_index)
          }
        />
      </TableCell>
      <TableCell className="align-top p-2">
        <TextareaAutosize
          minRows={2}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-justify shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none overflow-hidden leading-relaxed"
          value={row.accion}
          onChange={(change_event) =>
            on_update_field(row.id, "accion", change_event.target.value, row_index)
          }
        />
      </TableCell>
      <TableCell className="align-top p-2">
        <Select
          value={row.esCausaRaiz}
          onValueChange={(value) => on_update_field(row.id, "esCausaRaiz", value, row_index)}
        >
          <SelectTrigger
            className={`h-9 ${
              String(row.esCausaRaiz || "").toUpperCase() === "SI"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                : ""
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SI">{t("rdaInternal.yes")}</SelectItem>
            <SelectItem value="NO">{t("rdaInternal.no")}</SelectItem>
            <SelectItem value="Pendiente">{t("rdaInternal.toDetermine")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="align-top p-2">
        <Input
          className="h-9"
          value={row.responsable}
          onChange={(change_event) =>
            on_update_field(row.id, "responsable", change_event.target.value, row_index)
          }
        />
      </TableCell>
      <TableCell className="align-top p-2">
        <DatePicker
          date={row.fechaLimite ? new Date(row.fechaLimite) : undefined}
          setDate={(picked_date) =>
            on_update_field(
              row.id,
              "fechaLimite",
              picked_date ? picked_date.toISOString() : "",
              row_index,
            )
          }
          className="h-9 w-full"
        />
      </TableCell>
      <TableCell className="align-top p-2">
        <Select
          value={row.estatus}
          onValueChange={(value) => on_update_field(row.id, "estatus", value, row_index)}
        >
          <SelectTrigger className={`h-9 ${get_validation_status_color(row.estatus)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendiente">{t("rdaInternal.pending")}</SelectItem>
            <SelectItem value="En progreso">{t("rdaInternal.inProgress")}</SelectItem>
            <SelectItem value="Completa">{t("rdaInternal.completed")}</SelectItem>
            <SelectItem value="Retrasado">{t("rdaInternal.delayed")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="align-top p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(click_event) => {
            click_event.stopPropagation();
            on_request_delete(row, row_index);
          }}
          title="Eliminar acción de validación"
          className="text-muted-foreground hover:text-destructive h-9 w-9 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
