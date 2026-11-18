/**
 * @fileoverview Datos por defecto y función normalizadora para objetos de correlación provenientes de Firestore.
 */
import {
  COLORES_CUADRANTES_NEGATIVO_DEFECTO,
  COLORES_CUADRANTES_POSITIVO_DEFECTO,
  type DatosCorrelacionSabor,
  type PuntoCorrelacion,
  type SerieCorrelacion,
} from "./flavor_correlation_utils";

export const DATOS_CORRELACION_POR_DEFECTO: DatosCorrelacionSabor = {
  positiveTitle:
    "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE POSITIVE ATTRIBUTES",
  negativeTitle:
    "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE NEGATIVE ATTRIBUTES",
  seriesList: [
    {
      id: "1",
      name: "Clean-End-Finish",
      type: "positive",
      fill: "#000",
      stroke: "#f1c40f",
      points: [
        { id: 1, x: 30, y: 6.3 },
        { id: 2, x: 8, y: 6.1 },
        { id: 3, x: 10, y: 6.2 },
        { id: 4, x: 70, y: 7.7 },
        { id: 5, x: 85, y: 7.1 },
      ],
    },
    {
      id: "2",
      name: "Esters",
      type: "positive",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 6, x: 10, y: 6.2 },
        { id: 7, x: 2, y: 6.1 },
        { id: 8, x: 5, y: 6.1 },
        { id: 9, x: 30, y: 7.2 },
        { id: 10, x: 55, y: 7.7 },
      ],
    },
    {
      id: "pos3",
      name: "Positivo 3",
      type: "positive",
      fill: "#3498db",
      stroke: "#2980b9",
      points: [],
    },
    {
      id: "pos4",
      name: "Positivo 4",
      type: "positive",
      fill: "#e74c3c",
      stroke: "#c0392b",
      points: [],
    },
    {
      id: "3",
      name: "Linger-Bitter",
      type: "negative",
      fill: "#4a2e00",
      stroke: "#000",
      points: [
        { id: 11, x: 30, y: 7.8 },
        { id: 12, x: 50, y: 7.1 },
        { id: 13, x: 60, y: 6.4 },
        { id: 14, x: 135, y: 6.1 },
      ],
    },
    {
      id: "4",
      name: "Smokey-Phenolic",
      type: "negative",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 15, x: 2, y: 7.7 },
        { id: 16, x: 25, y: 7.2 },
        { id: 17, x: 65, y: 6.2 },
        { id: 18, x: 70, y: 6.2 },
      ],
    },
    {
      id: "5",
      name: "Astringent-Drying",
      type: "negative",
      fill: "#654321",
      stroke: "#f1c40f",
      points: [
        { id: 19, x: 30, y: 6.2 },
        { id: 20, x: 50, y: 6.2 },
        { id: 21, x: 60, y: 6.3 },
        { id: 22, x: 50, y: 7.2 },
      ],
    },
    {
      id: "neg4",
      name: "Negativo 4",
      type: "negative",
      fill: "#9b59b6",
      stroke: "#8e44ad",
      points: [],
    },
  ],
};

/**
 * Normaliza arreglos/mapas serializados desde Firestore hacia una estructura consistente.
 */
export function normalizar_datos_correlacion(
  datos_crudos: DatosCorrelacionSabor | null | undefined | unknown,
): DatosCorrelacionSabor {
  if (!datos_crudos || Array.isArray(datos_crudos) || typeof datos_crudos !== "object") {
    return DATOS_CORRELACION_POR_DEFECTO;
  }
  const objeto_parcial = datos_crudos as Partial<DatosCorrelacionSabor>;
  const series_origen =
    objeto_parcial.seriesList ?? DATOS_CORRELACION_POR_DEFECTO.seriesList;
  const series_normalizadas = (
    Array.isArray(series_origen) ? series_origen : Object.values(series_origen || {})
  ) as SerieCorrelacion[];

  return {
    positiveTitle:
      typeof objeto_parcial.positiveTitle === "string"
        ? objeto_parcial.positiveTitle
        : DATOS_CORRELACION_POR_DEFECTO.positiveTitle,
    negativeTitle:
      typeof objeto_parcial.negativeTitle === "string"
        ? objeto_parcial.negativeTitle
        : DATOS_CORRELACION_POR_DEFECTO.negativeTitle,
    positiveQuadrantColors: {
      ...COLORES_CUADRANTES_POSITIVO_DEFECTO,
      ...(objeto_parcial.positiveQuadrantColors || {}),
    },
    negativeQuadrantColors: {
      ...COLORES_CUADRANTES_NEGATIVO_DEFECTO,
      ...(objeto_parcial.negativeQuadrantColors || {}),
    },
    seriesList: series_normalizadas.map((serie_actual) => ({
      ...serie_actual,
      points: (
        Array.isArray(serie_actual?.points)
          ? serie_actual.points
          : Object.values(serie_actual?.points || {})
      ) as PuntoCorrelacion[],
    })),
  };
}
