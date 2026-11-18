/**
 * @fileoverview Pruebas unitarias de correlación de Pearson, regresión lineal y parseo desde Excel.
 */
import { describe, it, expect } from "vitest";
import {
  calcular_correlacion_pearson,
  calcular_linea_tendencia,
  parsear_puntos_desde_texto,
} from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";

describe("flavor_correlation_utils", () => {
  it("calcula correlación de Pearson positiva y negativa correctamente", () => {
    expect(
      calcular_correlacion_pearson([
        { id: 1, x: 10, y: 6.0 },
        { id: 2, x: 20, y: 7.0 },
        { id: 3, x: 30, y: 8.0 },
      ]),
    ).toBe("1.000");

    expect(
      calcular_correlacion_pearson([
        { id: 1, x: 10, y: 8.0 },
        { id: 2, x: 20, y: 7.0 },
        { id: 3, x: 30, y: 6.0 },
      ]),
    ).toBe("-1.000");
  });

  it("calcula los extremos de la recta de regresión lineal (calcular_linea_tendencia)", () => {
    const tendencia = calcular_linea_tendencia([
      { id: 1, x: 10, y: 6.0 },
      { id: 2, x: 20, y: 7.0 },
      { id: 3, x: 30, y: 8.0 },
    ]);
    expect(tendencia).toHaveLength(2);
    expect(tendencia[0]).toEqual({ id: -1, x: 10, y: 6 });
    expect(tendencia[1]).toEqual({ id: -2, x: 30, y: 8 });
  });

  it("parsea pares (X, Y) copiados desde Excel con tabuladores o comas decimales", () => {
    const texto_excel = "30\t6.3\n45\t7,1\n70;7.8\nfila_invalida";
    const puntos = parsear_puntos_desde_texto(texto_excel);
    expect(puntos).toHaveLength(3);
    expect(puntos[0]).toMatchObject({ x: 30, y: 6.3 });
    expect(puntos[1]).toMatchObject({ x: 45, y: 7.1 });
    expect(puntos[2]).toMatchObject({ x: 70, y: 7.8 });
  });
});
