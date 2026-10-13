/**
 * rda-name.test.ts
 * Pruebas unitarias para la extracción y normalización del nombre del RDA desde el Ishikawa.
 */
import { describe, it, expect } from "vitest";
import type { Rda } from "@/data/rda";
import { getRdaDisplayName, getRdaName, normalizeRdaName, withRdaName } from "../rda-name";

const base = (over: Partial<Rda>): Rda =>
  ({
    id: "1",
    title: "Nuevo RDA",
    ishikawa: [{ id: "i", effect: "", causes: {} }],
    ...over,
  }) as Rda;

describe("rda-name", () => {
  it("la cabeza del Ishikawa muestra el nombre del RDA", () => {
    expect(getRdaName(base({ title: "Polifenoles > 62 ppm" }))).toBe("Polifenoles > 62 ppm");
  });

  it("no muestra el título por defecto en la cabeza", () => {
    expect(getRdaName(base({ title: "Nuevo RDA" }))).toBe("");
  });

  it("editar la cabeza renombra el RDA y sincroniza el efecto", () => {
    const out = withRdaName(base({}), "Incremento en tiempos de filtración");
    expect(out.title).toBe("Incremento en tiempos de filtración");
    expect(out.ishikawa?.[0]?.effect).toBe("Incremento en tiempos de filtración");
  });

  it("RDAs viejos atorados en 'Nuevo RDA' adoptan la cabeza como nombre", () => {
    const legacy = base({
      ishikawa: [{ id: "i", effect: "Incremento en filtración", causes: {} }] as NonNullable<
        Rda["ishikawa"]
      >,
    });
    expect(normalizeRdaName(legacy).title).toBe("Incremento en filtración");
  });

  it("no toca RDAs que ya tienen nombre", () => {
    const named = base({
      title: "Polifenoles",
      ishikawa: [{ id: "i", effect: "Otro", causes: {} }] as NonNullable<Rda["ishikawa"]>,
    });
    expect(normalizeRdaName(named)).toBe(named);
  });

  it("la lista muestra la cabeza del Ishikawa aunque el RDA no se haya reabierto", () => {
    const legacy = base({
      ishikawa: [{ id: "i", effect: "Incremento en filtración", causes: {} }] as NonNullable<
        Rda["ishikawa"]
      >,
    });
    expect(getRdaDisplayName(legacy)).toBe("Incremento en filtración");
  });

  it("si ni el título ni la cabeza tienen nombre, muestra el texto por defecto", () => {
    const empty = base({
      ishikawa: [{ id: "i", effect: "Nuevo RDA", causes: {} }] as NonNullable<Rda["ishikawa"]>,
    });
    expect(getRdaDisplayName(empty)).toBe("Nuevo RDA");
  });
});
