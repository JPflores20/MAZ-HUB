/**
 * Definiciones de roles RBAC, permisos efectivos y proyección mínima del directorio público.
 * Impone el principio de mínimo privilegio garantizando que ningún rol restringido obtenga permisos elevados.
 */
import { clamp_string, normalize_email } from "./domain_and_strings";

/** Roles oficiales reconocidos por el sistema y sus reglas de seguridad. */
export const VALID_ROLES = ["admin", "area_lead", "user", "intern", "viewer"] as const;

export type UserRole = (typeof VALID_ROLES)[number];

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageAssignment: boolean;
  canViewArea: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
}

/** Matriz base de permisos predeterminados por rol operativo. */
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

/** Conjunto de roles autorizados a modificar o crear contenido de negocio. */
export const WRITE_CONTENT_ROLES = new Set<UserRole>(["admin", "area_lead", "user"]);

/**
 * Normaliza un rol arbitrario degradando valores inválidos al nivel básico `user`.
 * @param rol_crudo - Valor de rol recibido desde Firestore o payload del cliente.
 * @returns Rol tipado garantizado dentro de `VALID_ROLES`.
 */
export function normalize_role(rol_crudo: unknown): UserRole {
  const rol_texto = String(rol_crudo);
  return (VALID_ROLES as readonly string[]).includes(rol_texto)
    ? (rol_texto as UserRole)
    : "user";
}

/**
 * Sanitiza permisos personalizados respetando límites estrictos por rol.
 * Bloquea incondicionalmente privilegios de escritura/administración para `viewer` e `intern`.
 * @param rol_usuario - Rol asignado al usuario.
 * @param permisos_crudos - Mapa parcial de permisos recibido desde el cliente o documento existente.
 * @returns Objeto completo `UserPermissions` validado según política Zero Trust.
 */
export function normalize_permissions(
  rol_usuario: UserRole,
  permisos_crudos?: Partial<Record<keyof UserPermissions, unknown>>,
): UserPermissions {
  const valores_por_defecto = ROLE_DEFAULT_PERMISSIONS[rol_usuario];
  const elegir_bandera = (clave_permiso: keyof UserPermissions, respaldo: boolean): boolean =>
    permisos_crudos && typeof permisos_crudos[clave_permiso] === "boolean"
      ? (permisos_crudos[clave_permiso] as boolean)
      : respaldo;

  const permisos_normalizados: UserPermissions = {
    canCreate: elegir_bandera("canCreate", valores_por_defecto.canCreate),
    canEdit: elegir_bandera("canEdit", valores_por_defecto.canEdit),
    canDelete: elegir_bandera("canDelete", valores_por_defecto.canDelete),
    canManageAssignment: elegir_bandera(
      "canManageAssignment",
      valores_por_defecto.canManageAssignment,
    ),
    canViewArea: elegir_bandera("canViewArea", valores_por_defecto.canViewArea),
    canViewAll: elegir_bandera("canViewAll", valores_por_defecto.canViewAll),
    // Solo el rol admin puede administrar usuarios independientemente de flags enviados
    canManageUsers: rol_usuario === "admin",
  };

  if (rol_usuario === "viewer" || rol_usuario === "intern") {
    permisos_normalizados.canCreate = false;
    permisos_normalizados.canEdit = false;
    permisos_normalizados.canDelete = false;
    permisos_normalizados.canManageAssignment = false;
    permisos_normalizados.canManageUsers = false;
  }

  return permisos_normalizados;
}

/**
 * Proyecta únicamente los atributos públicos seguros hacia `user_directory`, omitiendo secretos o permisos.
 * @param identificador_usuario - UID del usuario en Firebase Auth.
 * @param documento_usuario - Mapa de datos completo almacenado en `users/{uid}`.
 * @returns Objeto público acotado listo para persistirse en `user_directory`.
 */
export function build_directory_projection(
  identificador_usuario: string,
  documento_usuario: Record<string, unknown>,
) {
  return {
    uid: identificador_usuario,
    name: clamp_string(documento_usuario["name"], 120) || "Usuario",
    email: normalize_email(documento_usuario["email"]),
    area: clamp_string(documento_usuario["area"], 80) || "Usuario",
    position: clamp_string(documento_usuario["position"], 80),
    plant: clamp_string(documento_usuario["plant"], 80),
    role: normalize_role(documento_usuario["role"]),
    avatarUrl: clamp_string(documento_usuario["avatarUrl"], 150_000),
    approved: documento_usuario["approved"] === true,
  };
}
