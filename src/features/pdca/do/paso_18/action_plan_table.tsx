/**
 * @fileoverview Tabla interactiva del Plan de Acción con reordenamiento Drag & Drop, matriz de impacto y 5W2H.
 */
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/shared/ui/table";
import { StepCard } from "@/shared/ui/step_card";
import type { ActionItem } from "@/domain/pdca";
import { StepInstructions } from "../../components/step_instructions";
import { crear_fila_accion_vacia } from "./action_plan_utils";
import { FilaAccionPlan } from "./action_plan_row";
import { ActionPlanDeleteDialog } from "./action_plan_delete_dialog";
import { ActionPlanTableHeader } from "./action_plan_header";

interface PropiedadesActionPlanTable {
  items: ActionItem[];
  onChange: (nuevas_acciones: ActionItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  defaultExpanded?: boolean | undefined;
  title?: string | undefined;
  bottomContent?: React.ReactNode;
}

/**
 * Orquesta el Plan de Acción con cálculo multiplicativo de impacto, prioridades y respaldo Drag & Drop.
 */
export function ActionPlanTable({
  items: acciones_plan,
  onChange: al_cambiar_acciones,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  defaultExpanded,
  title,
  bottomContent,
}: PropiedadesActionPlanTable) {
  const { t: translate } = useTranslation();
  const [fila_a_eliminar, set_fila_a_eliminar] = useState<{
    id: string;
    indice: number;
    descripcion: string;
  } | null>(null);

  const agregar_fila = () => al_cambiar_acciones([...acciones_plan, crear_fila_accion_vacia()]);

  const actualizar_fila = (
    accion_id: string,
    campo: keyof ActionItem,
    valor: string,
    indice?: number,
  ) => {
    al_cambiar_acciones(
      acciones_plan.map((fila_actual, indice_actual) =>
        (fila_actual.id && fila_actual.id === accion_id) ||
        (indice !== undefined && indice_actual === indice)
          ? { ...fila_actual, id: fila_actual.id || accion_id, [campo]: valor }
          : fila_actual,
      ),
    );
  };

  const solicitar_eliminar_fila = (accion_id: string, indice: number, fila: ActionItem) => {
    const descripcion =
      (fila.accion || fila.causaRaiz || fila.tema || "").trim() || `Acción #${indice + 1}`;
    set_fila_a_eliminar({ id: accion_id, indice, descripcion });
  };

  const confirmar_eliminar_fila = () => {
    if (!fila_a_eliminar) return;
    const { id: accion_id, indice } = fila_a_eliminar;
    const restantes = acciones_plan.filter((fila_actual, indice_actual) => {
      if (indice_actual === indice) return false;
      if (
        accion_id &&
        fila_actual.id === accion_id &&
        acciones_plan.filter((candidato) => candidato.id === accion_id).length === 1
      ) {
        return false;
      }
      return true;
    });
    set_fila_a_eliminar(null);
    al_cambiar_acciones(restantes);
  };

  const sensores_dnd = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const manejar_fin_arrastre = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (over && active.id !== over.id) {
      const indice_origen = acciones_plan.findIndex((accion) => accion.id === active.id);
      const indice_destino = acciones_plan.findIndex((accion) => accion.id === over.id);
      al_cambiar_acciones(arrayMove(acciones_plan, indice_origen, indice_destino));
    }
  };

  return (
    <StepCard
      title={title ?? translate("pdcaTables.actionPlan.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      defaultExpanded={defaultExpanded}
      onToggleNa={onToggleNa}
      headerRight={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(evento) => {
            evento.stopPropagation();
            agregar_fila();
          }}
        >
          <Plus className="mr-1.5 size-3.5" /> {translate("pdcaTables.actionPlan.addAction")}
        </Button>
      }
    >
      <StepInstructions>
        <p className="mb-1">
          {translate("pdcaTables.actionPlan.instruction1")}
          <span className="text-primary underline cursor-default">
            {translate("pdcaTables.actionPlan.instruction1Highlight")}
          </span>
          .
        </p>
        <p>{translate("pdcaTables.actionPlan.instruction2")}</p>
      </StepInstructions>

      <DndContext sensors={sensores_dnd} collisionDetection={closestCenter} onDragEnd={manejar_fin_arrastre}>
        <div className="overflow-x-auto border rounded-md mt-4">
          <Table className="text-xs min-w-[1550px]">
            <ActionPlanTableHeader translate={translate} />
            <TableBody>
              <SortableContext
                items={acciones_plan.map((accion, indice) => accion.id || `row-${indice}`)}
                strategy={verticalListSortingStrategy}
              >
                {acciones_plan.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8 text-muted-foreground">
                      {translate("pdcaTables.actionPlan.noActions")}
                    </TableCell>
                  </TableRow>
                )}
                {acciones_plan.map((fila_actual, indice_fila) => (
                  <FilaAccionPlan
                    key={fila_actual.id || `row-${indice_fila}`}
                    fila={{ ...fila_actual, id: fila_actual.id || `row-${indice_fila}` }}
                    al_actualizar={(accion_id, campo, valor) =>
                      actualizar_fila(accion_id, campo, valor, indice_fila)
                    }
                    al_eliminar={(accion_id) =>
                      solicitar_eliminar_fila(accion_id, indice_fila, fila_actual)
                    }
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <ActionPlanDeleteDialog
        descripcion_accion={fila_a_eliminar?.descripcion ?? null}
        al_cerrar={() => set_fila_a_eliminar(null)}
        al_confirmar={confirmar_eliminar_fila}
      />

      {bottomContent}
    </StepCard>
  );
}
