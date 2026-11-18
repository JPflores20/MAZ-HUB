/**
 * @fileoverview Leyenda inferior con indicadores visuales de series y coeficientes de Pearson calculados.
 */
import { useTranslation } from "react-i18next";
import {
  calcular_correlacion_pearson,
  type PuntoCorrelacion,
  type SerieCorrelacion,
} from "./flavor_correlation_utils";

interface PropiedadesLeyendaCorrelacion {
  series_de_datos: SerieCorrelacion[];
}

const normalizar_puntos = (serie: SerieCorrelacion): PuntoCorrelacion[] =>
  (Array.isArray(serie.points)
    ? serie.points
    : Object.values(serie.points || {})) as PuntoCorrelacion[];

/**
 * Despliega la insignia amarilla de correlación de Pearson por cada serie graficada.
 */
export function FlavorCorrelationLegend({
  series_de_datos,
}: PropiedadesLeyendaCorrelacion) {
  const { t: translate } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 items-end">
      <span className="font-bold text-sm mb-1 w-full text-center sm:w-auto sm:text-left">
        Pearson Correlation
      </span>
      {series_de_datos.map((serie_leyenda) => (
        <div key={`leyenda-${serie_leyenda.id}`} className="flex flex-col items-center">
          <span className="flex items-center gap-1 text-xs font-semibold">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: serie_leyenda.fill,
                borderColor: serie_leyenda.stroke,
                borderWidth: 1,
              }}
            />
            {serie_leyenda.name}
          </span>
          <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1 rounded-sm">
            {calcular_correlacion_pearson(normalizar_puntos(serie_leyenda))}
          </span>
        </div>
      ))}
      {series_de_datos.length === 0 && (
        <span className="text-muted-foreground text-xs italic mb-1">
          {translate("pdcaPlan.paso11_flavor_chart_no_series")}
        </span>
      )}
    </div>
  );
}
