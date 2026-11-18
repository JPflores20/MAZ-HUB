/**
 * @fileoverview Celdas de calificación (Causa Raíz Sí/No), acción y confirmación de borrado de fila en 5 Why's.
 */
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AutoResizeTextarea } from "../../components/auto_resize_textarea";
import { cn } from "@/shared/utils/class_names";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert_dialog";
import type { FilaCincoPorques } from "./five_whys_types";

interface PropiedadesCeldasAccionFila {
  fila: FilaCincoPorques;
  puede_eliminar: boolean;
  al_actualizar_fila: (fila_id: number, campo: string, valor: string) => void;
  al_eliminar_fila: (fila_id: number) => void;
}

/**
 * Renderiza las columnas finales de un bloque de 5 Porqués: selector Sí/No, texto de acción y botón eliminar.
 */
export function FiveWhysRowActions({
  fila,
  puede_eliminar,
  al_actualizar_fila,
  al_eliminar_fila,
}: PropiedadesCeldasAccionFila) {
  const { t: translate } = useTranslation();

  return (
    <>
      <td
        rowSpan={2}
        className={cn(
          "p-1 border-r border-white align-middle text-center min-w-[80px]",
          fila.isRootCause === "Sí"
            ? "bg-red-100 dark:bg-red-900/40"
            : fila.isRootCause === "No"
              ? "bg-green-100 dark:bg-green-900/40"
              : "bg-[#E2E2E2] dark:bg-secondary",
        )}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <Button
            variant={fila.isRootCause === "Sí" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              al_actualizar_fila(fila.id, "isRootCause", fila.isRootCause === "Sí" ? "" : "Sí")
            }
            className={cn(
              "h-6 w-12 text-[10px] px-0",
              fila.isRootCause === "Sí"
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : "hover:bg-red-50 dark:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
            )}
          >
            {translate("pdcaPlan.paso17_five_whys_yes")}
          </Button>
          <Button
            variant={fila.isRootCause === "No" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              al_actualizar_fila(fila.id, "isRootCause", fila.isRootCause === "No" ? "" : "No")
            }
            className={cn(
              "h-6 w-12 text-[10px] px-0",
              fila.isRootCause === "No"
                ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                : "hover:bg-green-50 dark:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400",
            )}
          >
            {translate("pdcaPlan.paso17_five_whys_no")}
          </Button>
        </div>
      </td>
      <td
        rowSpan={2}
        className={cn(
          "p-0 border-r border-white align-top",
          fila.isRootCause === "Sí"
            ? "bg-red-50 dark:bg-red-950/30"
            : fila.isRootCause === "No"
              ? "bg-green-50 dark:bg-green-950/30"
              : "bg-[#E2E2E2] dark:bg-secondary",
        )}
      >
        <AutoResizeTextarea
          value={fila.accion || ""}
          onChange={(nuevo_texto) => al_actualizar_fila(fila.id, "accion", nuevo_texto)}
          className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden"
        />
      </td>
      <td rowSpan={2} className="bg-background align-middle">
        {puede_eliminar && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block"
              >
                <X className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {translate("pdcaPlan.paso16_ishikawa_cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => al_eliminar_fila(fila.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {translate("pdcaPlan.paso17_five_whys_delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </td>
    </>
  );
}
