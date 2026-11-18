/**
 * @fileoverview Pure formatting, avatar image compression, name parsing, and password strength utilities.
 */

import type { UserProfile } from "@/features/auth/auth_context";

export const SUGGESTED_AREAS = ["COCIMIENTOS", "BLOQUE FRIO", "ELABORACION"] as const;
export const SUGGESTED_POSITIONS = ["PLANEADOR", "SUPERVISOR", "TECNICO", "GERENTE"] as const;
export const SUGGESTED_PLANTS = [
  "Cervecería Zacatecas",
  "Cervecería Centro",
  "Cervecería Modelo",
  "Corporativo MAZ",
] as const;

export const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/** Compresses and center-crops a selected avatar image file into a 256x256 `.webp` data URL. */
export async function compress_avatar_image(
  image_file: File,
): Promise<{ data_url: string; size_kb: number }> {
  return new Promise((resolve, reject) => {
    const file_reader = new FileReader();
    file_reader.onload = (load_event) => {
      const html_image = new Image();
      html_image.onload = () => {
        const target_size = 256;
        const canvas_element = document.createElement("canvas");
        canvas_element.width = target_size;
        canvas_element.height = target_size;
        const canvas_context = canvas_element.getContext("2d");
        if (!canvas_context) {
          reject(new Error("No se pudo inicializar el lienzo de imagen."));
          return;
        }

        const shortest_side = Math.min(html_image.width, html_image.height);
        const source_offset_x = (html_image.width - shortest_side) / 2;
        const source_offset_y = (html_image.height - shortest_side) / 2;

        canvas_context.drawImage(
          html_image,
          source_offset_x,
          source_offset_y,
          shortest_side,
          shortest_side,
          0,
          0,
          target_size,
          target_size,
        );
        const data_url = canvas_element.toDataURL("image/webp", 0.78);
        const base64_length = data_url.split(",")[1]?.length || 0;
        const size_kb = Math.max(1, Math.round((base64_length * 0.75) / 1024));
        resolve({ data_url, size_kb });
      };
      html_image.onerror = () => reject(new Error("Archivo de imagen inválido."));
      html_image.src = load_event.target?.result as string;
    };
    file_reader.onerror = () => reject(new Error("Error al leer el archivo."));
    file_reader.readAsDataURL(image_file);
  });
}

/** Splits a flat uppercase full name string into Nombre(s), Apellido Paterno, and Apellido Materno. */
export function split_full_name(full_name: string): {
  nombre: string;
  paterno: string;
  materno: string;
} {
  const name_parts = full_name.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (name_parts.length === 0) return { nombre: "", paterno: "", materno: "" };
  if (name_parts.length === 1) return { nombre: name_parts[0] || "", paterno: "", materno: "" };
  if (name_parts.length === 2) {
    return { nombre: name_parts[0] || "", paterno: name_parts[1] || "", materno: "" };
  }
  const materno = name_parts[name_parts.length - 1] || "";
  const paterno = name_parts[name_parts.length - 2] || "";
  const nombre = name_parts.slice(0, -2).join(" ");
  return { nombre, paterno, materno };
}

/** Extracts normalized name parts from explicit fields or splits `user.name` as fallback. */
export function get_user_name_parts(user_profile: UserProfile | null | undefined): {
  nombre: string;
  paterno: string;
  materno: string;
} {
  if (!user_profile) return { nombre: "", paterno: "", materno: "" };
  if (
    user_profile.firstName ||
    user_profile.paternalLastName ||
    user_profile.maternalLastName
  ) {
    return {
      nombre: (user_profile.firstName || "").toUpperCase(),
      paterno: (user_profile.paternalLastName || "").toUpperCase(),
      materno: (user_profile.maternalLastName || "").toUpperCase(),
    };
  }
  return split_full_name(user_profile.name || "");
}

/** Computes two-character uppercase avatar initials from a user name string. */
export function compute_settings_initials(display_name: string): string {
  return (display_name || "U")
    .split(" ")
    .filter(Boolean)
    .map((word_part) => word_part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/** Evaluates password complexity on a 3-step indicator scale. */
export function evaluate_password_strength(candidate_password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!candidate_password) {
    return { score: 0, label: "", color: "bg-muted" };
  }
  let strength_score = 0;
  if (candidate_password.length >= 8) strength_score += 1;
  if (candidate_password.length >= 10) strength_score += 1;
  if (/[A-Z]/.test(candidate_password) && /[0-9]/.test(candidate_password)) strength_score += 1;
  if (/[^A-Za-z0-9]/.test(candidate_password)) strength_score += 1;

  if (strength_score <= 1) return { score: 1, label: "Débil", color: "bg-red-500" };
  if (strength_score === 2) return { score: 2, label: "Media", color: "bg-amber-500" };
  return { score: 3, label: "Fuerte", color: "bg-emerald-500" };
}

/** Checks identity exception unlocking selection of the restricted ELABORACION area. */
export function is_axel_guillen_identity(
  full_name: string,
  target_user: UserProfile | null | undefined,
): boolean {
  const strip_accents = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  const candidate_name = strip_accents(`${full_name} ${target_user?.name || ""}`);
  const candidate_email = strip_accents(target_user?.email || "");
  return (
    (candidate_name.includes("AXEL") && candidate_name.includes("GUILLEN")) ||
    (candidate_email.includes("AXEL") && candidate_email.includes("GUILLEN"))
  );
}
