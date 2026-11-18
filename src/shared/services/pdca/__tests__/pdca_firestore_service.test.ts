// @ts-nocheck
/**
 * pdca_firestore_service.test.ts
 * Pruebas unitarias para `pdca_firestore_queries.ts` y `pdca_firestore_mutations.ts`.
 * Intercepta completamente `firebase/firestore` y `@/core/config/firebase` con Vitest.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetch_pdcas_from_firestore } from "../pdca_firestore_queries";
import {
  delete_pdca_from_firestore,
  save_pdca_to_firestore,
  update_pdca_deadline,
} from "../pdca_firestore_mutations";
import type { Pdca } from "@/domain/models/pdca";

vi.mock("@/core/config/firebase", () => ({
  db: {},
  primary_auth: { currentUser: null },
}));

const {
  mock_set_doc,
  mock_update_doc,
  mock_delete_doc,
  mock_get_docs,
  mock_on_snapshot,
  mock_doc,
  mock_collection,
  mock_query,
  mock_limit,
} = vi.hoisted(() => ({
  mock_set_doc: vi.fn().mockResolvedValue(undefined),
  mock_update_doc: vi.fn().mockResolvedValue(undefined),
  mock_delete_doc: vi.fn().mockResolvedValue(undefined),
  mock_get_docs: vi.fn(),
  mock_on_snapshot: vi.fn(),
  mock_doc: vi.fn(() => ({ id: "mock-ref" })),
  mock_collection: vi.fn(() => ({ id: "mock-collection-ref" })),
  mock_query: vi.fn((collection_ref) => collection_ref),
  mock_limit: vi.fn((limit_value) => limit_value),
}));

vi.mock("firebase/firestore", () => ({
  collection: mock_collection,
  getDocs: mock_get_docs,
  doc: mock_doc,
  setDoc: mock_set_doc,
  deleteDoc: mock_delete_doc,
  onSnapshot: mock_on_snapshot,
  updateDoc: mock_update_doc,
  query: mock_query,
  limit: mock_limit,
}));

function create_mock_pdca(partial_pdca: Partial<Pdca> = {}): Pdca {
  return {
    id: "PDCA-TEST-001",
    titulo: "PDCA de prueba",
    area: "Testing",
    fase: "Plan",
    actualizado: "01 Sep 2026",
    progreso: 0,
    problema: "Problema de prueba",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Test KPI", antes: 0, despues: 0, unidad: "%" },
    serie: [],
    ...partial_pdca,
  };
}

function create_seeded_snapshot(pdca_list: Pdca[]) {
  return {
    docs: [
      {
        id: "_config",
        data: () => ({ isSeeded: true }),
      },
      ...pdca_list.map((pdca_item) => ({
        id: pdca_item.id,
        data: () => pdca_item,
      })),
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetch_pdcas_from_firestore", () => {
  it("retorna los PDCAs cuando la colección ya está sembrada", async () => {
    const test_pdca = create_mock_pdca();
    mock_get_docs.mockResolvedValueOnce(create_seeded_snapshot([test_pdca]));

    const query_result = await fetch_pdcas_from_firestore();

    expect(query_result).toHaveLength(1);
    expect(query_result[0].id).toBe("PDCA-TEST-001");
  });

  it("retorna arreglo vacío si Firestore lanza un error", async () => {
    mock_get_docs.mockRejectedValueOnce(new Error("Firestore error simulado"));

    const query_result = await fetch_pdcas_from_firestore();

    expect(query_result).toEqual([]);
  });
});

describe("save_pdca_to_firestore", () => {
  it("llama a setDoc si no hay snapshot previo en caché", async () => {
    const test_pdca = create_mock_pdca({ id: "PDCA-SIN-CACHE" });

    await save_pdca_to_firestore(test_pdca);

    expect(mock_set_doc).toHaveBeenCalledTimes(1);
    expect(mock_update_doc).not.toHaveBeenCalled();
  });

  it("no llama a Firestore si no hubo cambios (diff vacío)", async () => {
    const { set_pdca_snapshot } = await import("../pdca_cache_service");
    const test_pdca = create_mock_pdca({ id: "PDCA-CON-CACHE" });
    set_pdca_snapshot(test_pdca.id, test_pdca);

    await save_pdca_to_firestore(test_pdca);

    expect(mock_set_doc).not.toHaveBeenCalled();
    expect(mock_update_doc).not.toHaveBeenCalled();
  });
});

describe("delete_pdca_from_firestore", () => {
  it("llama a deleteDoc con el id correcto", async () => {
    await delete_pdca_from_firestore("PDCA-BORRAR-001");

    expect(mock_delete_doc).toHaveBeenCalledTimes(1);
  });

  it("no lanza error si deleteDoc falla", async () => {
    mock_delete_doc.mockRejectedValueOnce(new Error("Error de red"));

    await expect(delete_pdca_from_firestore("PDCA-FALLA")).resolves.not.toThrow();
  });
});

describe("update_pdca_deadline", () => {
  it("llama a updateDoc con fechaFinalizacion cuando se provee fecha", async () => {
    await update_pdca_deadline("PDCA-001", "2026-12-31");

    expect(mock_update_doc).toHaveBeenCalledWith(expect.anything(), {
      fechaFinalizacion: "2026-12-31",
    });
  });

  it("usa string vacío cuando la fecha es null", async () => {
    await update_pdca_deadline("PDCA-001", null);

    expect(mock_update_doc).toHaveBeenCalledWith(expect.anything(), { fechaFinalizacion: "" });
  });
});
