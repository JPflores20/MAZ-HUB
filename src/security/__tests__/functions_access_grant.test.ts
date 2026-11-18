/**
 * Pruebas unitarias Zero Trust para la autorización en servidor de solicitudes de acceso sobre PDCA y RDA.
 */
import { describe, expect, it } from "vitest";
import { can_authorize_access_grant } from "../../../functions/src/security/access_grant_policy";

const DOCUMENTO_PDCA_COCIMIENTOS = {
  area: "Cocimientos",
  ownerUid: "owner-1",
  autorEmail: "owner@gmodelo.com.mx",
  assignedUids: ["assigned-uid"],
  assignedEmails: ["assigned@ab-inbev.com"],
  asignados: [{ email: "legacy.member@gmodelo.com.mx" }],
};

const DOCUMENTO_RDA_ENVASE = {
  ownerUid: "owner-rda",
  assignedUids: ["rda-assigned-uid"],
  assignedEmails: ["rda.assigned@ab-inbev.com"],
  context: { area: "Envase" },
  portada: { area: "Envase", autorEmail: "autor.rda@gmodelo.com.mx" },
};

describe("Functions Security — Política can_authorize_access_grant", () => {
  it("rechaza aprobadores no aprobados y roles de solo lectura en PDCA y RDA", () => {
    expect(
      can_authorize_access_grant({
        callerUid: "owner-1",
        callerEmail: "owner@gmodelo.com.mx",
        callerRole: "admin",
        callerArea: "Cocimientos",
        callerApproved: false,
        module: "PDCA",
        targetData: DOCUMENTO_PDCA_COCIMIENTOS,
      }),
    ).toBe(false);

    for (const rol_lectura of ["viewer", "intern"] as const) {
      expect(
        can_authorize_access_grant({
          callerUid: "owner-1",
          callerEmail: "owner@gmodelo.com.mx",
          callerRole: rol_lectura,
          callerArea: "Cocimientos",
          callerApproved: true,
          module: "PDCA",
          targetData: DOCUMENTO_PDCA_COCIMIENTOS,
        }),
      ).toBe(false);
    }
  });

  it("impide aprobación de líderes de otra área y permite líderes de la misma área", () => {
    expect(
      can_authorize_access_grant({
        callerUid: "lead-env",
        callerEmail: "lead.env@gmodelo.com.mx",
        callerRole: "area_lead",
        callerArea: "Envase",
        callerApproved: true,
        module: "PDCA",
        targetData: DOCUMENTO_PDCA_COCIMIENTOS,
      }),
    ).toBe(false);

    expect(
      can_authorize_access_grant({
        callerUid: "lead-coc",
        callerEmail: "lead.coc@gmodelo.com.mx",
        callerRole: "area_lead",
        callerArea: "cocimientos",
        callerApproved: true,
        module: "PDCA",
        targetData: DOCUMENTO_PDCA_COCIMIENTOS,
      }),
    ).toBe(true);
  });

  it("autoriza a propietarios, colaboradores asignados, autores originales y administradores en PDCA", () => {
    const casos_autorizados = [
      { callerUid: "owner-1", callerEmail: "otro@ab-inbev.com", callerRole: "user" as const },
      { callerUid: "otro", callerEmail: "owner@gmodelo.com.mx", callerRole: "user" as const },
      { callerUid: "assigned-uid", callerEmail: "otro@ab-inbev.com", callerRole: "user" as const },
      { callerUid: "otro", callerEmail: "ASSIGNED@AB-INBEV.COM", callerRole: "user" as const },
      { callerUid: "otro", callerEmail: "legacy.member@gmodelo.com.mx", callerRole: "user" as const },
      { callerUid: "admin-1", callerEmail: "admin@ab-inbev.com", callerRole: "admin" as const },
    ];

    for (const caso_usuario of casos_autorizados) {
      expect(
        can_authorize_access_grant({
          ...caso_usuario,
          callerArea: "Otra",
          callerApproved: true,
          module: "PDCA",
          targetData: DOCUMENTO_PDCA_COCIMIENTOS,
        }),
      ).toBe(true);
    }
  });

  it("aplica aislamiento de área y asignación equivalente para solicitudes sobre RDA", () => {
    expect(
      can_authorize_access_grant({
        callerUid: "lead-coc",
        callerEmail: "lead.coc@gmodelo.com.mx",
        callerRole: "area_lead",
        callerArea: "Cocimientos",
        callerApproved: true,
        module: "RDA",
        targetData: DOCUMENTO_RDA_ENVASE,
      }),
    ).toBe(false);

    expect(
      can_authorize_access_grant({
        callerUid: "lead-env",
        callerEmail: "lead.env@gmodelo.com.mx",
        callerRole: "area_lead",
        callerArea: "Envase",
        callerApproved: true,
        module: "RDA",
        targetData: DOCUMENTO_RDA_ENVASE,
      }),
    ).toBe(true);

    expect(
      can_authorize_access_grant({
        callerUid: "rda-assigned-uid",
        callerEmail: "alguien@gmodelo.com.mx",
        callerRole: "user",
        callerArea: "Cocimientos",
        callerApproved: true,
        module: "RDA",
        targetData: DOCUMENTO_RDA_ENVASE,
      }),
    ).toBe(true);
  });
});
