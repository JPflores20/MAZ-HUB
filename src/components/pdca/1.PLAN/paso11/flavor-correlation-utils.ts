/**
 * flavor-correlation-utils.ts
 * Cálculo del coeficiente de correlación, regresión lineal y formateo de series.
 */
export type PuntoCorrelacion = { id: number; x: number; y: number };

export type SerieCorrelacion = {
  id: string;
  name: string;
  type: "positive" | "negative";
  fill: string;
  stroke: string;
  points: PuntoCorrelacion[];
};

export type ColoresCuadrantes = {
  cuadrante1: string; // Inferior Izquierdo
  cuadrante2: string; // Inferior Derecho
  cuadrante3: string; // Superior Izquierdo
  cuadrante4: string; // Superior Derecho
  xSplit?: number; // Umbral vertical X (por defecto 40)
  ySplit?: number; // Umbral horizontal Y (por defecto 7.5)
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
  cuadrante1: "#f8d7da", // Inferior Izquierdo
  cuadrante2: "#fff3cd", // Inferior Derecho
  cuadrante3: "#e2e3e5", // Superior Izquierdo
  cuadrante4: "#d4edda", // Superior Derecho
  xSplit: UMBRAL_X_DEFECTO,
  ySplit: UMBRAL_Y_DEFECTO,
};

export const COLORES_CUADRANTES_NEGATIVO_DEFECTO: ColoresCuadrantes = {
  cuadrante1: "#fff3cd", // Inferior Izquierdo
  cuadrante2: "#f8d7da", // Inferior Derecho
  cuadrante3: "#d4edda", // Superior Izquierdo
  cuadrante4: "#e2e3e5", // Superior Derecho
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

export function calcularCorrelacionPearson(puntos: PuntoCorrelacion[]): string {
  if (puntos.length < 2) return "0.000";
  let sumaX = 0,
    sumaY = 0,
    sumaXY = 0,
    sumaX2 = 0,
    sumaY2 = 0;
  for (const punto of puntos) {
    sumaX += punto.x;
    sumaY += punto.y;
    sumaXY += punto.x * punto.y;
    sumaX2 += punto.x * punto.x;
    sumaY2 += punto.y * punto.y;
  }
  const cantidadPuntos = puntos.length;
  const numerador = cantidadPuntos * sumaXY - sumaX * sumaY;
  const denominador = Math.sqrt(
    (cantidadPuntos * sumaX2 - sumaX * sumaX) * (cantidadPuntos * sumaY2 - sumaY * sumaY),
  );
  if (denominador === 0) return "0.000";
  return (numerador / denominador).toFixed(3);
}

/**
 * Calcula los dos puntos extremos (inicio y fin) de la recta de regresión lineal (y = mx + b)
 * para graficar la línea de tendencia de una serie.
 */
export function calcularLineaTendencia(puntos: PuntoCorrelacion[]): PuntoCorrelacion[] {
  if (puntos.length < 2) return [];
  let sumaX = 0,
    sumaY = 0,
    sumaXY = 0,
    sumaX2 = 0;
  let minX = Infinity,
    maxX = -Infinity;

  for (const p of puntos) {
    sumaX += p.x;
    sumaY += p.y;
    sumaXY += p.x * p.y;
    sumaX2 += p.x * p.x;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  }

  const n = puntos.length;
  const denom = n * sumaX2 - sumaX * sumaX;
  if (denom === 0 || minX === maxX) return [];

  const pendiente = (n * sumaXY - sumaX * sumaY) / denom;
  const interseccion = (sumaY - pendiente * sumaX) / n;

  return [
    { id: -1, x: Number(minX.toFixed(2)), y: Number((pendiente * minX + interseccion).toFixed(3)) },
    { id: -2, x: Number(maxX.toFixed(2)), y: Number((pendiente * maxX + interseccion).toFixed(3)) },
  ];
}

/**
 * Convierte texto copiado de Excel / CSV (columnas X e Y separadas por tabulador, coma o punto y coma)
 * en un arreglo de PuntoCorrelacion.
 */
export function parsearPuntosDesdeTexto(texto: string): PuntoCorrelacion[] {
  if (!texto || !texto.trim()) return [];
  const lineas = texto.trim().split(/\r?\n/);
  const nuevosPuntos: PuntoCorrelacion[] = [];

  lineas.forEach((linea, idx) => {
    const limpia = linea.trim();
    if (!limpia) return;
    // Separar por tabulador, punto y coma, o coma (cuando hay 2 columnas)
    const partes = limpia.includes("\t")
      ? limpia.split("\t")
      : limpia.includes(";")
        ? limpia.split(";")
        : limpia.split(/\s+|,/);

    if (partes.length >= 2) {
      const rawX = partes[0]?.trim().replace(",", ".") ?? "";
      const rawY = partes[1]?.trim().replace(",", ".") ?? "";
      const numX = Number(rawX);
      const numY = Number(rawY);
      if (rawX !== "" && rawY !== "" && Number.isFinite(numX) && Number.isFinite(numY)) {
        nuevosPuntos.push({
          id: Date.now() + idx + Math.random(),
          x: numX,
          y: numY,
        });
      }
    }
  });

  return nuevosPuntos;
}

export const COLORES_SERIES = [
  { fill: "#000000", stroke: "#f1c40f" },
  { fill: "#f1c40f", stroke: "#000000" },
  { fill: "#4a2e00", stroke: "#000000" },
  { fill: "#654321", stroke: "#f1c40f" },
  { fill: "#3498db", stroke: "#2980b9" },
  { fill: "#e74c3c", stroke: "#c0392b" },
];


