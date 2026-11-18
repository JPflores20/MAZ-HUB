/**
 * @fileoverview Cálculo estadístico de correlación de Pearson, regresión lineal y parsing tabular de puntos (X, Y).
 */

export type PuntoCorrelacion = {
  id: number;
  x: number;
  y: number;
};

export type SerieCorrelacion = {
  id: string;
  name: string;
  type: "positive" | "negative";
  fill: string;
  stroke: string;
  points: PuntoCorrelacion[];
};

export type ColoresCuadrantes = {
  cuadrante1: string;
  cuadrante2: string;
  cuadrante3: string;
  cuadrante4: string;
  xSplit?: number;
  ySplit?: number;
};

export type DatosCorrelacionSabor = {
  positiveTitle: string;
  negativeTitle: string;
  seriesList: SerieCorrelacion[];
  positiveQuadrantColors?: ColoresCuadrantes;
  negativeQuadrantColors?: ColoresCuadrantes;
};

export const UMBRAL_X_DEFECTO = 40;
export const UMBRAL_Y_DEFECTO = 7.5;

export const COLORES_CUADRANTES_POSITIVO_DEFECTO: ColoresCuadrantes = {
  cuadrante1: "#f8d7da",
  cuadrante2: "#fff3cd",
  cuadrante3: "#e2e3e5",
  cuadrante4: "#d4edda",
  xSplit: UMBRAL_X_DEFECTO,
  ySplit: UMBRAL_Y_DEFECTO,
};

export const COLORES_CUADRANTES_NEGATIVO_DEFECTO: ColoresCuadrantes = {
  cuadrante1: "#fff3cd",
  cuadrante2: "#f8d7da",
  cuadrante3: "#d4edda",
  cuadrante4: "#e2e3e5",
  xSplit: UMBRAL_X_DEFECTO,
  ySplit: UMBRAL_Y_DEFECTO,
};

export const OPCIONES_COLOR_CUADRANTE = [
  { nombre: "Verde", valor: "#d4edda" },
  { nombre: "Amarillo", valor: "#fff3cd" },
  { nombre: "Rojo", valor: "#f8d7da" },
  { nombre: "Gris", valor: "#e2e3e5" },
  { nombre: "Azul", valor: "#cfe2ff" },
  { nombre: "Blanco", valor: "#ffffff" },
];

export const COLORES_SERIES = [
  { fill: "#000000", stroke: "#f1c40f" },
  { fill: "#f1c40f", stroke: "#000000" },
  { fill: "#4a2e00", stroke: "#000000" },
  { fill: "#654321", stroke: "#f1c40f" },
  { fill: "#3498db", stroke: "#2980b9" },
  { fill: "#e74c3c", stroke: "#c0392b" },
];

/**
 * Calcula el coeficiente de correlación lineal r de Pearson entre las coordenadas X e Y.
 */
export function calcular_correlacion_pearson(puntos: PuntoCorrelacion[]): string {
  if (puntos.length < 2) return "0.000";
  let suma_x = 0;
  let suma_y = 0;
  let suma_xy = 0;
  let suma_x2 = 0;
  let suma_y2 = 0;

  for (const punto of puntos) {
    suma_x += punto.x;
    suma_y += punto.y;
    suma_xy += punto.x * punto.y;
    suma_x2 += punto.x * punto.x;
    suma_y2 += punto.y * punto.y;
  }

  const cantidad_puntos = puntos.length;
  const numerador = cantidad_puntos * suma_xy - suma_x * suma_y;
  const denominador = Math.sqrt(
    (cantidad_puntos * suma_x2 - suma_x * suma_x) *
      (cantidad_puntos * suma_y2 - suma_y * suma_y),
  );
  if (denominador === 0) return "0.000";
  return (numerador / denominador).toFixed(3);
}

/**
 * Calcula los dos puntos extremos (inicio y fin) de la recta de regresión lineal y = mx + b.
 */
export function calcular_linea_tendencia(puntos: PuntoCorrelacion[]): PuntoCorrelacion[] {
  if (puntos.length < 2) return [];
  let suma_x = 0;
  let suma_y = 0;
  let suma_xy = 0;
  let suma_x2 = 0;
  let minimo_x = Infinity;
  let maximo_x = -Infinity;

  for (const punto of puntos) {
    suma_x += punto.x;
    suma_y += punto.y;
    suma_xy += punto.x * punto.y;
    suma_x2 += punto.x * punto.x;
    if (punto.x < minimo_x) minimo_x = punto.x;
    if (punto.x > maximo_x) maximo_x = punto.x;
  }

  const cantidad_puntos = puntos.length;
  const denominador = cantidad_puntos * suma_x2 - suma_x * suma_x;
  if (denominador === 0 || minimo_x === maximo_x) return [];

  const pendiente = (cantidad_puntos * suma_xy - suma_x * suma_y) / denominador;
  const interseccion = (suma_y - pendiente * suma_x) / cantidad_puntos;

  return [
    {
      id: -1,
      x: Number(minimo_x.toFixed(2)),
      y: Number((pendiente * minimo_x + interseccion).toFixed(3)),
    },
    {
      id: -2,
      x: Number(maximo_x.toFixed(2)),
      y: Number((pendiente * maximo_x + interseccion).toFixed(3)),
    },
  ];
}

/**
 * Convierte texto copiado desde Excel/CSV en pares numéricos válidos (X, Y).
 */
export function parsear_puntos_desde_texto(texto_crudo: string): PuntoCorrelacion[] {
  if (!texto_crudo || !texto_crudo.trim()) return [];
  const lineas_texto = texto_crudo.trim().split(/\r?\n/);
  const puntos_extraidos: PuntoCorrelacion[] = [];

  lineas_texto.forEach((linea_cruda, indice_linea) => {
    const linea_limpia = linea_cruda.trim();
    if (!linea_limpia) return;

    const columnas = linea_limpia.includes("\t")
      ? linea_limpia.split("\t")
      : linea_limpia.includes(";")
        ? linea_limpia.split(";")
        : linea_limpia.split(/\s+|,/);

    if (columnas.length >= 2) {
      const texto_x = columnas[0]?.trim().replace(",", ".") ?? "";
      const texto_y = columnas[1]?.trim().replace(",", ".") ?? "";
      const valor_x = Number(texto_x);
      const valor_y = Number(texto_y);
      if (
        texto_x !== "" &&
        texto_y !== "" &&
        Number.isFinite(valor_x) &&
        Number.isFinite(valor_y)
      ) {
        puntos_extraidos.push({
          id: Date.now() + indice_linea + Math.random(),
          x: valor_x,
          y: valor_y,
        });
      }
    }
  });

  return puntos_extraidos;
}
