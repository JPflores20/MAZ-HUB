/**
 * rubrica_5w_row_mapper.ts
 * Helper puro y compartido para mapear las columnas de evaluación de rúbrica 5W (IAL)
 * desde una fila de la hoja "Hoja1" del Excel de Usabilidad.
 */
import type { RubricaCalidad5W } from "@/domain/models/usabilidad/usabilidad_types";

/**
 * Verifica si el contenido de una celda de rúbrica equivale a la marca aprobatoria `"OK"`.
 *
 * @param raw_cell_value - Valor crudo de celda leído con SheetJS.
 * @returns `true` cuando el texto normalizado coincide con `"OK"`.
 */
function is_cell_marked_ok(raw_cell_value: unknown): boolean {
  return String(raw_cell_value ?? "").trim().toUpperCase() === "OK";
}

/**
 * Construye el objeto `RubricaCalidad5W` a partir de las columnas 24–32 de una fila de Hoja1.
 *
 * @param fila_actual - Arreglo de celdas correspondiente a una fila de Hoja1.
 * @returns Estructura tipada de rúbrica de calidad 5W.
 */
export function parse_rubrica_5w_from_row(fila_actual: unknown[]): RubricaCalidad5W {
  return {
    informacion_completa: is_cell_marked_ok(fila_actual[25]),
    flujo_cumplido: is_cell_marked_ok(fila_actual[26]),
    primera_linea_involucrada: is_cell_marked_ok(fila_actual[27]),
    evidencia_por_ques: is_cell_marked_ok(fila_actual[28]),
    secuencia_logica: is_cell_marked_ok(fila_actual[29]),
    causa_raiz_encontrada: is_cell_marked_ok(fila_actual[30]),
    acciones_cierre_ciclo: is_cell_marked_ok(fila_actual[31]),
    comentarios_mejora: String(fila_actual[32] ?? "").trim() || undefined,
    evaluado_por: String(fila_actual[24] ?? "").trim() || undefined,
  };
}
