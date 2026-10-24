/**
 * RdaValidationTable.tsx
 * Tabla para validar o descartar causas potenciales mediante pruebas y evidencias en el RDA.
 */
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Plus, Trash2, ArrowDownToLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RdaValidationAction } from "@/data/rda";

interface RdaValidationTableProps {
  items: RdaValidationAction[];
  onChange: (items: RdaValidationAction[]) => void;
  onImportFromIshikawa?: (() => void) | undefined;
  onSendToPda?: (() => void) | undefined;
}

const getStatusColor = (status: string) => {
  switch (status) {
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
    case "Pendiente":
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
  }
};

export function RdaValidationTable({
  items,
  onChange,
  onImportFromIshikawa,
  onSendToPda,
}: RdaValidationTableProps) {
  const { t } = useTranslation();
  const [rowToDelete, setRowToDelete] = useState<{
    id: string;
    index: number;
    description: string;
  } | null>(null);

  const addRow = () => {
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

  const updateRow = (
    id: string,
    field: keyof RdaValidationAction,
    value: string,
    index?: number,
  ) => {
    onChange(
      items.map((it, idx) =>
        (it.id && it.id === id) || (index !== undefined && idx === index)
          ? { ...it, id: it.id || id, [field]: value }
          : it,
      ),
    );
  };

  const requestDeleteRow = (row: RdaValidationAction, index: number) => {
    const desc =
      (row.accion || row.causaPotencial || "").trim() || `Acción de validación #${index + 1}`;
    setRowToDelete({ id: row.id, index, description: desc });
  };

  const confirmDeleteRow = () => {
    if (!rowToDelete) return;
    const { id, index } = rowToDelete;
    const nextItems = items.filter((it, idx) => {
      if (idx === index) return false;
      if (id && it.id === id && items.filter((x) => x.id === id).length === 1) return false;
      return true;
    });
    setRowToDelete(null);
    onChange(nextItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          ✓ Las causas con <strong>¿Es Causa Raíz? = Sí</strong> se colocan automáticamente en el Paso 11 (Causa Raíz)
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
                <TableHead className="w-[50px] text-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row, idx) => (
                <TableRow key={row.id || `val-row-${idx}`}>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.categoria}
                      onValueChange={(val) => updateRow(row.id, "categoria", val, idx)}
                    >
                      <SelectTrigger className={`h-9 ${getStatusColor(row.estatus)}`}>
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
                      onChange={(e) => updateRow(row.id, "causaPotencial", e.target.value, idx)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <TextareaAutosize
                      minRows={2}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-justify shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none overflow-hidden leading-relaxed"
                      value={row.accion}
                      onChange={(e) => updateRow(row.id, "accion", e.target.value, idx)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.esCausaRaiz}
                      onValueChange={(val) => updateRow(row.id, "esCausaRaiz", val, idx)}
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
                      onChange={(e) => updateRow(row.id, "responsable", e.target.value, idx)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <DatePicker
                      date={row.fechaLimite ? new Date(row.fechaLimite) : undefined}
                      setDate={(date) =>
                        updateRow(row.id, "fechaLimite", date ? date.toISOString() : "", idx)
                      }
                      className="h-9 w-full"
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.estatus}
                      onValueChange={(val) => updateRow(row.id, "estatus", val, idx)}
                    >
                      <SelectTrigger className={`h-9 ${getStatusColor(row.estatus)}`}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteRow(row, idx);
                      }}
                      title="Eliminar acción de validación"
                      className="text-muted-foreground hover:text-destructive h-9 w-9 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
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
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("rdaInternal.addValidationAction")}
      </Button>

      <AlertDialog
        open={Boolean(rowToDelete)}
        onOpenChange={(open) => {
          if (!open) setRowToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta acción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la acción de validación{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{rowToDelete?.description}&rdquo;
              </span>
              . Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar acción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
