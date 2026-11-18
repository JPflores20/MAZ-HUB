/**
 * @fileoverview Modal gestor para editar atributos positivos/negativos, colores de cuadrantes y puntos.
 */
import { FileText, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import type {
  ColoresCuadrantes,
  PuntoCorrelacion,
  SerieCorrelacion,
} from "./flavor_correlation_utils";
import { SelectorColoresCuadrantes } from "./flavor_correlation_quadrants";
import { EditorSerieCorrelacion } from "./flavor_correlation_editor";

interface PropiedadesDialogoCorrelacion {
  series_positivas: SerieCorrelacion[];
  series_negativas: SerieCorrelacion[];
  colores_positivos: ColoresCuadrantes;
  colores_negativos: ColoresCuadrantes;
  al_cambiar_colores_positivos: (colores: ColoresCuadrantes) => void;
  al_cambiar_colores_negativos: (colores: ColoresCuadrantes) => void;
  al_agregar_serie: (tipo: "positive" | "negative") => void;
  al_renombrar_serie: (serie_id: string, nombre: string) => void;
  al_agregar_punto: (serie_id: string) => void;
  al_eliminar_serie: (serie_id: string) => void;
  al_editar_punto: (
    serie_id: string,
    indice_punto: number,
    eje: "x" | "y",
    valor: number,
  ) => void;
  al_eliminar_punto: (serie_id: string, indice_punto: number) => void;
  al_importar_puntos: (
    serie_id: string,
    puntos: PuntoCorrelacion[],
    reemplazar?: boolean,
  ) => void;
  al_forzar_guardado?: (() => void) | undefined;
}

/**
 * Diálogo modal con edición separada de atributos positivos y negativos.
 */
export function FlavorCorrelationDialog({
  series_positivas,
  series_negativas,
  colores_positivos,
  colores_negativos,
  al_cambiar_colores_positivos,
  al_cambiar_colores_negativos,
  al_agregar_serie,
  al_renombrar_serie,
  al_agregar_punto,
  al_eliminar_serie,
  al_editar_punto,
  al_eliminar_punto,
  al_importar_puntos,
  al_forzar_guardado,
}: PropiedadesDialogoCorrelacion) {
  const paneles = [
    {
      tipo: "positive" as const,
      titulo: `Atributos Positivos (${series_positivas.length}/4)`,
      clase_titulo: "font-semibold text-green-700 dark:text-green-400",
      series: series_positivas,
      colores: colores_positivos,
      al_cambiar_colores: al_cambiar_colores_positivos,
    },
    {
      tipo: "negative" as const,
      titulo: `Atributos Negativos (${series_negativas.length}/4)`,
      clase_titulo: "font-semibold text-red-700 dark:text-red-400",
      series: series_negativas,
      colores: colores_negativos,
      al_cambiar_colores: al_cambiar_colores_negativos,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8">
          <FileText className="size-4 mr-2" /> Editar Puntos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-bold">GESTOR DINÁMICO DE CORRELACIONES</h3>
        <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-6 pr-2">
          {paneles.map((panel) => (
            <div key={panel.tipo} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className={panel.clase_titulo}>{panel.titulo}</h4>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => al_agregar_serie(panel.tipo)}
                  disabled={panel.series.length >= 4}
                  className="h-7 text-xs"
                >
                  <Plus className="size-3 mr-1" /> Nueva Correlación
                </Button>
              </div>
              <div className="rounded-md border p-3 bg-muted/20">
                <SelectorColoresCuadrantes
                  colores={panel.colores}
                  tipo_grafica={panel.tipo}
                  al_cambiar_colores={panel.al_cambiar_colores}
                />
              </div>
              {panel.series.map((serie_item) => (
                <EditorSerieCorrelacion
                  key={serie_item.id}
                  serie={serie_item}
                  al_actualizar_nombre={al_renombrar_serie}
                  al_agregar_punto={al_agregar_punto}
                  al_eliminar_serie={al_eliminar_serie}
                  al_actualizar_punto={al_editar_punto}
                  al_eliminar_punto={al_eliminar_punto}
                  al_importar_puntos={al_importar_puntos}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => al_forzar_guardado?.()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Guardar y Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
