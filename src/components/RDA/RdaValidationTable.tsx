/**
 * RdaValidationTable.tsx
 * Tabla para validar o descartar causas potenciales mediante pruebas y evidencias en el RDA.
 */
import { useTranslation } from "react-i18next";
import React from "react";
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
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 border-blue-200 dark:border-blue-800 hover:bg-blue-200";
    case "Completa":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "Retrasado":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
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

  const addRow = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
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

  const updateRow = (id: string, field: keyof RdaValidationAction, value: string) => {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const deleteRow = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          ✓ Las causas con <strong>¿Es Causa Raíz? = Sí</strong> se colocan automáticamente en el Paso 12 (Causa Raíz)
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
              title="Enviar causas raíz validadas (Sí) al Plan de Acción / PDA (Paso 12)"
            >
              Enviar Causas Raíz al PDA (Paso 12)
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
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.categoria}
                      onValueChange={(val) => updateRow(row.id, "categoria", val)}
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
                      onChange={(e) => updateRow(row.id, "causaPotencial", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <TextareaAutosize
                      minRows={2}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-justify shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none overflow-hidden leading-relaxed"
                      value={row.accion}
                      onChange={(e) => updateRow(row.id, "accion", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.esCausaRaiz}
                      onValueChange={(val) => updateRow(row.id, "esCausaRaiz", val)}
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
                      onChange={(e) => updateRow(row.id, "responsable", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <DatePicker
                      date={row.fechaLimite ? new Date(row.fechaLimite) : undefined}
                      setDate={(date) =>
                        updateRow(row.id, "fechaLimite", date ? date.toISOString() : "")
                      }
                      className="h-9 w-full"
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.estatus}
                      onValueChange={(val) => updateRow(row.id, "estatus", val)}
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
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(row.id)}
                      className="text-muted-foreground hover:text-destructive h-9 w-9"
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
      <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("rdaInternal.addValidationAction")}
      </Button>
    </div>
  );
}
