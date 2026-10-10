export type PuntoCorrelacion = { id: number; x: number; y: number };

export type SerieCorrelacion = {
  id: string;
  name: string;
  type: "positive" | "negative";
  fill: string;
  stroke: string;
  points: PuntoCorrelacion[];
};

export type DatosCorrelacionSabor = {
  positiveTitle: string;
  negativeTitle: string;
  seriesList: SerieCorrelacion[];
};

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

export const COLORES_SERIES = [
  { fill: "#000000", stroke: "#f1c40f" },
  { fill: "#f1c40f", stroke: "#000000" },
  { fill: "#4a2e00", stroke: "#000000" },
  { fill: "#654321", stroke: "#f1c40f" },
  { fill: "#3498db", stroke: "#2980b9" },
  { fill: "#e74c3c", stroke: "#c0392b" },
];
