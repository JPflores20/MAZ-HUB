import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { useTranslation } from "react-i18next";
import type { ActionItem } from "@/data/pdca";
import { crearFilaAccionVacia, ETIQUETAS_FACTORES } from "./utils/action-plan-utils";
import { FilaAccionPlan } from "./components/action-plan-row";

/** Encabezados de columna fijos de la tabla */
const COLUMNAS_FINALES = [
  { label: "COMENTARIOS", ancho: "min-w-[180px]" },
  { label: "RESPONSABLE", ancho: "min-w-[140px]" },
  { label: "FECHA", ancho: "min-w-[110px]" },
  { label: "ESTADO", ancho: "min-w-[110px]" },
  { label: "SDCA", ancho: "min-w-[100px]" },
];

interface PropiedadesActionPlanTable {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  bottomContent?: React.ReactNode;
}

/**
 * Paso 18: Matriz de Impacto y Plan de Acción.
 * Tabla editable con cálculo automático de impacto y gestión de filas.
 */
export function ActionPlanTable({
  items,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title,
  bottomContent,
}: PropiedadesActionPlanTable) {
  const { t } = useTranslation();
  const agregarFila = () => onChange([...items, crearFilaAccionVacia()]);

  const actualizarFila = (id: string, campo: keyof ActionItem, valor: string) => {
    onChange(items.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)));
  };

  const eliminarFila = (id: string) => onChange(items.filter((r) => r.id !== id));

  const COLUMNAS_FINALES_TRANS = [
    { label: t("pdcaTables.actionPlan.comments"), ancho: "min-w-[180px]" },
    { label: t("pdcaTables.actionPlan.responsible"), ancho: "min-w-[140px]" },
    { label: t("pdcaTables.actionPlan.date"), ancho: "min-w-[110px]" },
    { label: t("pdcaTables.actionPlan.status"), ancho: "min-w-[110px]" },
    { label: t("pdcaTables.actionPlan.sdca"), ancho: "min-w-[100px]" },
  ];

  return (
    <StepCard
      title={title ?? t("pdcaTables.actionPlan.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            agregarFila();
          }}
        >
          <Plus className="mr-1.5 size-3.5" /> {t("pdcaTables.actionPlan.addAction")}
        </Button>
      }
    >
      <StepInstructions>
        <p className="mb-1">
          {t("pdcaTables.actionPlan.instruction1")}
          <span className="text-primary underline cursor-default">
            {t("pdcaTables.actionPlan.instruction1Highlight")}
          </span>
          .
        </p>
        <p>
          {t("pdcaTables.actionPlan.instruction2")}
        </p>
      </StepInstructions>

      <div className="overflow-x-auto border rounded-md mt-4">
        <Table className="text-xs min-w-[1550px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              {[t("pdcaTables.actionPlan.topic"), t("pdcaTables.actionPlan.rootCause"), t("pdcaTables.actionPlan.action")].map((label) => (
                <TableHead
                  key={label}
                  className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[200px] leading-tight"
                >
                  {label}
                </TableHead>
              ))}

              {[t("pdcaTables.actionPlan.factors.safety"), t("pdcaTables.actionPlan.factors.quality"), t("pdcaTables.actionPlan.factors.cost"), t("pdcaTables.actionPlan.factors.environment"), t("pdcaTables.actionPlan.factors.service")].map((label) => (
                <TableHead
                  key={label}
                  className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[100px] leading-tight"
                >
                  {label}
                </TableHead>
              ))}

              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[110px] leading-tight">
                {t("pdcaTables.actionPlan.resultsR")}
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[95px] leading-tight">
                {t("pdcaTables.actionPlan.prioritize")}
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[95px] leading-tight">
                {t("pdcaTables.actionPlan.quickWin")}
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[110px] leading-tight">
                {t("pdcaTables.actionPlan.techRequired")}
              </TableHead>

              {COLUMNAS_FINALES_TRANS.map(({ label, ancho }) => (
                <TableHead
                  key={label}
                  className={cn(
                    "text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center leading-tight",
                    ancho,
                  )}
                >
                  {label}
                </TableHead>
              ))}
              <TableHead className="w-8 h-8 py-1 px-1" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {t("pdcaTables.actionPlan.noActions")}
                </TableCell>
              </TableRow>
            )}
            {items.map((fila) => (
              <FilaAccionPlan
                key={fila.id}
                fila={fila}
                alActualizar={actualizarFila}
                alEliminar={eliminarFila}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      {bottomContent}
    </StepCard>
  );
}
