/**
 * Sanitización de celdas y filas exportadas a hojas Excel/CSV para prevenir CSV/Formula Injection.
 */

/**
 * Detecta si el primer carácter visible (o tabulación/CR inicial) puede interpretarse como fórmula en Excel/Calc.
 * @param texto_celda - Texto original de la celda a exportar.
 * @returns `true` si requiere prefijo de escape `'` para neutralizar ejecución de fórmulas.
 */
function starts_with_spreadsheet_formula_prefix(texto_celda: string): boolean {
  for (let indice_char = 0; indice_char < texto_celda.length; indice_char += 1) {
    const caracter_actual = texto_celda[indice_char];
    if (!caracter_actual) continue;
    if (
      caracter_actual === "\t" ||
      caracter_actual === "\r" ||
      caracter_actual === "=" ||
      caracter_actual === "+" ||
      caracter_actual === "-" ||
      caracter_actual === "@"
    ) {
      return true;
    }
    const codigo_char = texto_celda.charCodeAt(indice_char);
    if (codigo_char > 0x20 && caracter_actual !== "\u00a0" && caracter_actual.trim() !== "") {
      return false;
    }
  }
  return false;
}

/**
 * Neutraliza una celda exportada a Excel/CSV anteponiendo comilla simple cuando inicia con operador de fórmula.
 * @param valor_celda - Valor primitivo u objeto de la celda.
 * @returns Valor seguro para escritura directa en hoja de cálculo.
 */
export function sanitize_spreadsheet_cell(valor_celda: unknown): string | number {
  if (valor_celda === null || valor_celda === undefined) return "";
  if (typeof valor_celda === "number") return Number.isFinite(valor_celda) ? valor_celda : "";
  if (typeof valor_celda === "boolean") return valor_celda ? "Sí" : "No";
  const texto_celda = String(valor_celda);
  if (starts_with_spreadsheet_formula_prefix(texto_celda)) {
    return `'${texto_celda}`;
  }
  return texto_celda;
}

/**
 * Aplica `sanitize_spreadsheet_cell` sobre todas las propiedades de cada fila antes de generar archivos Excel/CSV.
 * @param filas_origen - Colección de registros tabulares a exportar.
 * @returns Arreglo de registros sanitizados listos para serialización.
 */
export function sanitize_rows_for_spreadsheet<T extends Record<string, unknown>>(
  filas_origen: readonly T[],
): Record<string, string | number>[] {
  return filas_origen.map((fila_origen) => {
    const fila_segura: Record<string, string | number> = {};
    for (const [nombre_columna, valor_columna] of Object.entries(fila_origen)) {
      fila_segura[nombre_columna] = sanitize_spreadsheet_cell(valor_columna);
    }
    return fila_segura;
  });
}
