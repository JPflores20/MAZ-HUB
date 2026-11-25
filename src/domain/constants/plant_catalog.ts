/**
 * Catálogos oficiales de planta, departamentos, áreas operativas y etapas de proceso junto con reglas de jerarquía de área.
 */

export interface AreaOption {
  value: string;
  label: string;
  parentArea?: string;
}

/** Plantas cerveceras habilitadas oficialmente en formularios PDCA/RDA. */
export const OFFICIAL_PLANTAS = ["Zacatecas"] as const;

/** Opciones sugeridas en formularios de registro y perfil de usuario. */
export const SUGGESTED_AREAS = ["COCIMIENTOS", "BLOQUE FRIO", "ELABORACION"] as const;
export const SUGGESTED_POSITIONS = ["PLANEADOR", "SUPERVISOR", "TECNICO", "GERENTE"] as const;
export const SUGGESTED_PLANTS = [
  "Cervecería Zacatecas",
  "Cervecería Centro",
  "Cervecería Modelo",
  "Corporativo MAZ",
] as const;
export const DEFAULT_PLANT = "Cervecería Zacatecas";

/** Verifica excepción de identidad que habilita seleccionar el área restringida ELABORACION. */
export function can_select_elaboracion_area(full_name: string, email?: string | null): boolean {
  const strip_accents = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  const candidate_name = strip_accents(full_name);
  const candidate_email = strip_accents(email || "");
  return (
    (candidate_name.includes("AXEL") && candidate_name.includes("GUILLEN")) ||
    (candidate_email.includes("AXEL") && candidate_email.includes("GUILLEN"))
  );
}

/** Departamentos operativos reconocidos en la planta. */
export const OFFICIAL_DEPARTAMENTOS = ["Elaboración", "S&E", "Tratamiento de Agua"] as const;

/** Áreas principales de operación para filtrado y aislamiento RBAC. */
export const OFFICIAL_AREAS = ["Cocimientos", "Cuartos Frios", "Mantenimiento"] as const;

/** Etapas de proceso productivas y auxiliares del catálogo oficial. */
export const OFFICIAL_ETAPAS = [
  "Agua de Proceso",
  "Materiales Auxiliares",
  "CIP Cocimientos",
  "Materias Primas",
  "Ensilado",
  "Molienda",
  "Reclamo de malta",
  "Dislucion de Grits",
  "Cocedor",
  "Maceración",
  "Filtración de Mosto",
  "Ebullicion",
  "Lupulado de Mosto",
  "Evaporador",
  "Reposo de Mosto",
  "Enfriamiento de Mosto",
  "CIP Bloque Frio",
  "Fermentación",
  "Manejo de levadura",
  "CMF/Cerveza Recuperada",
  "Reposo",
  "Filtración de Cerveza",
  "Estabilizacion de Cerveza",
  "BBT",
  "Multiblender",
  "Servicios y Energia",
  "Procesos de Mantto",
] as const;

/** Opciones formateadas de áreas para selectores de UI. */
export const AREAS: AreaOption[] = [
  { value: "Cocimientos", label: "Cocimientos" },
  { value: "Cuartos Frios", label: "Cuartos Frios" },
  { value: "Mantenimiento", label: "Mantenimiento" },
];

/**
 * Normaliza nombres de áreas removiendo acentos, guiones bajos y espacios laterales para comparación estable.
 * @param valor_area - Texto crudo del área operativa.
 * @returns Cadena normalizada en minúsculas sin diacríticos.
 */
function normalize_area_key(valor_area?: string): string {
  return (valor_area || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Determina si un área corresponde a Bloque Frío / Cuartos Fríos (incluyendo Fermentación y Filtración).
 * @param area_operativa - Nombre del área a evaluar.
 * @returns `true` cuando pertenece operativamente al bloque frío.
 */
export function is_bloque_frio_area(area_operativa?: string): boolean {
  const area_normalizada = normalize_area_key(area_operativa);
  if (!area_normalizada) return false;
  return (
    area_normalizada.includes("frio") ||
    area_normalizada.includes("fermentacion") ||
    area_normalizada.includes("filtracion")
  );
}

/**
 * Verifica si el área de un documento (PDCA o RDA) coincide o pertenece jerárquicamente al área objetivo.
 * @param area_documento - Área almacenada en el documento evaluado.
 * @param area_objetivo - Área del usuario o filtro activo.
 * @returns `true` si hay coincidencia exacta o pertenencia al bloque padre.
 */
export function does_area_belong_to_parent_or_match(
  area_documento?: string,
  area_objetivo?: string,
): boolean {
  const documento_normalizado = normalize_area_key(area_documento);
  const objetivo_normalizado = normalize_area_key(area_objetivo);
  if (!documento_normalizado || !objetivo_normalizado) return false;
  if (documento_normalizado === objetivo_normalizado) return true;

  if (
    objetivo_normalizado.includes("bloque frio") ||
    objetivo_normalizado.includes("cuartos frios")
  ) {
    return is_bloque_frio_area(area_documento);
  }

  return false;
}
