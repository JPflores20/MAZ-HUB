import React from "react";
import { Plus, MinusCircle, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";

export interface PropiedadesBarraHerramientas {
  titulo?: string | undefined;
  alCambiarTitulo?: ((t: string) => void) | undefined;
  indice: number;
  esPantallaCompleta: boolean;
  alExpandir: () => void;
  cantidadPorques: number;
  alAgregarPorque: () => void;
  alQuitarPorque: () => void;
  alAgregarCausa: () => void;
  alEliminarTabla?: (() => void) | undefined;
}

export function BarraHerramientasTabla({
  titulo,
  alCambiarTitulo,
  indice,
  esPantallaCompleta,
  alExpandir,
  cantidadPorques,
  alAgregarPorque,
  alQuitarPorque,
  alAgregarCausa,
  alEliminarTabla,
}: PropiedadesBarraHerramientas) {
  return (
    <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
      <input
        type="text"
        value={titulo || "MÉTODO"}
        onChange={(e) => alCambiarTitulo?.(e.target.value)}
        className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48"
        placeholder="TÍTULO DE LA TABLA"
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={alAgregarPorque}
          >
            <Plus className="mr-1 size-3" /> Añadir Por Qué
          </Button>
          {cantidadPorques > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
              onClick={alQuitarPorque}
            >
              <MinusCircle className="mr-1 size-3" /> Quitar Por Qué
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
          onClick={alAgregarCausa}
        >
          <Plus className="mr-1 size-3" /> Añadir Causa
        </Button>
        {alEliminarTabla && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
              >
                <X className="mr-1 size-3" /> Eliminar Tabla
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar tabla 5 Whys?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán permanentemente todas las
                  preguntas y respuestas registradas en esta tabla.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={alEliminarTabla}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!esPantallaCompleta && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={alExpandir}
          >
            <Maximize2 className="mr-1 size-3" /> Expandir
          </Button>
        )}
        <span className="text-[11px] font-bold text-[#0078D7] uppercase">
          TEMA {String(indice + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
