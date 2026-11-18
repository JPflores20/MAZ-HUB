/**
 * @fileoverview Paso 18 / 25 del PDCA: Tabla resumen de conclusiones de causas raíz validadas y envío al Plan de Acción.
 */
import React from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { StepCard } from "@/shared/ui/step_card";
import type { ConclusionCausaRaizItem } from "@/domain/pdca";

interface ConclusionesCausaRaizTableProps {
  items: ConclusionCausaRaizItem[];
  onChange: (items: ConclusionCausaRaizItem[]) => void;
  onSendToActionPlan?: ((items: ConclusionCausaRaizItem[]) => void) | undefined;
  title?: string;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

const COLUMNAS_TEXTAREA: {
  campo: keyof ConclusionCausaRaizItem;
  placeholder: string;
  clase_extra?: string;
}[] = [
  { campo: "problema", placeholder: "Problema o desviación..." },
  { campo: "causaRaiz", placeholder: "Ej. Presencia de Smokey en arroz..." },
  { campo: "validacion", placeholder: "Ej. Validación estadística o prueba de hipótesis X²" },
  {
    campo: "valorP",
    placeholder: "Ej. Valor-P = 1.50 X 10^-5",
    clase_extra: "text-center font-semibold text-red-600",
  },
  { campo: "conclusion", placeholder: "Conclusión..." },
];

const CLASE_TEXTAREA_BASE =
  "w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden";

/**
 * Permite documentar la validación estadística/operacional de causas raíz y transferirlas a DO.
 */
export const ConclusionesCausaRaizTable: React.FC<ConclusionesCausaRaizTableProps> = ({
  items,
  onChange,
  onSendToActionPlan,
  title,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const agregar_fila = () => {
    const nueva_conclusion: ConclusionCausaRaizItem = {
      id: crypto.randomUUID(),
      problema: "",
      causaRaiz: "",
      validacion: "",
      valorP: "",
      conclusion: "",
    };
    onChange([...(items || []), nueva_conclusion]);
  };

  const actualizar_campo = (
    conclusion_id: string,
    campo: keyof ConclusionCausaRaizItem,
    valor: string,
  ) => {
    onChange(
      items.map((registro_actual) =>
        registro_actual.id === conclusion_id
          ? { ...registro_actual, [campo]: valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_fila = (conclusion_id: string) => {
    onChange(items.filter((registro_actual) => registro_actual.id !== conclusion_id));
  };

  const manejar_envio_plan_accion = () => {
    if (!onSendToActionPlan) return;
    const filas_validas = (items || []).filter(
      (registro_actual) =>
        String(registro_actual.causaRaiz || "").trim() !== "" ||
        String(registro_actual.problema || "").trim() !== "",
    );
    if (filas_validas.length === 0) {
      toast.error("Define al menos una causa raíz antes de enviarla al Plan de Acción.");
      return;
    }
    onSendToActionPlan(filas_validas);
  };

  return (
    <StepCard
      title={title ?? "PASO 18: CAUSAS RAÍZ DEFINIDAS"}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onSendToActionPlan && (
            <Button
              type="button"
              onClick={manejar_envio_plan_accion}
              variant="outline"
              size="sm"
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
              title="Crear acciones en Fase 2 (DO) a partir de las causas raíz definidas"
            >
              Enviar al Plan de Acción (DO) <ArrowRight className="size-4 ml-1.5" />
            </Button>
          )}
          <Button type="button" onClick={agregar_fila} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[900px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center border-r border-white/20">
                  Problema / Desviación
                </TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20 w-1/4">
                  Causa Raíz / Causa Potencial
                </TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20">
                  Técnica de Validación / Prueba Hipótesis
                </TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20">
                  Valor-P / Significancia Estadística
                </TableHead>
                <TableHead className="font-bold text-white text-center w-1/4">Conclusión</TableHead>
                <TableHead className="w-12 bg-white" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No hay causas raíz definidas. Haz clic en &quot;Agregar Fila&quot;.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((registro_actual) => (
                <TableRow key={registro_actual.id} className="border-b border-border">
                  {COLUMNAS_TEXTAREA.map(({ campo, placeholder, clase_extra }, indice_col) => (
                    <TableCell
                      key={campo}
                      className={`p-1.5 align-top ${indice_col < COLUMNAS_TEXTAREA.length - 1 ? "border-r border-border" : ""}`}
                    >
                      <TextareaAutosize
                        value={registro_actual[campo]}
                        onChange={(evento) =>
                          actualizar_campo(registro_actual.id, campo, evento.target.value)
                        }
                        placeholder={placeholder}
                        minRows={2}
                        className={`${CLASE_TEXTAREA_BASE} ${clase_extra ?? "text-justify"}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-1.5 text-center align-middle">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => eliminar_fila(registro_actual.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
