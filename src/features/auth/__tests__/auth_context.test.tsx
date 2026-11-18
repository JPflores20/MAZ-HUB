/**
 * @fileoverview Unit tests verifying strict usage boundaries on `useAuth()`.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuth } from "../auth_context";

describe("AuthContext / useAuth", () => {
  it("lanza error descriptivo cuando se invoca fuera de AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");
  });
});
