/**
 * use_directory_users.ts
 * Hook y funciones de resolución para unificar el directorio de usuarios (Firestore + sesión + externos).
 */
import { useMemo } from "react";
import { useAuth, type DirectoryUser } from "@/features/auth/auth_context";
import type { ResponsibleInput } from "./responsible_types";

/**
 * Registra o fusiona un candidato en el mapa del directorio conservando datos no vacíos existentes.
 *
 * @param directory_map - Índice acumulativo por nombre en mayúsculas.
 * @param candidate_user - Registro parcial de usuario a incorporar.
 */
function register_directory_user(
  directory_map: Map<string, DirectoryUser>,
  candidate_user?: Partial<DirectoryUser> | null,
): void {
  if (!candidate_user || !candidate_user.name) return;
  const normalized_key = candidate_user.name.trim().toUpperCase();
  const existing_user = directory_map.get(normalized_key);

  const resolved_area =
    candidate_user.area && candidate_user.area !== "Usuario"
      ? candidate_user.area
      : existing_user?.area && existing_user?.area !== "Usuario"
        ? existing_user.area
        : candidate_user.area || existing_user?.area || "";

  directory_map.set(normalized_key, {
    uid: candidate_user.uid || existing_user?.uid,
    name: candidate_user.name.trim(),
    email: candidate_user.email || existing_user?.email || "",
    area: resolved_area,
    position: candidate_user.position || existing_user?.position || "",
    avatarUrl: candidate_user.avatarUrl || existing_user?.avatarUrl || "",
    role: candidate_user.role || existing_user?.role,
  });
}

/**
 * Busca y completa los datos de perfil de un responsable contra el directorio unificado.
 *
 * @param directory - Catálogo deduplicado de usuarios disponibles.
 * @param input_user - Nombre en texto libre o descriptor parcial de responsable.
 * @returns Perfil normalizado listo para renderizar tarjetas y avatares.
 */
export function resolve_directory_user(
  directory: DirectoryUser[],
  input_user: ResponsibleInput,
): DirectoryUser {
  const raw_name =
    typeof input_user === "string" ? input_user.trim() : (input_user.name || "").trim();
  const raw_email = typeof input_user === "string" ? "" : (input_user.email || "").trim();

  const matched_user = directory.find((directory_user) => {
    if (
      raw_email &&
      directory_user.email &&
      directory_user.email.toLowerCase() === raw_email.toLowerCase()
    ) {
      return true;
    }
    if (raw_name && directory_user.name.toLowerCase() === raw_name.toLowerCase()) {
      return true;
    }
    if (
      raw_name &&
      directory_user.email &&
      directory_user.email.toLowerCase() === raw_name.toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  const resolved_area =
    (typeof input_user === "object" && input_user.area ? input_user.area : matched_user?.area) ||
    "";
  const clean_area = resolved_area === "Usuario" ? "" : resolved_area;

  return {
    uid: (typeof input_user === "object" ? input_user.uid : undefined) || matched_user?.uid,
    name: matched_user?.name || raw_name || "USUARIO",
    email: matched_user?.email || raw_email || "",
    area: clean_area,
    position:
      (typeof input_user === "object" && input_user.position
        ? input_user.position
        : matched_user?.position) || "",
    avatarUrl:
      (typeof input_user === "object" && input_user.avatarUrl
        ? input_user.avatarUrl
        : matched_user?.avatarUrl) || "",
  };
}

/**
 * Unifica el directorio de usuarios disponibles y expone un resolvedor memoizado por nombre/correo.
 *
 * @param external_users - Lista adicional opcional de usuarios precargados fuera del contexto Auth.
 * @returns Objeto con `directory` ordenado e indizado y la función `resolve_user`.
 */
export function useDirectoryUsers(external_users?: DirectoryUser[]) {
  let auth_users: DirectoryUser[] = [];
  let current_user: DirectoryUser | null = null;

  try {
    const auth_context = useAuth();
    auth_users = auth_context.usersList || [];
    current_user = auth_context.currentUser;
  } catch {
    // Permite renderizar componentes de perfil en pruebas unitarias sin AuthProvider
  }

  const directory = useMemo(() => {
    const directory_map = new Map<string, DirectoryUser>();
    if (external_users) {
      for (const external_user of external_users) {
        register_directory_user(directory_map, external_user);
      }
    }
    for (const auth_user of auth_users) {
      register_directory_user(directory_map, auth_user);
    }
    if (current_user) {
      register_directory_user(directory_map, current_user);
    }
    return Array.from(directory_map.values());
  }, [auth_users, current_user, external_users]);

  const resolve_user = useMemo(
    () => (input_user: ResponsibleInput) => resolve_directory_user(directory, input_user),
    [directory],
  );

  return { directory, resolve_user };
}
