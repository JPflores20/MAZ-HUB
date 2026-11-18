/**
 * @fileoverview Diálogo modal para importar datos pegados desde Excel hacia la tabla Pareto.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { ParetoImportDialogProps } from "./pareto_types";

/**
 * Permite pegar columnas copiadas desde Excel/CSV y agrupar automáticamente por categoría.
 */
export function ParetoImportDialog({
  is_open,
  on_open_change,
  on_import,
}: ParetoImportDialogProps) {
  const [texto_pegado, set_texto_pegado] = useState("");

  const confirmar_importacion = () => {
    if (!texto_pegado.trim()) return;
    on_import(texto_pegado);
    set_texto_pegado("");
    on_open_change(false);
  };

  const cancelar_importacion = () => {
    set_texto_pegado("");
    on_open_change(false);
  };

  return (
    <Dialog open={is_open} onOpenChange={on_open_change}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Datos (Copiar y Pegar desde Excel)</DialogTitle>
          <DialogDescription>
            Copia dos columnas de tu Excel (Categoría y Frecuencia/Costo) y pégalas aquí. Los datos
            se agruparán automáticamente por categoría. Soporta miles de filas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={texto_pegado}
            onChange={(evento) => set_texto_pegado(evento.target.value)}
            placeholder={"Ejemplo:\nFalla A\t10\nFalla B\t5\nFalla A\t15"}
            className="min-h-[200px] text-xs font-mono whitespace-pre"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelar_importacion}>
              Cancelar
            </Button>
            <Button onClick={confirmar_importacion}>Importar y Generar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
