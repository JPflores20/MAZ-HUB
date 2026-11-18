/**
 * @fileoverview Fila editable y reordenable individual del Plan de Acción (Paso 18 / 19).
 */
import React from "react";
import { X, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/class_names";
import { TableCell, TableRow } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ActionItem } from "@/domain/pdca";
import { obtener_visuales_impacto } from "./action_plan_utils";
import {
  CeldaFactoresImpacto,
  CeldaSiNoAccion,
  CeldaTextareaAccion,
} from "./action_plan_cells";
import { CeldaSeguimientoAccion } from "./action_plan_trailing_cells";

interface PropiedadesFilaAccion {
  fila: ActionItem;
  al_actualizar: (accion_id: string, campo: keyof ActionItem, valor: string) => void;
  al_eliminar: (accion_id: string) => void;
}

const OPCIONES_CINCO_MEDIOS = [
  "1.- Establecer condiciones basicas del Equipo (CIL).",
  "2.- Mantener condiciones basicas de operación",
  "3.- Restaurar deterioro natural o forzado",
  "4.- Mejorar puntos debiles de diseño",
  "5.- Prevencion de errores Humanos",
];

/**
 * Renderiza una fila interactiva de la matriz de impacto y ejecución del Plan de Acción.
 */
export const FilaAccionPlan: React.FC<PropiedadesFilaAccion> = ({
  fila,
  al_actualizar,
  al_eliminar,
}) => {
  const { t: translate } = useTranslation();
  const actualizar_campo = (campo: keyof ActionItem) => (valor: string) =>
    al_actualizar(fila.id, campo, valor);
  const visuales_impacto = obtener_visuales_impacto(fila);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fila.id });

  const estilo_arrastre = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? { position: "relative" as const, zIndex: 9999, backgroundColor: "rgba(255, 255, 255, 0.9)" }
      : {}),
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={estilo_arrastre}
      className={cn("hover:bg-muted/30", isDragging && "opacity-50")}
    >
      <TableCell className="p-1 border-r w-8 align-middle">
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex justify-center items-center h-full p-2"
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </div>
      </TableCell>
      <CeldaTextareaAccion
        valor={fila.tema || ""}
        placeholder={translate("pdcaTables.actionPlan.placeholders.topic")}
        al_cambiar={actualizar_campo("tema")}
      />
      <CeldaTextareaAccion
        valor={fila.causaRaiz || ""}
        placeholder={translate("pdcaTables.actionPlan.placeholders.rootCause")}
        al_cambiar={actualizar_campo("causaRaiz")}
      />
      <CeldaTextareaAccion
        valor={fila.accion || ""}
        placeholder={translate("pdcaTables.actionPlan.placeholders.action")}
        al_cambiar={actualizar_campo("accion")}
      />

      <TableCell className="p-1 border-r min-w-[250px]">
        <Select
          value={fila.analisis5Medios || "-"}
          onValueChange={(opcion) =>
            actualizar_campo("analisis5Medios")(opcion === "-" ? "" : opcion)
          }
        >
          <SelectTrigger className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus:ring-1 focus:ring-primary rounded">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">-</SelectItem>
            {OPCIONES_CINCO_MEDIOS.map((medio) => (
              <SelectItem key={medio} value={medio}>
                {medio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <CeldaFactoresImpacto
        fila={fila}
        al_actualizar_factor={(clave_factor, puntaje) => al_actualizar(fila.id, clave_factor, puntaje)}
      />

      <TableCell className="p-1 border-r">
        <div className="px-1 h-full flex items-center justify-center">
          <div
            className={cn(
              "flex items-center justify-center w-full h-8 text-[11px] rounded border",
              visuales_impacto.color,
            )}
          >
            {visuales_impacto.texto}
          </div>
        </div>
      </TableCell>

      <CeldaSiNoAccion valor={fila.priorizar || ""} al_cambiar={actualizar_campo("priorizar")} />
      <CeldaSiNoAccion valor={fila.quickWin || ""} al_cambiar={actualizar_campo("quickWin")} />
      <CeldaSiNoAccion
        valor={fila.technologyRequired || ""}
        al_cambiar={actualizar_campo("technologyRequired")}
      />

      <CeldaSeguimientoAccion
        fila={fila}
        al_actualizar_campo={(campo, valor) => al_actualizar(fila.id, campo, valor)}
      />

      <TableCell className="p-1 text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(evento) => {
            evento.stopPropagation();
            al_eliminar(fila.id);
          }}
          title="Eliminar acción"
          className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <X className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
