/**
 * use_pdca_draft.test.ts
 * Pruebas unitarias para `use_pdca_draft.ts` y `get_empty_draft`.
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_VPO_CHECKPOINTS } from "@/domain/pdca";
import { get_empty_draft, usePdcaDraft } from "../use_pdca_draft";

describe("get_empty_draft", () => {
  it("crea un PDCA con la fase 'Plan' y arrays/objetos base iniciados", () => {
    const sample_user = { name: "Test User", email: "test@gmodelo.com" };
    const generated_draft = get_empty_draft(sample_user);

    expect(generated_draft.fase).toBe("Plan");
    expect(generated_draft.autor).toBe("Test User");
    expect(generated_draft.autor_email).toBe("test@gmodelo.com");
    expect(generated_draft.acciones).toEqual([]);
    expect(generated_draft.vpo_checkpoints?.length).toBe(DEFAULT_VPO_CHECKPOINTS.length);
  });

  it("asigna un autor genérico si no se provee usuario", () => {
    const generated_draft = get_empty_draft();
    expect(generated_draft.autor).toBe("Sin autor");
    expect(generated_draft.autor_email).toBe("");
  });
});

describe("usePdcaDraft", () => {
  it("inicializa con draft vacío si initial_pdca es null", () => {
    const { result: hook_result } = renderHook(() => usePdcaDraft(null));
    expect(hook_result.current.draft.id).toMatch(/^PDCA-\d{4}-\d{3}$/);
    expect(hook_result.current.draft.titulo).toBe("");
  });

  it("inicializa con initial_pdca si se provee", () => {
    const initial_pdca = { id: "PDCA-123", titulo: "Test Title" } as Parameters<
      typeof usePdcaDraft
    >[0];
    const { result: hook_result } = renderHook(() => usePdcaDraft(initial_pdca));

    expect(hook_result.current.draft.id).toBe("PDCA-123");
    expect(hook_result.current.draft.titulo).toBe("Test Title");
  });

  it("actualiza el draft correctamente usando update_draft", () => {
    const { result: hook_result } = renderHook(() => usePdcaDraft(null));

    act(() => {
      hook_result.current.update_draft({ titulo: "Nuevo Título", area: "Envasado" });
    });

    expect(hook_result.current.draft.titulo).toBe("Nuevo Título");
    expect(hook_result.current.draft.area).toBe("Envasado");
    expect(hook_result.current.draft.fase).toBe("Plan");
  });

  it("reacciona a cambios de initial_pdca (sincronización externa)", () => {
    const first_initial = { id: "P1", titulo: "T1" } as NonNullable<
      Parameters<typeof usePdcaDraft>[0]
    >;
    const second_initial = { id: "P2", titulo: "T2" } as NonNullable<
      Parameters<typeof usePdcaDraft>[0]
    >;

    const { result: hook_result, rerender } = renderHook(
      ({ pdca_prop }) => usePdcaDraft(pdca_prop),
      { initialProps: { pdca_prop: first_initial } },
    );

    expect(hook_result.current.draft.titulo).toBe("T1");
    rerender({ pdca_prop: second_initial });
    expect(hook_result.current.draft.titulo).toBe("T2");
  });
});
