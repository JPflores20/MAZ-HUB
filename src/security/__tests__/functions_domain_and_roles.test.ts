/**
 * Pruebas unitarias Zero Trust para validación de dominios corporativos, roles y proyecciones de directorio en Cloud Functions.
 */
import { describe, expect, it } from "vitest";
import {
  clamp_string,
  is_corporate_email,
  normalize_area,
  normalize_email,
} from "../../../functions/src/security/domain_and_strings";
import {
  build_directory_projection,
  normalize_permissions,
  normalize_role,
} from "../../../functions/src/security/roles_and_permissions";

describe("Functions Security — Validación de dominios corporativos y normalización", () => {
  it("acepta únicamente correos válidos de ab-inbev.com y gmodelo.com.mx", () => {
    expect(is_corporate_email("  Usuario.Prueba@AB-InBev.COM ")).toBe(true);
    expect(is_corporate_email("operador@gmodelo.com.mx")).toBe(true);

    expect(is_corporate_email("atacante@gmail.com")).toBe(false);
    expect(is_corporate_email("fake@ab-inbev.com.evil.org")).toBe(false);
    expect(is_corporate_email("sin-arroba")).toBe(false);
    expect(is_corporate_email("")).toBe(false);
    expect(is_corporate_email(null)).toBe(false);
  });

  it("normaliza correos, áreas sin diacríticos y recorta cadenas sobredimensionadas", () => {
    expect(normalize_email("  User@GModelo.COM.MX ")).toBe("user@gmodelo.com.mx");
    expect(normalize_area("  Elaboración y Cocción  ")).toBe("elaboracion y coccion");
    expect(clamp_string("  abcdef  ", 4)).toBe("abcd");
    expect(clamp_string(12345, 10)).toBe("");
  });
});

describe("Functions Security — Mínimo privilegio en roles, permisos y proyección pública", () => {
  it("degrada roles desconocidos o inválidos al rol base user", () => {
    expect(normalize_role("admin")).toBe("admin");
    expect(normalize_role("area_lead")).toBe("area_lead");
    expect(normalize_role("viewer")).toBe("viewer");
    expect(normalize_role("superadmin")).toBe("user");
    expect(normalize_role(undefined)).toBe("user");
  });

  it("bloquea capacidades administrativas o de escritura cuando el rol es viewer, intern o area_lead", () => {
    const permisos_viewer = normalize_permissions("viewer", {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManageAssignment: true,
      canManageUsers: true,
    });
    expect(permisos_viewer.canCreate).toBe(false);
    expect(permisos_viewer.canEdit).toBe(false);
    expect(permisos_viewer.canDelete).toBe(false);
    expect(permisos_viewer.canManageAssignment).toBe(false);
    expect(permisos_viewer.canManageUsers).toBe(false);

    const permisos_intern = normalize_permissions("intern", {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManageUsers: true,
    });
    expect(permisos_intern.canCreate).toBe(false);
    expect(permisos_intern.canEdit).toBe(false);
    expect(permisos_intern.canManageUsers).toBe(false);

    const permisos_lead = normalize_permissions("area_lead", {
      canManageUsers: true,
    });
    expect(permisos_lead.canManageUsers).toBe(false);
    expect(permisos_lead.canManageAssignment).toBe(true);
  });

  it("construye proyecciones seguras para user_directory omitiendo secretos y permisos", () => {
    const proyeccion = build_directory_projection("uid-123", {
      name: "  Carlos Pérez ",
      email: "CARLOS@GMODELO.COM.MX",
      area: "Envase",
      position: "Coordinador",
      plant: "Mazatlán",
      role: "area_lead",
      approved: true,
      password: "secreto-no-exponer",
      permissions: { canManageUsers: true },
    });

    expect(proyeccion).toEqual({
      uid: "uid-123",
      name: "Carlos Pérez",
      email: "carlos@gmodelo.com.mx",
      area: "Envase",
      position: "Coordinador",
      plant: "Mazatlán",
      role: "area_lead",
      avatarUrl: "",
      approved: true,
    });
    expect("password" in proyeccion).toBe(false);
    expect("permissions" in proyeccion).toBe(false);
  });
});
