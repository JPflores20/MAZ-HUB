import { describe, expect, it } from "vitest";
import {
  buildPdcaAccessTarget,
  buildRdaAccessTarget,
  canUserAccessPdca,
  canUserAccessRda,
} from "../access-request-dialog";
import type { Pdca } from "@/data/pdca";
import { defaultRda, type Rda } from "@/data/rda";
import type { UserPermissions } from "@/services/user-service";

const userPerms: UserPermissions = {
  canViewAll: false,
  canViewArea: false,
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canManageAssignment: false,
  canManageUsers: false,
};

const adminPerms: UserPermissions = {
  canViewAll: true,
  canViewArea: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canManageAssignment: true,
  canManageUsers: true,
};

const samplePdca: Pdca = {
  id: "PDCA-2026-01",
  titulo: "Reducción de merma",
  problema: "Alta merma en línea 2",
  indicador: { etiqueta: "Merma", antes: 3, despues: 1, unidad: "%" },
  fase: "Plan",
  progreso: 25,
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  equipo: [],
  serie: [],
  autor: "Juan Perez",
  autorEmail: "juan@corona.com",
  area: "Envasado",
  actualizado: "12 Ene 2026",
  asignados: [
    { name: "Maria Lopez", email: "maria@corona.com" },
    { name: "Pedro Gomez", email: "pedro@corona.com" },
  ],
};

describe("Access control & request targets for PDCA and RDA", () => {
  it("canUserAccessPdca permite al creador, asignados y administradores, y bloquea a otros usuarios", () => {
    expect(
      canUserAccessPdca(
        samplePdca,
        { uid: "u1", name: "Admin", email: "admin@corona.com", role: "admin", area: "General" },
        userPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessPdca(
        samplePdca,
        { uid: "u2", name: "Supervisor", email: "sup@corona.com", role: "user", area: "Calidad" },
        adminPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessPdca(
        samplePdca,
        { uid: "u3", name: "Juan Perez", email: "juan@corona.com", role: "user", area: "Envasado" },
        userPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessPdca(
        samplePdca,
        {
          uid: "u4",
          name: "Maria Lopez",
          email: "maria@corona.com",
          role: "user",
          area: "Envasado",
        },
        userPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessPdca(
        samplePdca,
        {
          uid: "u5",
          name: "Visitante Externo",
          email: "visitante@corona.com",
          role: "user",
          area: "Logística",
        },
        userPerms,
      ),
    ).toBe(false);
  });

  it("canUserAccessRda permite al autor, responsables y administradores, y bloquea a usuarios sin asignación", () => {
    const rda: Rda = {
      ...defaultRda,
      id: "1001",
      portada: {
        ...defaultRda.portada!,
        autorOriginal: "Carlos Ruiz",
        autorEmail: "carlos@corona.com",
        usuariosAsignados: ["Ana Torres"],
        area: "Cocimientos",
      },
      context: {
        ...defaultRda.context,
        folio: "RDA_2026_01",
        iniciadoPor: "Carlos Ruiz",
        responsable: "Ana Torres, Luis Vega",
        area: "Cocimientos",
      },
    };

    expect(
      canUserAccessRda(
        rda,
        {
          uid: "r1",
          name: "Carlos Ruiz",
          email: "carlos@corona.com",
          role: "user",
          area: "Cocimientos",
        },
        userPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessRda(
        rda,
        {
          uid: "r2",
          name: "Luis Vega",
          email: "luis@corona.com",
          role: "user",
          area: "Mantenimiento",
        },
        userPerms,
      ),
    ).toBe(true);

    expect(
      canUserAccessRda(
        rda,
        {
          uid: "r3",
          name: "Otro Usuario",
          email: "otro@corona.com",
          role: "user",
          area: "Calidad",
        },
        userPerms,
      ),
    ).toBe(false);
  });

  it("buildPdcaAccessTarget y buildRdaAccessTarget extraen correctamente creador y responsables", () => {
    const pdcaTarget = buildPdcaAccessTarget(samplePdca);
    expect(pdcaTarget.module).toBe("PDCA");
    expect(pdcaTarget.creatorName).toBe("Juan Perez");
    expect(pdcaTarget.responsibles).toEqual([
      { name: "Maria Lopez", email: "maria@corona.com" },
      { name: "Pedro Gomez", email: "pedro@corona.com" },
    ]);

    const rda: Rda = {
      ...defaultRda,
      id: "2002",
      portada: {
        ...defaultRda.portada!,
        autorOriginal: "Elena Diaz",
        autorEmail: "elena@corona.com",
        usuariosAsignados: ["Roberto Solis"],
      },
      context: {
        ...defaultRda.context,
        folio: "RDA_2026_02",
        responsable: "Roberto Solis",
      },
    };

    const rdaTarget = buildRdaAccessTarget(rda);
    expect(rdaTarget.module).toBe("RDA");
    expect(rdaTarget.folioOrCode).toBe("RDA_2026_02");
    expect(rdaTarget.creatorName).toBe("Elena Diaz");
    expect(rdaTarget.responsibles).toEqual([{ name: "Roberto Solis" }]);
  });
});
