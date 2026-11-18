/**
 * @fileoverview Role metadata tables, default permission matrices, and RBAC resolution helpers.
 */

import type { UserPermissions, UserRole } from "./auth_types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  area_lead: "Líder de Área",
  user: "Usuario General",
  intern: "Becario / Practicante",
  viewer: "Auditor / Visor",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Control total de la plataforma, gestión de usuarios y acceso global a todos los proyectos.",
  area_lead:
    "Visualiza los proyectos PDCA/RDA y edita o asigna responsables en su área o proyectos asignados.",
  user: "Crea nuevos PDCA/RDA y edita aquellos que creó o en los que está asignado.",
  intern:
    "Solo lectura: puede consultar tableros y reportes PDCA/RDA sin crear ni modificar información.",
  viewer:
    "Modo solo lectura: puede consultar y exportar reportes sin modificar ni eliminar información.",
};

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageAssignment: true,
    canViewArea: true,
    canViewAll: true,
    canManageUsers: true,
  },
  area_lead: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageAssignment: true,
    canViewArea: true,
    canViewAll: true,
    canManageUsers: false,
  },
  user: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageAssignment: false,
    canViewArea: false,
    canViewAll: true,
    canManageUsers: false,
  },
  intern: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageAssignment: false,
    canViewArea: true,
    canViewAll: true,
    canManageUsers: false,
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageAssignment: false,
    canViewArea: true,
    canViewAll: true,
    canManageUsers: false,
  },
};

export const PERMISSION_METADATA: {
  key: keyof Omit<UserPermissions, "canManageUsers">;
  label: string;
  description: string;
}[] = [
  {
    key: "canCreate",
    label: "Crear PDCA / RDA",
    description: "Iniciar nuevos proyectos PDCA y reportes de anomalía RDA.",
  },
  {
    key: "canEdit",
    label: "Editar avances y contenido",
    description: "Modificar pasos, análisis, causas raíz y acciones en proyectos visibles.",
  },
  {
    key: "canDelete",
    label: "Eliminar proyectos / reportes",
    description: "Borrar permanentemente registros PDCA o RDA.",
  },
  {
    key: "canManageAssignment",
    label: "Gestionar responsables y fechas límite",
    description: "Asignar o quitar co-responsables, cambiar autor y definir fechas compromiso.",
  },
  {
    key: "canViewArea",
    label: "Ver todo su departamento / área",
    description: "Consultar todos los PDCA y RDA de su misma área aunque no esté asignado.",
  },
  {
    key: "canViewAll",
    label: "Ver toda la planta (Global)",
    description: "Consultar todos los proyectos de todas las áreas de la cervecería.",
  },
];

/**
 * Validates and normalizes an untrusted role string to a known `UserRole`, defaulting to `"user"`.
 *
 * @param {string | null | undefined} raw_role - Stored or input role identifier.
 * @returns {UserRole} Validated role union value.
 */
export function normalize_user_role(raw_role?: string | null): UserRole {
  if (
    raw_role === "admin" ||
    raw_role === "area_lead" ||
    raw_role === "user" ||
    raw_role === "intern" ||
    raw_role === "viewer"
  ) {
    return raw_role;
  }
  return "user";
}

/**
 * Resolves effective permissions for a user, hard-blocking writes for `viewer` and `intern` roles.
 *
 * @param user_record - Partial user record containing role and optional overrides.
 * @returns {UserPermissions} Computed effective permission bitmap.
 */
export function get_effective_permissions(
  user_record?: {
    role?: UserRole | string | undefined;
    permissions?: Partial<UserPermissions> | undefined;
  } | null,
): UserPermissions {
  if (!user_record) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageAssignment: false,
      canViewArea: false,
      canViewAll: false,
      canManageUsers: false,
    };
  }
  const normalized_role = normalize_user_role(user_record.role);
  const role_defaults = ROLE_DEFAULT_PERMISSIONS[normalized_role];
  const merged_permissions: UserPermissions = {
    ...role_defaults,
    ...(user_record.permissions || {}),
    canManageUsers: normalized_role === "admin",
  };

  if (normalized_role === "viewer" || normalized_role === "intern") {
    merged_permissions.canCreate = false;
    merged_permissions.canEdit = false;
    merged_permissions.canDelete = false;
    merged_permissions.canManageAssignment = false;
    merged_permissions.canManageUsers = false;
  }

  return merged_permissions;
}

/**
 * Checks whether any permission flag differs from the user's base role defaults.
 *
 * @param user_record - User role and stored permission overrides.
 * @returns {boolean} True when custom permission overrides are present.
 */
export function has_custom_permissions(
  user_record?: {
    role?: UserRole | string | undefined;
    permissions?: Partial<UserPermissions> | undefined;
  } | null,
): boolean {
  if (!user_record || !user_record.permissions) {
    return false;
  }
  const normalized_role = normalize_user_role(user_record.role);
  const role_defaults = ROLE_DEFAULT_PERMISSIONS[normalized_role];
  return (Object.keys(role_defaults) as (keyof UserPermissions)[]).some(
    (permission_key) =>
      user_record.permissions?.[permission_key] !== undefined &&
      user_record.permissions[permission_key] !== role_defaults[permission_key],
  );
}
