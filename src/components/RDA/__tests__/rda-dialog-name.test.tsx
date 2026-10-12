import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@/lib/i18n";
import { RdaDialog } from "../RdaDialog";
import { defaultRda, type Rda } from "@/data/rda";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("RdaDialog — cabeza del Ishikawa = nombre del RDA", () => {
  it("escribir en la cabeza renombra el RDA y el autoguardado lo persiste", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const newRda: Rda = { ...defaultRda, id: "t1", createdAt: "", updatedAt: "" };
    const onSave = vi.fn(async (r: Rda) => r);

    render(<RdaDialog open rda={newRda} onOpenChange={() => {}} onSave={onSave} />);

    fireEvent.click(screen.getByText(/Análisis de Causas Raíz/i));
    const titleInput = await screen.findByDisplayValue(/Diagrama de Ishikawa/i);
    fireEvent.click(titleInput.closest("[class*='cursor-pointer']") ?? titleInput);
    const head = await screen.findByPlaceholderText("Escribe el efecto...");
    expect((head as HTMLTextAreaElement).value).toBe("");

    fireEvent.change(head, { target: { value: "Incremento en tiempos de filtración" } });

    // El encabezado del RDA ya muestra el nuevo nombre.
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Incremento en tiempos de filtración",
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const saved = onSave.mock.calls.at(-1)![0];
    expect(saved.title).toBe("Incremento en tiempos de filtración");
    expect(saved.ishikawa?.[0]?.effect).toBe("Incremento en tiempos de filtración");
    vi.useRealTimers();
  });
});
