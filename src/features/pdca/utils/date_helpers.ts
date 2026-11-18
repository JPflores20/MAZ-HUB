/**
 * @fileoverview Utilidades de manipulación y formateo de fechas para el módulo PDCA.
 */

/**
 * Convierte una cadena de fecha en formato YYYY-MM-DD o DD/MM/YYYY a un objeto Date.
 * @param raw_date_string - Cadena de fecha cruda o nula.
 * @returns Instancia de Date válida o undefined si no puede parsearse.
 */
export const parse_date_string = (raw_date_string?: string | null): Date | undefined => {
  if (!raw_date_string || typeof raw_date_string !== "string") {
    return undefined;
  }

  const trimmed_date = raw_date_string.trim();

  // Formato ISO corto YYYY-MM-DD
  if (trimmed_date.includes("-")) {
    const date_parts = trimmed_date.split("-").map(Number);
    const [year_number, month_number, day_number] = date_parts;
    if (
      year_number !== undefined &&
      month_number !== undefined &&
      day_number !== undefined &&
      year_number > 1000
    ) {
      const parsed_date = new Date(year_number, month_number - 1, day_number);
      return Number.isNaN(parsed_date.getTime()) ? undefined : parsed_date;
    }
  }

  // Formato latinoamericano DD/MM/YYYY
  if (trimmed_date.includes("/")) {
    const date_parts = trimmed_date.split("/").map(Number);
    const [day_number, month_number, year_number] = date_parts;
    if (day_number !== undefined && month_number !== undefined && year_number !== undefined) {
      const parsed_date = new Date(year_number, month_number - 1, day_number);
      return Number.isNaN(parsed_date.getTime()) ? undefined : parsed_date;
    }
  }

  const fallback_parsed_date = new Date(trimmed_date);
  return Number.isNaN(fallback_parsed_date.getTime()) ? undefined : fallback_parsed_date;
};

/**
 * Formatea una fecha a representación DD/MM/YYYY con ceros a la izquierda.
 * @param date_object - Fecha a formatear.
 * @returns Cadena DD/MM/YYYY o cadena vacía si la fecha es inválida.
 */
export const format_date_to_string = (date_object?: Date | null): string => {
  if (!date_object || !(date_object instanceof Date) || Number.isNaN(date_object.getTime())) {
    return "";
  }

  const formatted_day = String(date_object.getDate()).padStart(2, "0");
  const formatted_month = String(date_object.getMonth() + 1).padStart(2, "0");
  const formatted_year = date_object.getFullYear();

  return `${formatted_day}/${formatted_month}/${formatted_year}`;
};
