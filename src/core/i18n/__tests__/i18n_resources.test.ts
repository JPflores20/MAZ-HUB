/**
 * Pruebas de integridad y paridad estructural para los diccionarios modulares i18n (ES / EN).
 */
import { describe, it, expect } from "vitest";
import i18n from "../index";
import { TRADUCCION_EN } from "../locales/en";
import { TRADUCCION_ES } from "../locales/es";

/**
 * Recolecta de forma recursiva todas las rutas de claves hoja dentro de un diccionario de traducciones.
 * @param nodo_diccionario - Objeto parcial o completo de claves i18n.
 * @param prefijo_ruta - Prefijo acumulado separado por punto.
 * @returns Conjunto ordenado de rutas completas (`pdcaGlobal.plan`, etc.).
 */
function collect_translation_paths(
  nodo_diccionario: Record<string, unknown>,
  prefijo_ruta = "",
): string[] {
  const rutas_hoja: string[] = [];
  for (const [clave_actual, valor_nodo] of Object.entries(nodo_diccionario)) {
    const ruta_completa = prefijo_ruta ? `${prefijo_ruta}.${clave_actual}` : clave_actual;
    if (valor_nodo && typeof valor_nodo === "object" && !Array.isArray(valor_nodo)) {
      rutas_hoja.push(
        ...collect_translation_paths(valor_nodo as Record<string, unknown>, ruta_completa),
      );
    } else {
      rutas_hoja.push(ruta_completa);
    }
  }
  return rutas_hoja.sort();
}

describe("i18n Modular Resources", () => {
  it("inicializa correctamente con español por defecto y respaldo en inglés", () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.t("pdcaGlobal.plan", { lng: "es" })).toBe("1. PLAN");
    expect(i18n.t("pdcaGlobal.plan", { lng: "en" })).toBe("1. PLAN");
    expect(i18n.t("rda.phase1Summary", { lng: "en" })).toBe("1. Summary");
    expect(i18n.t("rda.phase1Summary", { lng: "es" })).toBe("1. Resumen");
  });

  it("mantiene exactamente las mismas claves de traducción en inglés y español", () => {
    const rutas_en = collect_translation_paths(TRADUCCION_EN as unknown as Record<string, unknown>);
    const rutas_es = collect_translation_paths(TRADUCCION_ES as unknown as Record<string, unknown>);
    expect(rutas_en).toEqual(rutas_es);
    expect(rutas_en.length).toBeGreaterThan(250);
  });
});
