/**
 * responsible_types.ts
 * Tipos compartidos y utilidades puras de formato para perfiles e iniciales de responsables.
 */

export type ResponsibleInput =
  | string
  | {
      uid?: string | undefined;
      name: string;
      email?: string | undefined;
      area?: string | undefined;
      position?: string | undefined;
      avatarUrl?: string | undefined;
    };

/**
 * Calcula hasta 2 iniciales en mayúsculas a partir del nombre de un usuario.
 *
 * @param user_name - Nombre completo o identificador legible del usuario.
 * @returns Cadena corta de iniciales (mínimo `"U"` si está vacío).
 */
export function get_user_initials(user_name: string): string {
  const name_parts = (user_name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (name_parts.length === 0) return "U";
  if (name_parts.length === 1) return (name_parts[0]?.slice(0, 2) || "U").toUpperCase();
  return `${name_parts[0]?.[0] || ""}${name_parts[1]?.[0] || ""}`.toUpperCase();
}

/**
 * Normaliza el nombre de área de un colaborador descartando el valor genérico `"Usuario"`.
 *
 * @param area_name - Área almacenada en el perfil del usuario.
 * @param fallback_label - Etiqueta a mostrar cuando no exista un área válida.
 * @returns Nombre de área limpio o texto de respaldo.
 */
export function format_user_area_label(
  area_name?: string,
  fallback_label = "SIN ÁREA",
): string {
  return area_name && area_name !== "Usuario" ? area_name : fallback_label;
}

/**
 * Devuelve el puesto del usuario o una etiqueta de respaldo si está vacío.
 *
 * @param position_name - Puesto del colaborador.
 * @param fallback_label - Texto por defecto cuando no hay puesto registrado.
 * @returns Puesto legible para mostrar en tarjetas y modales.
 */
export function format_user_position_label(
  position_name?: string,
  fallback_label = "SIN PUESTO",
): string {
  return position_name || fallback_label;
}
