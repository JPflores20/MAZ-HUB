/**
 * @fileoverview Step 9 Root-Cause Validation Table with Ishikawa import and confirmation dialog.
 */

import { useState } from "react";
import { ArrowDownToLine, ArrowRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RdaValidationAction } from "@/domain/models/rda";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { RdaValidationDeleteDialog } from "./rda_validation_delete_dialog";
import { RdaValidationRow } from "./rda_validation_row";

interface RdaValidationTableProps {
  items: RdaValidationAction[];
  onChange: (items: RdaValidationAction[]) => void;
  onImportFromIshikawa?: (() => void) | undefined;
  onSendToPda?: (() => void) | undefined;
}

/** Manages hypothesis validation actions to confirm or discard potential root causes. */
export function RdaValidationTable({
  items,
  onChange,
  onImportFromIshikawa,
  onSendToPda,
}: RdaValidationTableProps) {
  const { t } = useTranslation();
  const [row_to_delete, set_row_to_delete] = useState<{
    id: string;
    index: number;
    description: string;
  } | null>(null);

  const handle_add_row = () => {
    onChange([
      ...items,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        categoria: "Mano de obra",
        causaPotencial: "",
        accion: "",
        responsable: "",
        fechaLimite: "",
        estatus: "Pendiente",
        esCausaRaiz: "NO",
      },
    ]);
  };

  const handle_update_row = (
    row_id: string,
    field_name: keyof RdaValidationAction,
    value: string,
    row_index: number,
  ) => {
    onChange(
      items.map((existing_row, current_index) =>
        (existing_row.id && existing_row.id === row_id) || current_index === row_index
          ? { ...existing_row, id: existing_row.id || row_id, [field_name]: value }
          : existing_row,
      ),
    );
  };

  const handle_request_delete = (row_item: RdaValidationAction, row_index: number) => {
    const description =
      (row_item.accion || row_item.causaPotencial || "").trim() ||
      `Acción de validación #${row_index + 1}`;
    set_row_to_delete({ id: row_item.id, index: row_index, description });
  };

  const handle_confirm_delete = () => {
    if (!row_to_delete) return;
    const { id, index } = row_to_delete;
    const next_items = items.filter((existing_row, current_index) => {
      if (current_index === index) return false;
      if (id && existing_row.id === id && items.filter((entry) => entry.id === id).length === 1) {
        return false;
      }
      return true;
    });
    set_row_to_delete(null);
    onChange(next_items);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          ✓ Las causas con <strong>¿Es Causa Raíz? = Sí</strong> se colocan automáticamente en el
          Paso 11 (Causa Raíz)
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {onImportFromIshikawa && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onImportFromIshikawa}
              className="h-8 text-xs font-semibold gap-1.5"
              title="Traer causas registradas en el Diagrama de Ishikawa (Paso 5)"
            >
              <ArrowDownToLine className="size-3.5" />
              Importar causas del Ishikawa
            </Button>
          )}
          {onSendToPda && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSendToPda}
              className="h-8 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 gap-1.5"
              title="Enviar causas raíz validadas (Sí) al Plan de Acción / PDA (Paso 11)"
            >
              Enviar Causas Raíz al PDA (Paso 11)
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0078D7] [&_th]:text-white">
              <TableRow className="hover:bg-[#0078D7]">
                <TableHead className="w-[150px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rdaInternal.categoryM")}
                </TableHead>
                <TableHead className="w-[240px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rda.potentialCause")}
                </TableHead>
                <TableHead className="w-[280px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rdaInternal.validationAction")}
                </TableHead>
                <TableHead className="w-[120px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rdaInternal.isRootCause")}
                </TableHead>
                <TableHead className="w-[150px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rdaInternal.responsible")}
                </TableHead>
                <TableHead className="w-[130px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
                  {t("rda.deadline")}
                </TableHead>
                <TableHead className="w-[130px] font-bold uppercase text-[10px] tracking-wider text-white">
                  {t("rda.status")}
                </TableHead>
                <TableHead className="w-[50px] text-white" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row_item, row_index) => (
                <RdaValidationRow
                  key={row_item.id || `val-row-${row_index}`}
                  row={row_item}
                  row_index={row_index}
                  on_update_field={handle_update_row}
                  on_request_delete={handle_request_delete}
                />
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {t("rdaInternal.noValidationActions")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={handle_add_row} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("rdaInternal.addValidationAction")}
      </Button>

      <RdaValidationDeleteDialog
        description={row_to_delete ? row_to_delete.description : null}
        on_close={() => set_row_to_delete(null)}
        on_confirm={handle_confirm_delete}
      />
    </div>
  );
}
