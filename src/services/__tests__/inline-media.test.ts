/**
 * inline-media.test.ts
 * Pruebas unitarias para la extracción y subida de imágenes base64 a Firebase Storage.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const uploadMock = vi.fn(async (file: File) => `https://storage.example/${file.name}`);
vi.mock("@/components/pdca/image-upload/utils/upload-utils", () => ({
  subirArchivoAFirebase: (file: File) => uploadMock(file),
}));

import {
  externalizeInlineMedia,
  estimateDocBytes,
  replaceStrings,
  FIRESTORE_SAFE_DOC_BYTES,
} from "../inline-media";

const bigPng = "data:image/png;base64," + "A".repeat(5000);
const bigPdf = "data:application/pdf;base64," + "B".repeat(5000);

describe("inline-media", () => {
  beforeEach(() => {
    uploadMock.mockClear();
  });

  it("sube las data URLs pesadas y las reemplaza por URLs de Storage", async () => {
    const rda = {
      id: "1",
      title: "x",
      evidenciasValidacion: [{ id: "a", images: [bigPng] }],
      nested: { deep: [{ file: bigPdf }] },
      smallIcon: "data:image/png;base64,AAAA",
    };

    const { value } = await externalizeInlineMedia(rda, "rda_images");

    expect(uploadMock).toHaveBeenCalledTimes(2);
    expect(value.evidenciasValidacion[0]!.images[0]).toBe("https://storage.example/evidencia.png");
    expect(value.nested.deep[0]!.file).toBe("https://storage.example/evidencia.pdf");
    // Las data URLs diminutas se dejan tal cual.
    expect(value.smallIcon).toBe(rda.smallIcon);
    // No muta el original.
    expect(rda.evidenciasValidacion[0]!.images[0]).toBe(bigPng);
  });

  it("no vuelve a subir la misma data URL en guardados sucesivos", async () => {
    const doc = { images: [bigPng + "CCCC"] };
    await externalizeInlineMedia(doc, "rda_images");
    await externalizeInlineMedia(doc, "rda_images");
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it("replaceStrings reemplaza en profundidad", () => {
    const out = replaceStrings({ a: ["x", { b: "x" }] }, new Map([["x", "y"]]));
    expect(out).toEqual({ a: ["y", { b: "y" }] });
  });

  it("estimateDocBytes detecta documentos que exceden el límite", () => {
    expect(estimateDocBytes({ img: "A".repeat(1_100_000) })).toBeGreaterThan(
      FIRESTORE_SAFE_DOC_BYTES,
    );
  });
});
