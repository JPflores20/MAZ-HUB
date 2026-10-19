/**
 * action-plan-table.tsx
 * Tabla interactiva del Plan de Acción (5W2H, priorización, Quick Wins, responsable, fecha compromiso y estatus).
 */
import React, { useState } from "react";
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
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { useTranslation } from "react-i18next";
import type { ActionItem } from "@/data/pdca";
import { crearFilaAccionVacia } from "./utils/action-plan-utils";
import { FilaAccionPlan } from "./components/action-plan-row";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  const [filaAEliminar, setFilaAEliminar] = useState<{
    id: string;
    index: number;
    descripcion: string;
  } | null>(null);

  const agregarFila = () => onChange([...items, crearFilaAccionVacia()]);

  const actualizarFila = (id: string, campo: keyof ActionItem, valor: string, index?: number) => {
    onChange(
      items.map((r, idx) =>
        (r.id && r.id === id) || (index !== undefined && idx === index)
          ? { ...r, id: r.id || id, [campo]: valor }
          : r,
      ),
    );
  };

  const solicitarEliminarFila = (id: string, index: number, fila: ActionItem) => {
    const desc =
      (fila.accion || fila.causaRaiz || fila.tema || "").trim() || `Acción #${index + 1}`;
    setFilaAEliminar({ id, index, descripcion: desc });
  };

  const confirmarEliminarFila = () => {
    if (!filaAEliminar) return;
    const { id, index } = filaAEliminar;
    const nextItems = items.filter((r, idx) => {
      if (idx === index) return false;
      if (id && r.id === id && items.filter((it) => it.id === id).length === 1) return false;
      return true;
    });
    setFilaAEliminar(null);
    onChange(nextItems);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

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
          type="button"
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto border rounded-md mt-4">
          <Table className="text-xs min-w-[1550px]">
            <TableHeader>
              <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
                <TableHead className="w-8 h-8 py-1 px-1 border-r border-white/20" />
                {[t("pdcaTables.actionPlan.topic"), t("pdcaTables.actionPlan.rootCause"), t("pdcaTables.actionPlan.action")].map((label) => (
                  <TableHead
                    key={label}
                    className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[200px] leading-tight"
                  >
                    {label}
                  </TableHead>
                ))}

                <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[250px] leading-tight">
                  Análisis 5 medios básicos para cero averías
                </TableHead>

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
              <SortableContext
                items={items.map((i, idx) => i.id || `row-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8 text-muted-foreground">
                      {t("pdcaTables.actionPlan.noActions")}
                    </TableCell>
                  </TableRow>
                )}
                {items.map((fila, idx) => (
                  <FilaAccionPlan
                    key={fila.id || `row-${idx}`}
                    fila={{ ...fila, id: fila.id || `row-${idx}` }}
                    alActualizar={(id, campo, valor) => actualizarFila(id, campo, valor, idx)}
                    alEliminar={(id) => solicitarEliminarFila(id, idx, fila)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <AlertDialog
        open={Boolean(filaAEliminar)}
        onOpenChange={(open) => {
          if (!open) setFilaAEliminar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta acción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará del plan la acción{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{filaAEliminar?.descripcion}&rdquo;
              </span>
              . Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminarFila}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar acción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {bottomContent}
    </StepCard>
  );
}
