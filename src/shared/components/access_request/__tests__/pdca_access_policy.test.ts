/**
 * @fileoverview Unit tests verifying PDCA read, edit, delete, and target builder access guards.
 */

import { describe, expect, it } from "vitest";
import type { Pdca } from "@/domain/pdca";
import type { UserProfile } from "@/features/auth/auth_context";
import type { UserPermissions } from "@/features/auth/user_service";
import {
  build_pdca_access_target,
  can_user_access_pdca,
  can_user_delete_pdca,
  can_user_edit_pdca,
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

const full_admin_permissions: UserPermissions = {
  ...standard_user_permissions,
  canViewAll: true,
  canViewArea: true,
  canDelete: true,
  canManageAssignment: true,
  canManageUsers: true,
};

const create_profile = (
  uid: string,
  name: string,
  email: string,
  role: UserProfile["role"],
  area: string,
): UserProfile => ({ uid, name, email, role, area });

const sample_pdca: Pdca = {
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

describe("Access control & request targets for PDCA", () => {
  it("can_user_access_pdca permite creador, asignados y admins, y bloquea no autorizados", () => {
    const admin_user = create_profile("u1", "Admin", "admin@corona.com", "admin", "General");
    const viewer_all = create_profile("u2", "Supervisor", "sup@corona.com", "user", "Calidad");
    const author_user = create_profile("u3", "Juan Perez", "juan@corona.com", "user", "Envasado");
    const assignee = create_profile("u4", "Maria Lopez", "maria@corona.com", "user", "Envasado");
    const outsider = create_profile("u5", "Visitante", "visitante@corona.com", "user", "Logística");

    expect(can_user_access_pdca(sample_pdca, admin_user, standard_user_permissions)).toBe(true);
    expect(can_user_access_pdca(sample_pdca, viewer_all, full_admin_permissions)).toBe(true);
    expect(can_user_access_pdca(sample_pdca, author_user, standard_user_permissions)).toBe(true);
    expect(can_user_access_pdca(sample_pdca, assignee, standard_user_permissions)).toBe(true);
    expect(can_user_access_pdca(sample_pdca, outsider, standard_user_permissions)).toBe(false);
    expect(can_user_access_pdca(sample_pdca, null, standard_user_permissions)).toBe(false);
  });

  it("build_pdca_access_target extrae creador y responsables correctamente", () => {
    const pdca_target = build_pdca_access_target(sample_pdca);
    expect(pdca_target.module).toBe("PDCA");
    expect(pdca_target.creatorName).toBe("Juan Perez");
    expect(pdca_target.responsibles).toEqual([
      { name: "Maria Lopez", email: "maria@corona.com" },
      { name: "Pedro Gomez", email: "pedro@corona.com" },
    ]);
  });

  it("permite a BLOQUE FRIO con canViewArea acceder a Fermentación y Filtración", () => {
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

    expect(
      can_user_access_pdca(
        { ...sample_pdca, area: "fermentacion" },
        bloque_frio_user,
        area_view_permissions,
      ),
    ).toBe(true);
    expect(
      can_user_access_pdca(
        { ...sample_pdca, area: "Filtración" },
        bloque_frio_user,
        area_view_permissions,
      ),
    ).toBe(true);
  });

  it("can_user_edit_pdca y can_user_delete_pdca bloquean viewer, intern y ajenos", () => {
    const viewer_profile = create_profile("v1", "Juan Perez", "juan@gmodelo.com.mx", "viewer", "Envasado");
    const intern_profile = create_profile("i1", "Maria Lopez", "maria@gmodelo.com.mx", "intern", "Envasado");
    const owner_profile = create_profile("o1", "Juan Perez", "juan@corona.com", "user", "Envasado");
    const assigned_profile = create_profile("a1", "Maria Lopez", "maria@corona.com", "user", "Calidad");
    const unassigned_profile = create_profile("x1", "No Asignado", "otro@gmodelo.com.mx", "user", "Envasado");
    const same_area_lead = create_profile("al1", "Lider Envasado", "lider@gmodelo.com.mx", "area_lead", "Envasado");
    const other_area_lead = create_profile("al2", "Lider Calidad", "lider2@gmodelo.com.mx", "area_lead", "Calidad");
    const admin_profile = create_profile("ad1", "Admin", "admin@gmodelo.com.mx", "admin", "General");

    expect(can_user_edit_pdca(sample_pdca, viewer_profile)).toBe(false);
    expect(can_user_edit_pdca(sample_pdca, intern_profile)).toBe(false);
    expect(can_user_delete_pdca(sample_pdca, viewer_profile)).toBe(false);
    expect(can_user_delete_pdca(sample_pdca, intern_profile)).toBe(false);
    expect(can_user_edit_pdca(sample_pdca, unassigned_profile)).toBe(false);

    expect(can_user_edit_pdca(sample_pdca, owner_profile)).toBe(true);
    expect(can_user_edit_pdca(sample_pdca, assigned_profile)).toBe(true);
    expect(can_user_delete_pdca(sample_pdca, owner_profile)).toBe(true);
    expect(can_user_delete_pdca(sample_pdca, assigned_profile)).toBe(false);
    expect(can_user_delete_pdca(sample_pdca, admin_profile)).toBe(true);

    expect(can_user_edit_pdca(sample_pdca, same_area_lead)).toBe(true);
    expect(can_user_edit_pdca(sample_pdca, other_area_lead)).toBe(false);
    expect(can_user_delete_pdca(sample_pdca, same_area_lead)).toBe(false);
  });
});
