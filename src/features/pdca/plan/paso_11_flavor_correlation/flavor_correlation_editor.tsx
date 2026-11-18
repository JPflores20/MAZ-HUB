/**
 * @fileoverview Editor tabular de pares (X, Y) e importador directo desde Excel para cada serie de correlación.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  parsear_puntos_desde_texto,
  type SerieCorrelacion,
  type PuntoCorrelacion,
} from "./flavor_correlation_utils";
import { InputPuntoNumerico } from "./input_punto_numerico";
import { FlavorCorrelationExcelPaste } from "./flavor_correlation_excel_paste";

interface PropiedadesEditorSerie {
  serie: SerieCorrelacion;
  al_actualizar_nombre: (serie_id: string, nuevo_nombre: string) => void;
  al_agregar_punto: (serie_id: string) => void;
  al_eliminar_serie: (serie_id: string) => void;
  al_actualizar_punto: (
    serie_id: string,
    indice_punto: number,
    eje: "x" | "y",
    nuevo_valor: number,
  ) => void;
  al_eliminar_punto: (serie_id: string, indice_punto: number) => void;
  al_importar_puntos?:
    | ((serie_id: string, nuevos_puntos: PuntoCorrelacion[], reemplazar?: boolean) => void)
    | undefined;
}

/**
 * Muestra nombre editable, importador de Excel y cuadrícula de puntos (X, Y) para una serie.
 */
export function EditorSerieCorrelacion({
  serie,
  al_actualizar_nombre,
  al_agregar_punto,
  al_eliminar_serie,
  al_actualizar_punto,
  al_eliminar_punto,
  al_importar_puntos,
}: PropiedadesEditorSerie) {
  const { t: translate } = useTranslation();
  const [mostrar_pegado_excel, set_mostrar_pegado_excel] = useState(false);

  const puntos_arreglo = (
    Array.isArray(serie.points) ? serie.points : Object.values(serie.points || {})
  ) as PuntoCorrelacion[];

  const procesar_texto_pegado = (texto: string, reemplazar = false): boolean => {
    const puntos_extraidos = parsear_puntos_desde_texto(texto);
    if (puntos_extraidos.length === 0) {
      toast.error("No se detectaron pares numéricos (X, Y) válidos.");
      return false;
    }
    al_importar_puntos?.(serie.id, puntos_extraidos, reemplazar);
    toast.success(`Se importaron ${puntos_extraidos.length} puntos a "${serie.name}".`);
    set_mostrar_pegado_excel(false);
    return true;
  };

  return (
    <div className="border rounded p-3 space-y-3 bg-card">
      <div className="flex justify-between items-center gap-1.5">
        <Input
          value={serie.name}
          onChange={(evento) => al_actualizar_nombre(serie.id, evento.target.value)}
          className="h-7 text-sm font-bold w-full"
          placeholder={translate("pdcaPlan.paso11_flavor_editor_series_name")}
        />
        {al_importar_puntos && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set_mostrar_pegado_excel((anterior) => !anterior)}
            className="h-7 text-xs px-2 shrink-0"
            title="Pegar columnas X e Y desde Excel"
          >
            <ClipboardPaste className="size-3 mr-1" />
            Excel
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => al_agregar_punto(serie.id)}
          className="h-7 text-xs px-2 shrink-0"
        >
          <Plus className="size-3 mr-1" />
          {translate("pdcaPlan.paso11_flavor_editor_point")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => al_eliminar_serie(serie.id)}
          className="h-7 w-7 text-destructive shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      {mostrar_pegado_excel && al_importar_puntos && (
        <FlavorCorrelationExcelPaste
          al_procesar_pegado={procesar_texto_pegado}
          al_cerrar={() => set_mostrar_pegado_excel(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {puntos_arreglo.map((punto_item, indice_punto) => (
          <div
            key={punto_item.id ?? indice_punto}
            className="flex items-center gap-1 bg-secondary/30 p-1 rounded border"
          >
            <span className="text-[10px] font-bold w-3 text-center">X</span>
            <InputPuntoNumerico
              valor={punto_item.x}
              paso="any"
              al_pegar_texto={
                al_importar_puntos
                  ? (texto) => procesar_texto_pegado(texto, false)
                  : undefined
              }
              al_cambiar={(nuevo_valor) =>
                al_actualizar_punto(serie.id, indice_punto, "x", nuevo_valor)
              }
            />
            <span className="text-[10px] font-bold w-3 text-center ml-1">Y</span>
            <InputPuntoNumerico
              valor={punto_item.y}
              paso="0.1"
              al_pegar_texto={
                al_importar_puntos
                  ? (texto) => procesar_texto_pegado(texto, false)
                  : undefined
              }
              al_cambiar={(nuevo_valor) =>
                al_actualizar_punto(serie.id, indice_punto, "y", nuevo_valor)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => al_eliminar_punto(serie.id, indice_punto)}
              className="h-6 w-6 text-destructive shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
        {puntos_arreglo.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-2">
            {translate("pdcaPlan.paso11_flavor_editor_no_points")}
          </p>
        )}
      </div>
    </div>
  );
}
