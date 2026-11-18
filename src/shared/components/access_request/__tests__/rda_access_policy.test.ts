/**
 * @fileoverview Unit tests verifying RDA read, edit, delete, and target builder access guards.
 */

import { describe, expect, it } from "vitest";
import { DEFAULT_RDA, type Rda } from "@/domain/models/rda";
import type { UserProfile } from "@/features/auth/auth_context";
import type { UserPermissions } from "@/features/auth/user_service";
import {
  build_rda_access_target,
  can_user_access_rda,
  can_user_delete_rda,
  can_user_edit_rda,
} from "../index";

const standard_user_permissions: UserPermissions = {
  canViewAll: false,
  canViewArea: false,
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canManageAssignment: false,
  canManageUsers: false,
};

const create_profile = (
  uid: string,
  name: string,
  email: string,
  role: UserProfile["role"],
  area: string,
): UserProfile => ({ uid, name, email, role, area });

describe("Access control & request targets for RDA", () => {
  it("can_user_access_rda permite autor y responsables, y bloquea usuarios sin asignación", () => {
    const sample_rda: Rda = {
      ...DEFAULT_RDA,
      id: "1001",
      portada: {
        ...DEFAULT_RDA.portada!,
        autorOriginal: "Carlos Ruiz",
        autorEmail: "carlos@corona.com",
        usuariosAsignados: ["Ana Torres"],
        area: "Cocimientos",
      },
      context: {
        ...DEFAULT_RDA.context,
        folio: "RDA_2026_01",
        iniciadoPor: "Carlos Ruiz",
        responsable: "Ana Torres, Luis Vega",
        area: "Cocimientos",
      },
    };

    const author = create_profile("r1", "Carlos Ruiz", "carlos@corona.com", "user", "Cocimientos");
    const assignee = create_profile("r2", "Luis Vega", "luis@corona.com", "user", "Mantenimiento");
    const outsider = create_profile("r3", "Otro Usuario", "otro@corona.com", "user", "Calidad");

    expect(can_user_access_rda(sample_rda, author, standard_user_permissions)).toBe(true);
    expect(can_user_access_rda(sample_rda, assignee, standard_user_permissions)).toBe(true);
    expect(can_user_access_rda(sample_rda, outsider, standard_user_permissions)).toBe(false);
    expect(can_user_access_rda(sample_rda, null, standard_user_permissions)).toBe(false);
  });

  it("build_rda_access_target extrae folio, creador y responsables", () => {
    const target_source_rda: Rda = {
      ...DEFAULT_RDA,
      id: "2002",
      portada: {
        ...DEFAULT_RDA.portada!,
        autorOriginal: "Elena Diaz",
        autorEmail: "elena@corona.com",
        usuariosAsignados: ["Roberto Solis"],
      },
      context: {
        ...DEFAULT_RDA.context,
        folio: "RDA_2026_02",
        responsable: "Roberto Solis",
      },
    };

    const rda_target = build_rda_access_target(target_source_rda);
    expect(rda_target.module).toBe("RDA");
    expect(rda_target.folioOrCode).toBe("RDA_2026_02");
    expect(rda_target.creatorName).toBe("Elena Diaz");
    expect(rda_target.responsibles).toEqual([{ name: "Roberto Solis" }]);
  });

  it("permite a BLOQUE FRIO con canViewArea acceder a RDAs de Fermentación", () => {
    const area_view_permissions: UserPermissions = {
      ...standard_user_permissions,
      canViewArea: true,
    };
    const bloque_frio_user = create_profile(
      "bf-1",
      "Supervisor Bloque Frío",
      "bf@corona.com",
      "user",
      "BLOQUE FRIO",
    );
    const rda_fermentacion: Rda = {
      ...DEFAULT_RDA,
      id: "2001",
      portada: { ...DEFAULT_RDA.portada!, area: "Fermentación" },
      context: { ...DEFAULT_RDA.context, area: "Fermentación" },
    };

    expect(can_user_access_rda(rda_fermentacion, bloque_frio_user, area_view_permissions)).toBe(
      true,
    );
  });

  it("can_user_edit_rda y can_user_delete_rda bloquean viewer, intern y ajenos", () => {
    const rda_record: Rda = {
      ...DEFAULT_RDA,
      id: "3003",
      portada: {
        ...DEFAULT_RDA.portada!,
        autorOriginal: "Juan Perez",
        autorEmail: "juan@gmodelo.com.mx",
        area: "Envasado",
        usuariosAsignados: ["Maria Lopez"],
      },
      context: {
        ...DEFAULT_RDA.context,
        area: "Envasado",
        iniciadoPor: "Juan Perez",
        responsable: "Maria Lopez",
      },
    };

    const viewer_profile = create_profile("v1", "Juan Perez", "juan@gmodelo.com.mx", "viewer", "Envasado");
    const intern_profile = create_profile("i1", "Maria Lopez", "maria@gmodelo.com.mx", "intern", "Envasado");
    const assigned_profile = create_profile("a1", "Maria Lopez", "maria@corona.com", "user", "Calidad");
    const unassigned_profile = create_profile("x1", "No Asignado", "otro@gmodelo.com.mx", "user", "Envasado");
    const same_area_lead = create_profile("al1", "Lider Envasado", "lider@gmodelo.com.mx", "area_lead", "Envasado");
    const other_area_lead = create_profile("al2", "Lider Calidad", "lider2@gmodelo.com.mx", "area_lead", "Calidad");
    const admin_profile = create_profile("ad1", "Admin", "admin@gmodelo.com.mx", "admin", "General");

    expect(can_user_edit_rda(rda_record, viewer_profile)).toBe(false);
    expect(can_user_edit_rda(rda_record, intern_profile)).toBe(false);
    expect(can_user_edit_rda(rda_record, unassigned_profile)).toBe(false);
    expect(can_user_edit_rda(rda_record, same_area_lead)).toBe(true);
    expect(can_user_edit_rda(rda_record, other_area_lead)).toBe(false);
    expect(can_user_delete_rda(rda_record, assigned_profile)).toBe(false);
    expect(can_user_delete_rda(rda_record, admin_profile)).toBe(true);
  });
});
