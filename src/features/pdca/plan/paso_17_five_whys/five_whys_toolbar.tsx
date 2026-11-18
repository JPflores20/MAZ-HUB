/**
 * @fileoverview Barra superior editable para controlar título, columnas ¿Por qué?, filas y borrado en 5 Why's.
 */
import { useTranslation } from "react-i18next";
import { Plus, MinusCircle, X, Maximize2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
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
import type { PropiedadesBarraHerramientas } from "./five_whys_types";

/**
 * Despliega controles por tabla para añadir/quitar niveles de profundidad, agregar causas o expandir.
 */
export function BarraHerramientasTabla({
  titulo,
  al_cambiar_titulo,
  indice,
  es_pantalla_completa,
  al_expandir,
  cantidad_porques,
  al_agregar_porque,
  al_quitar_porque,
  al_agregar_causa,
  al_eliminar_tabla,
}: PropiedadesBarraHerramientas) {
  const { t: translate } = useTranslation();

  return (
    <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
      <input
        type="text"
        value={titulo || "MÉTODO"}
        onChange={(evento) => al_cambiar_titulo?.(evento.target.value)}
        className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48"
        placeholder="TÍTULO DE LA TABLA"
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={al_agregar_porque}
          >
            <Plus className="mr-1 size-3" />
            {translate("pdcaPlan.paso17_five_whys_add_why")}
          </Button>
          {cantidad_porques > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
              onClick={al_quitar_porque}
            >
              <MinusCircle className="mr-1 size-3" />
              {translate("pdcaPlan.paso17_five_whys_remove_why")}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
          onClick={al_agregar_causa}
        >
          <Plus className="mr-1 size-3" />
          {translate("pdcaPlan.paso17_five_whys_add_cause")}
        </Button>
        {al_eliminar_tabla && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
              >
                <X className="mr-1 size-3" />
                {translate("pdcaPlan.paso17_five_whys_delete_table")}
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
                <AlertDialogCancel>
                  {translate("pdcaPlan.paso16_ishikawa_cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={al_eliminar_tabla}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {translate("pdcaPlan.paso17_five_whys_delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!es_pantalla_completa && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={al_expandir}
          >
            <Maximize2 className="mr-1 size-3" />
            {translate("pdcaPlan.paso17_five_whys_expand")}
          </Button>
        )}
        <span className="text-[11px] font-bold text-[#0078D7] uppercase">
          TEMA {String(indice + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
