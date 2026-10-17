/**
 * user-service.ts
 * Servicio de administración de usuarios, roles y permisos granulares en Firestore,
 * y creación de cuentas con instancia secundaria de Firebase Auth.
 */
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export type UserRole = "admin" | "area_lead" | "user" | "intern" | "viewer";

export interface UserPermissions {
  /** Crear nuevos proyectos PDCA o reportes RDA */
  canCreate: boolean;
  /** Editar contenido y guardar avances en PDCA / RDA visibles */
  canEdit: boolean;
  /** Eliminar proyectos PDCA o reportes RDA */
  canDelete: boolean;
  /** Cambiar responsables asignados, autor y fechas límite */
  canManageAssignment: boolean;
  /** Ver todos los proyectos PDCA / RDA de su misma área aunque no esté asignado */
  canViewArea: boolean;
  /** Ver todos los proyectos PDCA / RDA de toda la planta (vista global) */
  canViewAll: boolean;
  /** Acceder al panel de administración de usuarios y permisos */
  canManageUsers: boolean;
}

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
    "Visualiza y coordina todos los PDCA/RDA de su departamento; puede crear, editar, asignar y eliminar.",
  user: "Crea nuevos PDCA/RDA y edita aquellos en los que participa o está asignado.",
  intern:
    "Puede crear y editar PDCA/RDA asignados, pero no puede eliminar proyectos ni modificar responsables o fechas límite.",
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
    canDelete: true,
    canManageAssignment: true,
    canViewArea: true,
    canViewAll: false,
    canManageUsers: false,
  },
  user: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageAssignment: true,
    canViewArea: false,
    canViewAll: false,
    canManageUsers: false,
  },
  intern: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageAssignment: false,
    canViewArea: false,
    canViewAll: false,
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

export function normalizeUserRole(raw?: string | null): UserRole {
  if (
    raw === "admin" ||
    raw === "area_lead" ||
    raw === "user" ||
    raw === "intern" ||
    raw === "viewer"
  ) {
    return raw;
  }
  return "user";
}

export function getEffectivePermissions(
  user?: {
    role?: UserRole | string | undefined;
    permissions?: Partial<UserPermissions> | undefined;
  } | null,
): UserPermissions {
  if (!user) {
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
  const role = normalizeUserRole(user.role);
  const defaults = ROLE_DEFAULT_PERMISSIONS[role];
  const merged: UserPermissions = {
    ...defaults,
    ...(user.permissions || {}),
  };
  if (role === "admin") {
    merged.canManageUsers = true;
  }
  return merged;
}

export function hasCustomPermissions(user?: {
  role?: UserRole | string | undefined;
  permissions?: Partial<UserPermissions> | undefined;
} | null): boolean {
  if (!user || !user.permissions) return false;
  const role = normalizeUserRole(user.role);
  const defaults = ROLE_DEFAULT_PERMISSIONS[role];
  return (Object.keys(defaults) as (keyof UserPermissions)[]).some(
    (k) => user.permissions?.[k] !== undefined && user.permissions[k] !== defaults[k],
  );
}

export interface UserProfile {
  uid: string;
  name: string;
  firstName?: string;
  paternalLastName?: string;
  maternalLastName?: string;
  email: string;
  role: UserRole;
  permissions?: Partial<UserPermissions> | undefined;
  area: string;
  position?: string;
  plant?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

const USERS_COLLECTION = "users";

export const userService = {
  async getUser(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        ...data,
        role: normalizeUserRole(data["role"] as string),
      } as UserProfile;
    }
    return null;
  },

  async createUser(uid: string, data: Omit<UserProfile, "uid">): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, uid), data);
  },

  async updateUserRole(
    uid: string,
    role: UserRole,
    permissions?: Partial<UserPermissions>,
  ): Promise<void> {
    const payload: Record<string, any> = {
      role,
      permissions: permissions ?? ROLE_DEFAULT_PERMISSIONS[role],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), payload, { merge: true });
  },

  async updateUserPermissions(
    uid: string,
    permissions: Partial<UserPermissions>,
  ): Promise<void> {
    await setDoc(
      doc(db, USERS_COLLECTION, uid),
      {
        permissions,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  },

  async updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ): Promise<void> {
    await setDoc(
      doc(db, USERS_COLLECTION, uid),
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  },

  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, USERS_COLLECTION, uid));
  },

  subscribeToUsers(
    onData: (users: UserProfile[]) => void,
    onError: (err: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      collection(db, USERS_COLLECTION),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, any>;
          list.push({
            uid: docSnap.id,
            name: (d["name"] as string) || "Usuario",
            firstName: (d["firstName"] as string) || "",
            paternalLastName: (d["paternalLastName"] as string) || "",
            maternalLastName: (d["maternalLastName"] as string) || "",
            email: (d["email"] as string) || "",
            role: normalizeUserRole(d["role"] as string),
            permissions: (d["permissions"] as Partial<UserPermissions>) || undefined,
            area: (d["area"] as string) || "Usuario",
            position: (d["position"] as string) || "",
            plant: (d["plant"] as string) || "",
            phone: (d["phone"] as string) || "",
            avatarUrl: (d["avatarUrl"] as string) || "",
            bio: (d["bio"] as string) || "",
            createdAt: d["createdAt"] as string,
            updatedAt: d["updatedAt"] as string,
          });
        });
        list.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" }),
        );
        onData(list);
      },
      (err) => {
        onError(err);
      },
    );
  },
};
