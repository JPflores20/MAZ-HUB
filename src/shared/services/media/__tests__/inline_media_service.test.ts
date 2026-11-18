/**
 * inline_media_service.test.ts
 * Pruebas unitarias para la extracción y subida de imágenes Base64 a Firebase Storage.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const upload_mock = vi.fn(async (target_file: File) => `https://storage.example/${target_file.name}`);
vi.mock("@/features/pdca/image_upload/upload_utils", () => ({
  subir_archivo_a_firebase: (target_file: File) => upload_mock(target_file),
}));

import {
  FIRESTORE_SAFE_DOC_BYTES,
  estimate_document_bytes,
  externalize_inline_media,
  replace_strings_in_object,
} from "../inline_media_service";

const sample_big_png = "data:image/png;base64," + "A".repeat(5000);
const sample_big_pdf = "data:application/pdf;base64," + "B".repeat(5000);

describe("inline_media_service", () => {
  beforeEach(() => {
    upload_mock.mockClear();
  });

  it("sube las data URLs pesadas y las reemplaza por URLs de Storage", async () => {
    const sample_rda = {
      id: "1",
      title: "sample",
      evidenciasValidacion: [{ id: "a", images: [sample_big_png] }],
      nested: { deep: [{ file: sample_big_pdf }] },
      smallIcon: "data:image/png;base64,AAAA",
    };

    const { value: transformed_rda } = await externalize_inline_media(sample_rda, "rda_images");

    expect(upload_mock).toHaveBeenCalledTimes(2);
    expect(transformed_rda.evidenciasValidacion[0]!.images[0]).toBe(
      "https://storage.example/evidencia.png",
    );
    expect(transformed_rda.nested.deep[0]!.file).toBe("https://storage.example/evidencia.pdf");
    // Las data URLs diminutas se dejan intactas.
    expect(transformed_rda.smallIcon).toBe(sample_rda.smallIcon);
    // Verifica inmutabilidad del documento original.
    expect(sample_rda.evidenciasValidacion[0]!.images[0]).toBe(sample_big_png);
  });

  it("no vuelve a subir la misma data URL en guardados sucesivos", async () => {
    const payload_doc = { images: [sample_big_png + "CCCC"] };
    await externalize_inline_media(payload_doc, "rda_images");
    await externalize_inline_media(payload_doc, "rda_images");
    expect(upload_mock).toHaveBeenCalledTimes(1);
  });

  it("replace_strings_in_object reemplaza cadenas en profundidad", () => {
    const replaced_object = replace_strings_in_object(
      { first_field: ["x", { inner_field: "x" }] },
      new Map([["x", "y"]]),
    );
    expect(replaced_object).toEqual({ first_field: ["y", { inner_field: "y" }] });
  });

  it("estimate_document_bytes detecta documentos que exceden el límite", () => {
    expect(estimate_document_bytes({ img: "A".repeat(1_100_000) })).toBeGreaterThan(
      FIRESTORE_SAFE_DOC_BYTES,
    );
  });
});
