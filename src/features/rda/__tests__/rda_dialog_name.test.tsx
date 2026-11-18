/**
 * @fileoverview Interactive component tests verifying dynamic title sync and Resumen inline edits in RdaDialog.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@/core/i18n";
import { DEFAULT_RDA, type Rda } from "@/domain/models/rda";
import { RdaDialog } from "../dialog/rda_dialog";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

describe("RdaDialog — cabeza del Ishikawa = nombre del RDA", () => {
  it("escribir en la cabeza renombra el RDA y el autoguardado lo persiste", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const new_rda: Rda = { ...DEFAULT_RDA, id: "t1", createdAt: "", updatedAt: "" };
    const on_save = vi.fn(async (rda_payload: Rda) => rda_payload);

    render(<RdaDialog open rda={new_rda} onOpenChange={() => {}} onSave={on_save} />);

    fireEvent.click(screen.getByText(/Análisis de Causas Raíz/i));
    const title_input = await screen.findByDisplayValue(/Diagrama de Ishikawa/i);
    fireEvent.click(title_input.closest("[class*='cursor-pointer']") ?? title_input);
    const head_textarea = await screen.findByPlaceholderText("Escribe el efecto...");
    expect((head_textarea as HTMLTextAreaElement).value).toBe("");

    fireEvent.change(head_textarea, {
      target: { value: "Incremento en tiempos de filtración" },
    });

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Incremento en tiempos de filtración",
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await waitFor(() => expect(on_save).toHaveBeenCalled());
    const saved_rda = on_save.mock.calls.at(-1)![0];
    expect(saved_rda.title).toBe("Incremento en tiempos de filtración");
    expect(saved_rda.ishikawa?.[0]?.effect).toBe("Incremento en tiempos de filtración");
    vi.useRealTimers();
  });

  it("permite ingresar datos directamente desde la pestaña inicial '1. Resumen' y confirma causas en Ishikawa al perder foco", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const new_rda: Rda = { ...DEFAULT_RDA, id: "t2", createdAt: "", updatedAt: "" };
    const on_save = vi.fn(async (rda_payload: Rda) => rda_payload);

    render(<RdaDialog open rda={new_rda} onOpenChange={() => {}} onSave={on_save} />);

    const header_input = screen.getByLabelText("Título del RDA");
    fireEvent.change(header_input, { target: { value: "Paro en etiquetadora L5" } });

    const turno_input = screen.getByPlaceholderText("Turno / Equipo");
    fireEvent.change(turno_input, { target: { value: "Turno 2" } });

    const immediate_textarea = screen.getByPlaceholderText(
      /Describe las acciones correctivas inmediatas/i,
    );
    fireEvent.change(immediate_textarea, { target: { value: "Ajuste de rodillo de goma" } });

    const cause_inputs = screen.getAllByPlaceholderText("+ Causa (Enter)");
    fireEvent.change(cause_inputs[0]!, { target: { value: "Desgaste de balero" } });
    fireEvent.blur(cause_inputs[0]!);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await waitFor(() => expect(on_save).toHaveBeenCalled());
    const saved_rda = on_save.mock.calls.at(-1)![0];
    expect(saved_rda.title).toBe("Paro en etiquetadora L5");
    expect(saved_rda.context.turno).toBe("Turno 2");
    expect(saved_rda.immediateActions?.[0]?.accion).toBe("Ajuste de rodillo de goma");
    expect(saved_rda.ishikawa?.[0]?.causes?.machine).toContain("Desgaste de balero");
    vi.useRealTimers();
  });
});
