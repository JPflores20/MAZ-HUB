/**
 * auth-context.test.tsx
 * Pruebas unitarias para el contexto de autenticación (AuthContext).
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../auth-context";

describe("AuthContext / useAuth", () => {
  it("lanza error descriptivo cuando se invoca fuera de AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");
  });
});
