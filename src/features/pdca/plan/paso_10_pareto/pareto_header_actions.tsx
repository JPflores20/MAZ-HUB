/**
 * @fileoverview Botonera superior de acciones para cada tarjeta Pareto (cerrar, nuevo raíz, importar Excel, agregar fila).
 */
import { FileText, Plus, X } from "lucide-react";
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
import { Button } from "@/shared/ui/button";
import { ParetoImportDialog } from "./pareto_import_dialog";

interface PropiedadesAccionesEncabezadoPareto {
  on_close?: (() => void) | undefined;
  on_add_root?: (() => void) | undefined;
  is_paste_open: boolean;
  on_paste_open_change: (abierto: boolean) => void;
  on_import_excel: (texto_crudo: string) => void;
  on_add_row: () => void;
}

/**
 * Agrupa las acciones rápidas de cabecera del diagrama de Pareto y su diálogo de importación.
 */
export function ParetoHeaderActions({
  on_close,
  on_add_root,
  is_paste_open,
  on_paste_open_change,
  on_import_excel,
  on_add_row,
}: PropiedadesAccionesEncabezadoPareto) {
  return (
    <div className="flex gap-2 flex-wrap">
      {on_close && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-4 mr-2" /> Cerrar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar Pareto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer y eliminará también sus desgloses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={on_close}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {on_add_root && (
        <Button
          variant="secondary"
          size="sm"
          onClick={(evento) => {
            evento.stopPropagation();
            on_add_root();
          }}
        >
          <Plus className="size-4 mr-2" /> Nuevo Pareto
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={(evento) => {
          evento.stopPropagation();
          on_paste_open_change(true);
        }}
      >
        <FileText className="size-4 mr-2" /> Importar Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(evento) => {
          evento.stopPropagation();
          on_add_row();
        }}
      >
        <Plus className="size-4 mr-2" /> Agregar Fila
      </Button>
      <ParetoImportDialog
        is_open={is_paste_open}
        on_open_change={on_paste_open_change}
        on_import={on_import_excel}
      />
    </div>
  );
}
