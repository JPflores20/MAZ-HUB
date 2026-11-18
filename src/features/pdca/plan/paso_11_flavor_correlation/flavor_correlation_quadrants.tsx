/**
 * @fileoverview Selector visual de colores y umbrales de corte (X/Y) para cuadrantes de correlación.
 */
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  COLORES_CUADRANTES_NEGATIVO_DEFECTO,
  COLORES_CUADRANTES_POSITIVO_DEFECTO,
  OPCIONES_COLOR_CUADRANTE,
  UMBRAL_X_DEFECTO,
  UMBRAL_Y_DEFECTO,
  type ColoresCuadrantes,
} from "./flavor_correlation_utils";

interface PropiedadesSelectorCuadrantes {
  colores: ColoresCuadrantes;
  tipo_grafica: "positive" | "negative";
  al_cambiar_colores: (nuevos_colores: ColoresCuadrantes) => void;
}

const CUADRANTES_ORDEN_VISUAL: {
  clave: "cuadrante1" | "cuadrante2" | "cuadrante3" | "cuadrante4";
  etiqueta: string;
}[] = [
  { clave: "cuadrante3", etiqueta: "Sup. Izquierdo" },
  { clave: "cuadrante4", etiqueta: "Sup. Derecho" },
  { clave: "cuadrante1", etiqueta: "Inf. Izquierdo" },
  { clave: "cuadrante2", etiqueta: "Inf. Derecho" },
];

/**
 * Permite personalizar el color de cada cuadrante y los umbrales de corte X/Y en las gráficas de dispersión.
 */
export function SelectorColoresCuadrantes({
  colores,
  tipo_grafica,
  al_cambiar_colores,
}: PropiedadesSelectorCuadrantes) {
  const colores_defecto =
    tipo_grafica === "positive"
      ? COLORES_CUADRANTES_POSITIVO_DEFECTO
      : COLORES_CUADRANTES_NEGATIVO_DEFECTO;

  const actualizar_cuadrante = (
    clave_cuadrante: "cuadrante1" | "cuadrante2" | "cuadrante3" | "cuadrante4",
    nuevo_color: string,
  ) => {
    al_cambiar_colores({ ...colores, [clave_cuadrante]: nuevo_color });
  };

  const actualizar_umbral = (eje: "xSplit" | "ySplit", valor_texto: string) => {
    const numero_umbral = Number(valor_texto);
    if (valor_texto !== "" && Number.isFinite(numero_umbral)) {
      al_cambiar_colores({ ...colores, [eje]: numero_umbral });
    }
  };

  const corte_x_actual =
    typeof colores.xSplit === "number" && Number.isFinite(colores.xSplit)
      ? colores.xSplit
      : UMBRAL_X_DEFECTO;
  const corte_y_actual =
    typeof colores.ySplit === "number" && Number.isFinite(colores.ySplit)
      ? colores.ySplit
      : UMBRAL_Y_DEFECTO;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Color de Cuadrantes
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => al_cambiar_colores(colores_defecto)}
          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          title="Restaurar colores y umbrales originales"
        >
          <RotateCcw className="size-3 mr-1" />
          Restaurar
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CUADRANTES_ORDEN_VISUAL.map(({ clave, etiqueta }) => {
          const color_actual = colores[clave] || colores_defecto[clave];
          return (
            <div
              key={clave}
              className="rounded-md border p-2 space-y-1.5 transition-colors"
              style={{ backgroundColor: `${color_actual}80` }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {etiqueta}
                </span>
                <input
                  type="color"
                  value={color_actual}
                  onChange={(evento) => actualizar_cuadrante(clave, evento.target.value)}
                  className="h-5 w-6 cursor-pointer rounded border border-black/20 bg-transparent p-0"
                  title={`Elegir color personalizado para ${etiqueta}`}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {OPCIONES_COLOR_CUADRANTE.map((opcion_color) => (
                  <button
                    key={opcion_color.valor}
                    type="button"
                    onClick={() => actualizar_cuadrante(clave, opcion_color.valor)}
                    title={opcion_color.nombre}
                    className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 ${
                      color_actual.toLowerCase() === opcion_color.valor.toLowerCase()
                        ? "ring-2 ring-primary ring-offset-1 border-black/40"
                        : "border-black/25"
                    }`}
                    style={{ backgroundColor: opcion_color.valor }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/60">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground block">
            Corte Eje X (Vertical)
          </label>
          <Input
            type="number"
            step="any"
            value={corte_x_actual}
            onChange={(evento) => actualizar_umbral("xSplit", evento.target.value)}
            className="h-6 text-xs px-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground block">
            Corte Eje Y (Horizontal)
          </label>
          <Input
            type="number"
            step="0.1"
            value={corte_y_actual}
            onChange={(evento) => actualizar_umbral("ySplit", evento.target.value)}
            className="h-6 text-xs px-2"
          />
        </div>
      </div>
    </div>
  );
}
