/**
 * @fileoverview Unit and component tests verifying direct admin user approval without email dispatch and Zero Trust domain filtering.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { UserProfile } from "@/features/auth/auth_context";
import {
  get_pending_corporate_users,
  is_user_pending_admin_approval,
} from "../admin_user_filter_helpers";
import { UserList } from "../user_list";

const mock_approve_user = vi.fn();
const mock_send_link = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("@/shared/context/pdca_context", () => ({
  usePdcas: () => ({ allPdcas: [] }),
}));

vi.mock("@/shared/context/rda_context", () => ({
  useRdas: () => ({ allRdas: [] }),
}));

vi.mock("@/features/auth/auth_context", async () => {
  const actual = await vi.importActual<typeof import("@/features/auth/auth_context")>(
    "@/features/auth/auth_context",
  );
  return {
    ...actual,
    useAuth: () => ({
      sendAdminVerificationLink: mock_send_link,
      approveUserVerification: mock_approve_user,
    }),
  };
});

const SAMPLE_USERS: UserProfile[] = [
  {
    uid: "uid-betsaida",
    name: "BETSAIDA GUERRERO SILVA",
    email: "betsaida.guerrero@gmodelo.com.mx",
    role: "user",
    area: "ENVASE",
    approved: false,
    emailVerified: false,
  },
  {
    uid: "uid-adrian",
    name: "ADRIAN DIAZ MARRUFO",
    email: "adrian.dias@ab-inbev.com",
    role: "user",
    area: "COCIMIENTOS",
    approved: false,
    emailVerified: true,
  },
  {
    uid: "uid-uaz",
    name: "CHRISTIAN GUADALUPE BUENDIA ZAPATA",
    email: "20202377@uaz.edu.mx",
    role: "intern",
    area: "SEGURIDAD",
    approved: false,
    emailVerified: false,
  },
  {
    uid: "uid-gmail",
    name: "DANIEL ALEJANDRO GONZALEZ RODRIGUEZ",
    email: "danielcrak24@gmail.com",
    role: "user",
    area: "CALIDAD",
    approved: false,
    emailVerified: false,
  },
];

describe("Admin user approval flow (sin envío de correo + Zero Trust)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock_approve_user.mockResolvedValue(undefined);
    mock_send_link.mockResolvedValue("activation_reset_email");
  });

  it("filtra únicamente cuentas corporativas pendientes y excluye dominios externos", () => {
    expect(is_user_pending_admin_approval(SAMPLE_USERS[0]!)).toBe(true);
    expect(is_user_pending_admin_approval(SAMPLE_USERS[1]!)).toBe(true);
    expect(is_user_pending_admin_approval(SAMPLE_USERS[2]!)).toBe(false);
    expect(is_user_pending_admin_approval(SAMPLE_USERS[3]!)).toBe(false);

    const eligible = get_pending_corporate_users(SAMPLE_USERS);
    expect(eligible.map((u) => u.uid)).toEqual(["uid-betsaida", "uid-adrian"]);
  });

  it("aprueba y marca correo verificado individualmente sin enviar enlace por correo", async () => {
    render(<UserList users_list={SAMPLE_USERS} />);

    expect(screen.getAllByText(/Dominio externo bloqueado/i)).toHaveLength(2);
    expect(screen.queryByLabelText(/Aprobar y verificar a CHRISTIAN/i)).toBeNull();
    expect(screen.queryByLabelText(/Aprobar y verificar a DANIEL/i)).toBeNull();

    const approve_betsaida_btn = screen.getByLabelText(
      /Aprobar y verificar a BETSAIDA GUERRERO SILVA sin correo/i,
    );
    fireEvent.click(approve_betsaida_btn);

    await waitFor(() => {
      expect(mock_approve_user).toHaveBeenCalledTimes(1);
      expect(mock_approve_user).toHaveBeenCalledWith("uid-betsaida");
    });
    expect(mock_send_link).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getAllByText(/^Correo verificado$/)).toHaveLength(2);
      expect(screen.getAllByText(/^Aprobado$/)).toHaveLength(1);
    });
  });

  it("aprueba masivamente solo cuentas corporativas pendientes desde el botón de cabecera", async () => {
    render(<UserList users_list={SAMPLE_USERS} />);

    fireEvent.click(screen.getByRole("button", { name: /Aprobar corporativos \(2\)/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Aprobar sin correo/i }));

    await waitFor(() => {
      expect(mock_approve_user).toHaveBeenCalledTimes(2);
      expect(mock_approve_user).toHaveBeenCalledWith("uid-betsaida");
      expect(mock_approve_user).toHaveBeenCalledWith("uid-adrian");
    });
    expect(mock_send_link).not.toHaveBeenCalled();
  });

  it("filtra únicamente cuentas pendientes desde la pestaña Pendientes y excluye dominios externos", () => {
    render(<UserList users_list={SAMPLE_USERS} />);

    fireEvent.click(screen.getByRole("button", { name: /Pendientes\s*2/i }));

    expect(screen.getByText(/Usuarios Registrados \(2 de 4\)/i)).toBeTruthy();
    expect(screen.getByText("BETSAIDA GUERRERO SILVA")).toBeTruthy();
    expect(screen.getByText("ADRIAN DIAZ MARRUFO")).toBeTruthy();
    expect(screen.queryByText("DANIEL ALEJANDRO GONZALEZ RODRIGUEZ")).toBeNull();
  });
});
