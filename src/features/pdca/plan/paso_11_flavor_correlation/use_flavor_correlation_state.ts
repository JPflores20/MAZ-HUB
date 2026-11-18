/**
 * @fileoverview Hook de estado y manipuladores CRUD para el módulo de Correlación de Sabores (Paso 11).
 */
import { useEffect, useState } from "react";
import {
  COLORES_SERIES,
  type DatosCorrelacionSabor,
  type PuntoCorrelacion,
  type SerieCorrelacion,
} from "./flavor_correlation_utils";
import { normalizar_datos_correlacion } from "./flavor_correlation_defaults";

const extraer_arreglo_puntos = (serie: SerieCorrelacion): PuntoCorrelacion[] =>
  (Array.isArray(serie.points)
    ? serie.points
    : Object.values(serie.points || {})) as PuntoCorrelacion[];

/**
 * Encapsula la sincronización externa/local y acciones sobre series y puntos de dispersión.
 */
export function use_flavor_correlation_state(
  data?: DatosCorrelacionSabor | null | undefined,
  on_change?: (datos_nuevos: DatosCorrelacionSabor) => void,
) {
  const [datos_internos, set_datos_internos] = useState<DatosCorrelacionSabor>(() =>
    normalizar_datos_correlacion(data),
  );

  useEffect(() => {
    if (data !== undefined) {
      set_datos_internos(normalizar_datos_correlacion(data));
    }
  }, [data]);

  const datos_actuales =
    data !== undefined && data !== null && !Array.isArray(data)
      ? normalizar_datos_correlacion(data)
      : datos_internos;
  const lista_series = datos_actuales.seriesList;

  const actualizar_datos = (nuevos_campos: Partial<DatosCorrelacionSabor>) => {
    const siguiente_estado: DatosCorrelacionSabor = { ...datos_actuales, ...nuevos_campos };
    set_datos_internos(siguiente_estado);
    on_change?.(siguiente_estado);
  };

  const actualizar_lista_series = (
    transformador: (series_previas: SerieCorrelacion[]) => SerieCorrelacion[],
  ) => {
    actualizar_datos({ seriesList: transformador(lista_series) });
  };

  const importar_puntos_a_serie = (
    serie_id: string,
    nuevos_puntos: PuntoCorrelacion[],
    reemplazar = false,
  ) => {
    actualizar_lista_series((previas) =>
      previas.map((serie_item) =>
        serie_item.id === serie_id
          ? {
              ...serie_item,
              points: reemplazar
                ? nuevos_puntos
                : [...extraer_arreglo_puntos(serie_item), ...nuevos_puntos],
            }
          : serie_item,
      ),
    );
  };

  const agregar_nueva_serie = (tipo_serie: "positive" | "negative") => {
    const cantidad_tipo = lista_series.filter((item) => item.type === tipo_serie).length;
    if (cantidad_tipo >= 4) return;
    const color_asignado = COLORES_SERIES[lista_series.length % COLORES_SERIES.length] ?? {
      fill: "#000000",
      stroke: "#f1c40f",
    };
    actualizar_lista_series((previas) => [
      ...previas,
      {
        id: Date.now().toString(),
        name: `Nueva Serie ${cantidad_tipo + 1}`,
        type: tipo_serie,
        fill: color_asignado.fill,
        stroke: color_asignado.stroke,
        points: [],
      },
    ]);
  };

  const editar_punto = (
    serie_id: string,
    indice_objetivo: number,
    eje: "x" | "y",
    nuevo_valor: number,
  ) => {
    actualizar_lista_series((previas) =>
      previas.map((serie_item) =>
        serie_item.id === serie_id
          ? {
              ...serie_item,
              points: extraer_arreglo_puntos(serie_item).map((punto, indice) =>
                indice === indice_objetivo ? { ...punto, [eje]: nuevo_valor } : punto,
              ),
            }
          : serie_item,
      ),
    );
  };

  const eliminar_punto = (serie_id: string, indice_punto: number) => {
    actualizar_lista_series((previas) =>
      previas.map((serie_item) =>
        serie_item.id === serie_id
          ? {
              ...serie_item,
              points: extraer_arreglo_puntos(serie_item).filter(
                (_punto, indice) => indice !== indice_punto,
              ),
            }
          : serie_item,
      ),
    );
  };

  const agregar_punto = (serie_id: string) => {
    actualizar_lista_series((previas) =>
      previas.map((serie_item) =>
        serie_item.id === serie_id
          ? {
              ...serie_item,
              points: [
                ...extraer_arreglo_puntos(serie_item),
                { id: Date.now() + Math.random(), x: 0, y: 6.0 },
              ],
            }
          : serie_item,
      ),
    );
  };

  return {
    datos_actuales,
    actualizar_datos,
    importar_puntos_a_serie,
    agregar_nueva_serie,
    renombrar_serie: (serie_id: string, nombre: string) =>
      actualizar_lista_series((previas) =>
        previas.map((item) => (item.id === serie_id ? { ...item, name: nombre } : item)),
      ),
    eliminar_serie: (serie_id: string) =>
      actualizar_lista_series((previas) => previas.filter((item) => item.id !== serie_id)),
    agregar_punto,
    editar_punto,
    eliminar_punto,
  };
}
