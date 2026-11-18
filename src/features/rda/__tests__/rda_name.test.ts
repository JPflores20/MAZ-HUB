/**
 * @fileoverview Unit tests validating RDA title-Ishikawa synchronization and sequential folio generation.
 */

import { describe, expect, it } from "vitest";
import type { Rda } from "@/domain/models/rda";
import {
  generate_next_rda_folio,
  get_rda_display_name,
  get_rda_name,
  normalize_rda_name,
  with_rda_name,
} from "../utils/rda_name";

const build_base_rda = (overrides: Partial<Rda>): Rda =>
  ({
    id: "1",
    title: "Nuevo RDA",
    ishikawa: [{ id: "i", effect: "", causes: {} }],
    ...overrides,
  }) as Rda;

describe("rda_name", () => {
  it("la cabeza del Ishikawa muestra el nombre del RDA", () => {
    expect(get_rda_name(build_base_rda({ title: "Polifenoles > 62 ppm" }))).toBe(
      "Polifenoles > 62 ppm",
    );
  });

  it("no muestra el título por defecto en la cabeza", () => {
    expect(get_rda_name(build_base_rda({ title: "Nuevo RDA" }))).toBe("");
  });

  it("editar la cabeza renombra el RDA y sincroniza el efecto", () => {
    const updated_rda = with_rda_name(build_base_rda({}), "Incremento en tiempos de filtración");
    expect(updated_rda.title).toBe("Incremento en tiempos de filtración");
    expect(updated_rda.ishikawa?.[0]?.effect).toBe("Incremento en tiempos de filtración");
  });

  it("RDAs viejos atorados en 'Nuevo RDA' adoptan la cabeza como nombre", () => {
    const legacy_rda = build_base_rda({
      ishikawa: [{ id: "i", effect: "Incremento en filtración", causes: {} }] as NonNullable<
        Rda["ishikawa"]
      >,
    });
    expect(normalize_rda_name(legacy_rda).title).toBe("Incremento en filtración");
  });

  it("no toca RDAs que ya tienen nombre", () => {
    const named_rda = build_base_rda({
      title: "Polifenoles",
      ishikawa: [{ id: "i", effect: "Otro", causes: {} }] as NonNullable<Rda["ishikawa"]>,
    });
    expect(normalize_rda_name(named_rda)).toBe(named_rda);
  });

  it("la lista muestra la cabeza del Ishikawa aunque el RDA no se haya reabierto", () => {
    const legacy_rda = build_base_rda({
      ishikawa: [{ id: "i", effect: "Incremento en filtración", causes: {} }] as NonNullable<
        Rda["ishikawa"]
      >,
    });
    expect(get_rda_display_name(legacy_rda)).toBe("Incremento en filtración");
  });

  it("si ni el título ni la cabeza tienen nombre, muestra el texto por defecto", () => {
    const empty_rda = build_base_rda({
      ishikawa: [{ id: "i", effect: "Nuevo RDA", causes: {} }] as NonNullable<Rda["ishikawa"]>,
    });
    expect(get_rda_display_name(empty_rda)).toBe("Nuevo RDA");
  });

  it("genera RDA_YYYY_01 cuando no hay RDAs previos en el año", () => {
    expect(generate_next_rda_folio([], 2026)).toBe("RDA_2026_01");
  });

  it("calcula el siguiente consecutivo a partir del máximo existente en el año", () => {
    const existing_rdas = [
      build_base_rda({ context: { folio: "RDA_2026_01" } as Rda["context"] }),
      build_base_rda({ context: { folio: "RDA_2026_18" } as Rda["context"] }),
      build_base_rda({ context: { folio: "RDA_2026_02" } as Rda["context"] }),
      build_base_rda({ context: { folio: "RDA_2026_19" } as Rda["context"] }),
      build_base_rda({ context: { folio: "RDA_2025_45" } as Rda["context"] }),
    ];
    expect(generate_next_rda_folio(existing_rdas, 2026)).toBe("RDA_2026_20");
  });
});
