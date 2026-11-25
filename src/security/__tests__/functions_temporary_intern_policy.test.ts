/**
 * @fileoverview Unit tests verifying server-side temporary intern policy, day bounds, and expiration guards.
 */
import { describe, expect, it } from "vitest";
import {
  compute_intern_expiration,
  is_profile_expired,
  is_temporary_intern_profile,
  is_valid_email_format,
  parse_active_days,
} from "../../../functions/src/security/domain_and_strings";

describe("Functions Security — Becarios temporales (Gmail + vigencia en días)", () => {
  it("valida rango permitido de días activos (1..730) y calcula expiración determinista", () => {
    expect(parse_active_days(1)).toBe(1);
    expect(parse_active_days("30")).toBe(30);
    expect(parse_active_days(730)).toBe(730);

    expect(parse_active_days(0)).toBeNull();
    expect(parse_active_days(-5)).toBeNull();
    expect(parse_active_days(731)).toBeNull();
    expect(parse_active_days(12.5)).toBeNull();
    expect(parse_active_days("abc")).toBeNull();

    const base_now = 1_800_000_000_000;
    const exp = compute_intern_expiration(10, base_now);
    expect(exp.activeDays).toBe(10);
    expect(exp.expiresAtMs).toBe(base_now + 10 * 86_400_000);
    expect(exp.expiresAt).toBe(new Date(exp.expiresAtMs).toISOString());
  });

  it("identifica perfiles temporales autorizados y falla cerrado ante expiración o falta de timestamp", () => {
    expect(is_valid_email_format("becario@gmail.com")).toBe(true);
    expect(is_valid_email_format("sin-arroba")).toBe(false);

    const valid_intern = {
      role: "intern",
      temporaryAccount: true,
      verifiedByAdmin: true,
      expiresAtMs: 2_000_000_000_000,
    };
    expect(is_temporary_intern_profile(valid_intern)).toBe(true);
    expect(is_profile_expired(valid_intern, 1_999_999_999_999)).toBe(false);
    expect(is_profile_expired(valid_intern, 2_000_000_000_000)).toBe(true);

    expect(
      is_temporary_intern_profile({
        role: "user",
        temporaryAccount: true,
        verifiedByAdmin: true,
      }),
    ).toBe(false);
    expect(
      is_temporary_intern_profile({
        role: "intern",
        temporaryAccount: true,
        verifiedByAdmin: false,
      }),
    ).toBe(false);
    expect(
      is_profile_expired({
        role: "intern",
        temporaryAccount: true,
      }),
    ).toBe(true);
  });
});
