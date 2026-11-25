/**
 * @fileoverview Component tests verifying collaborator self-registration personal/plant fields and Zero Trust validations.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CORPORATE_EMAIL_ERROR } from "../email_validation";
import { RegisterForm } from "../register_form";

const mock_create_user_with_email_and_password = vi.fn();
const mock_send_email_verification = vi.fn();
const mock_sign_out = vi.fn();
const mock_update_profile = vi.fn();
const mock_create_user_firestore = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    createUserWithEmailAndPassword: (...args: unknown[]) =>
      mock_create_user_with_email_and_password(...args),
    sendEmailVerification: (...args: unknown[]) => mock_send_email_verification(...args),
    signOut: (...args: unknown[]) => mock_sign_out(...args),
    updateProfile: (...args: unknown[]) => mock_update_profile(...args),
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
      create_user: (...args: unknown[]) => mock_create_user_firestore(...args),
    },
  };
});

describe("RegisterForm", () => {
  beforeAll(() => {
    if (typeof HTMLElement !== "undefined") {
      HTMLElement.prototype.scrollIntoView ??= vi.fn();
      HTMLElement.prototype.hasPointerCapture ??= vi.fn().mockReturnValue(false);
      HTMLElement.prototype.releasePointerCapture ??= vi.fn();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mock_update_profile.mockResolvedValue(undefined);
    mock_sign_out.mockResolvedValue(undefined);
    mock_create_user_firestore.mockResolvedValue(undefined);
    mock_send_email_verification.mockResolvedValue(undefined);
  });

  async function select_dropdown_option(trigger_pattern: RegExp, option_label: string) {
    fireEvent.click(screen.getByLabelText(trigger_pattern));
    const option = await screen.findByRole("option", { name: option_label });
    fireEvent.click(option);
  }

  async function fill_register_form(
    email_value: string,
    options: { include_maternal?: boolean; include_area?: boolean } = {},
  ) {
    const { include_maternal = true, include_area = true } = options;
    fireEvent.change(screen.getByLabelText(/NOMBRE\(S\)/i), { target: { value: "Ana Maria" } });
    fireEvent.change(screen.getByLabelText(/APELLIDO PATERNO/i), { target: { value: "Lopez" } });
    if (include_maternal) {
      fireEvent.change(screen.getByLabelText(/APELLIDO MATERNO/i), {
        target: { value: "Hernandez" },
      });
    }
    fireEvent.change(screen.getByLabelText(/CORREO CORPORATIVO/i), {
      target: { value: email_value },
    });
    await select_dropdown_option(/PUESTO \/ CARGO/i, "TECNICO");
    if (include_area) {
      await select_dropdown_option(/ÁREA \/ DEPARTAMENTO/i, "BLOQUE FRIO");
    }
    fireEvent.change(screen.getByLabelText(/PLANTA \/ SEDE/i), {
      target: { value: "Cervecería Zacatecas" },
    });
    fireEvent.change(screen.getByLabelText(/TELÉFONO O EXTENSIÓN/i), {
      target: { value: "4781057626" },
    });
    fireEvent.change(screen.getByLabelText(/^CONTRASEÑA \*/i), {
      target: { value: "Modelo2026!" },
    });
    fireEvent.change(screen.getByLabelText(/CONFIRMAR \*/i), { target: { value: "Modelo2026!" } });
  }

  it("exige seleccionar Área / Departamento y bloquea correos fuera de @ab-inbev.com o @gmodelo.com.mx", async () => {
    const on_success = vi.fn();
    render(<RegisterForm on_switch_to_login={vi.fn()} on_success={on_success} />);

    await fill_register_form("ana.lopez@gmodelo.com.mx", { include_area: false });
    fireEvent.click(screen.getByRole("button", { name: /Crear Mi Cuenta/i }));
    expect(
      await screen.findByText(/Por favor, completa todos los campos obligatorios/i),
    ).toBeTruthy();
    expect(mock_create_user_with_email_and_password).not.toHaveBeenCalled();

    await select_dropdown_option(/ÁREA \/ DEPARTAMENTO/i, "BLOQUE FRIO");
    fireEvent.change(screen.getByLabelText(/CORREO CORPORATIVO/i), {
      target: { value: "ana.lopez@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear Mi Cuenta/i }));

    expect(await screen.findByText(CORPORATE_EMAIL_ERROR)).toBeTruthy();
    expect(mock_create_user_with_email_and_password).not.toHaveBeenCalled();
    expect(on_success).not.toHaveBeenCalled();
  });

  it("registra todos los datos personales y de planta con @ab-inbev.com, envía verificación y cierra sesión", async () => {
    const fake_firebase_user = { uid: "uid-abinbev-1" };
    mock_create_user_with_email_and_password.mockResolvedValueOnce({ user: fake_firebase_user });
    const on_success = vi.fn();

    render(<RegisterForm on_switch_to_login={vi.fn()} on_success={on_success} />);

    await fill_register_form("Carlos.Ruiz@AB-INBEV.COM", { include_maternal: false });
    fireEvent.click(screen.getByRole("button", { name: /Crear Mi Cuenta/i }));

    await waitFor(() => {
      expect(mock_create_user_with_email_and_password).toHaveBeenCalledWith(
        expect.anything(),
        "carlos.ruiz@ab-inbev.com",
        "Modelo2026!",
      );
    });

    expect(mock_send_email_verification).toHaveBeenCalledWith(fake_firebase_user, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
    expect(mock_create_user_firestore).toHaveBeenCalledWith(
      "uid-abinbev-1",
      expect.objectContaining({
        name: "ANA MARIA LOPEZ",
        firstName: "ANA MARIA",
        paternalLastName: "LOPEZ",
        email: "carlos.ruiz@ab-inbev.com",
        area: "BLOQUE FRIO",
        position: "TECNICO",
        plant: "Cervecería Zacatecas",
        phone: "4781057626",
        emailVerified: false,
      }),
    );
    expect(mock_create_user_firestore.mock.calls[0]?.[1]).not.toHaveProperty("password");
    expect(mock_sign_out).toHaveBeenCalledTimes(1);
    expect(on_success).toHaveBeenCalledWith("carlos.ruiz@ab-inbev.com", undefined, {
      verificationSent: true,
    });
  });

  it("permite continuar a la pantalla de reenvío si falla el envío inicial del correo de verificación", async () => {
    const fake_firebase_user = { uid: "uid-gmodelo-2" };
    mock_create_user_with_email_and_password.mockResolvedValueOnce({ user: fake_firebase_user });
    mock_send_email_verification.mockRejectedValue({ code: "auth/too-many-requests" });
    const on_success = vi.fn();

    render(<RegisterForm on_switch_to_login={vi.fn()} on_success={on_success} />);

    await fill_register_form("ana.lopez@gmodelo.com.mx");
    fireEvent.click(screen.getByRole("button", { name: /Crear Mi Cuenta/i }));

    await waitFor(() => {
      expect(on_success).toHaveBeenCalledWith(
        "ana.lopez@gmodelo.com.mx",
        undefined,
        expect.objectContaining({
          verificationSent: false,
        }),
      );
    });
    expect(mock_sign_out).toHaveBeenCalledTimes(1);
  });
});
