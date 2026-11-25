/**
 * @fileoverview Component tests verifying isolated admin user provisioning via `adminCreateUser`.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegistrationForm } from "../admin_registration_form";
import { CORPORATE_EMAIL_ERROR } from "../email_validation";

const mock_create_user_with_email_and_password = vi.fn();
const mock_send_password_reset_email = vi.fn();
const mock_admin_create_user = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    createUserWithEmailAndPassword: (...args: unknown[]) =>
      mock_create_user_with_email_and_password(...args),
    sendPasswordResetEmail: (...args: unknown[]) => mock_send_password_reset_email(...args),
  };
});

vi.mock("@/core/config/firebase", () => ({
  primary_auth: { languageCode: "es" },
  db: {},
  storage: {},
  functions: {},
  isFirebaseConfigured: true,
}));

vi.mock("../user_service", async () => {
  const actual = await vi.importActual<typeof import("../user_service")>("../user_service");
  return {
    ...actual,
    user_service: {
      ...actual.user_service,
      admin_create_user: (...args: unknown[]) => mock_admin_create_user(...args),
    },
  };
});

describe("RegistrationForm (Panel Admin)", () => {
  beforeAll(() => {
    if (typeof HTMLElement !== "undefined") {
      HTMLElement.prototype.scrollIntoView ??= vi.fn();
      HTMLElement.prototype.hasPointerCapture ??= vi.fn().mockReturnValue(false);
      HTMLElement.prototype.releasePointerCapture ??= vi.fn();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mock_send_password_reset_email.mockResolvedValue(undefined);
    mock_admin_create_user.mockResolvedValue({
      uid: "uid-admin-created",
      email: "roberto.torres@gmodelo.com.mx",
      role: "user",
      approved: true,
    });
  });

  it("valida dominio corporativo y usa admin_create_user aislado sin secondaryAuth ni contraseña en Firestore", async () => {
    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/NOMBRE COMPLETO/i), {
      target: { value: "Roberto Torres" },
    });
    fireEvent.change(screen.getByLabelText(/CORREO ELECTRÓNICO/i), {
      target: { value: "roberto@hotmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/CONTRASEÑA TEMPORAL/i), {
      target: { value: "Modelo2026!" },
    });
    fireEvent.change(screen.getByLabelText(/ÁREA \/ DEPARTAMENTO/i), {
      target: { value: "COCIMIENTOS" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Crear Cuenta/i }));
    expect(await screen.findByText(CORPORATE_EMAIL_ERROR)).toBeTruthy();
    expect(mock_admin_create_user).not.toHaveBeenCalled();
    expect(mock_create_user_with_email_and_password).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/CORREO ELECTRÓNICO/i), {
      target: { value: "roberto.torres@gmodelo.com.mx" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear Cuenta/i }));

    await waitFor(() => {
      expect(mock_admin_create_user).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "roberto.torres@gmodelo.com.mx",
          name: "ROBERTO TORRES",
          area: "COCIMIENTOS",
          role: "user",
          password: "Modelo2026!",
        }),
      );
    });
    expect(mock_create_user_with_email_and_password).not.toHaveBeenCalled();
    expect(mock_send_password_reset_email).toHaveBeenCalledWith(
      expect.anything(),
      "roberto.torres@gmodelo.com.mx",
    );
    expect(
      await screen.findByText(
        /Se envió un correo para verificar su cuenta y establecer contraseña/i,
      ),
    ).toBeTruthy();
  });

  it("permite crear becarios temporales con Gmail asignando días activos y requiriendo verificación", async () => {
    mock_admin_create_user.mockResolvedValueOnce({
      uid: "uid-becario-1",
      email: "becario.nuevo@gmail.com",
      role: "intern",
      approved: true,
      temporaryAccount: true,
      activeDays: 45,
    });

    render(<RegistrationForm />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: /Becario \/ Practicante/i }));

    fireEvent.change(screen.getByLabelText(/NOMBRE COMPLETO/i), {
      target: { value: "Sofia Mendoza" },
    });
    fireEvent.change(screen.getByLabelText(/CORREO ELECTRÓNICO/i), {
      target: { value: "Sofia.Mendoza@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/ÁREA \/ DEPARTAMENTO/i), {
      target: { value: "ENVASE" },
    });
    fireEvent.change(screen.getByLabelText(/VIGENCIA TEMPORAL \(DÍAS ACTIVOS\)/i), {
      target: { value: "45" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Crear Cuenta/i }));

    await waitFor(() => {
      expect(mock_admin_create_user).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "sofia.mendoza@gmail.com",
          name: "SOFIA MENDOZA",
          area: "ENVASE",
          role: "intern",
          activeDays: 45,
        }),
      );
    });
    expect(mock_send_password_reset_email).toHaveBeenCalledWith(
      expect.anything(),
      "sofia.mendoza@gmail.com",
    );
    expect(await screen.findByText(/vigencia: 45 días/i)).toBeTruthy();
  });
});
