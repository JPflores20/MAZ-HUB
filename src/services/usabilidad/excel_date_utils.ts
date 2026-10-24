/**
 * excel_date_utils.ts
 * Utilidades puras para conversión de fechas seriales de Excel, validación de marcas afirmativas
 * y normalización de calificaciones decimales.
 */

export interface ResultadoFechaExcel {
  fecha_iso: string;
  anio: number;
  mes: number;
  semana: number;
}

/**
 * Convierte un número serial de fecha de Excel (ej. 45293) o una cadena de texto
 * al formato ISO YYYY-MM-DD, calculando además el año, mes y número de semana.
 */
export function convertir_fecha_excel_a_iso(valor_crudo: unknown): ResultadoFechaExcel {
  let objeto_fecha: Date | null = null;

  if (typeof valor_crudo === "number" && valor_crudo > 20000 && valor_crudo < 80000) {
    const dias_utc = Math.floor(valor_crudo - 25569);
    objeto_fecha = new Date(dias_utc * 86400 * 1000);
  } else if (typeof valor_crudo === "string" && valor_crudo.trim() !== "") {
    const texto_limpio = valor_crudo.trim();
    const coincidencia_dmy = texto_limpio.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (coincidencia_dmy) {
      objeto_fecha = new Date(
        Number(coincidencia_dmy[3]),
        Number(coincidencia_dmy[2]) - 1,
        Number(coincidencia_dmy[1]),
      );
    } else {
      const fecha_parseada = new Date(texto_limpio);
      if (!Number.isNaN(fecha_parseada.getTime())) {
        objeto_fecha = fecha_parseada;
      }
    }
  }

  if (!objeto_fecha || Number.isNaN(objeto_fecha.getTime())) {
    objeto_fecha = new Date(2024, 0, 1);
  }

  const anio = objeto_fecha.getUTCFullYear();
  const mes = objeto_fecha.getUTCMonth() + 1;
  const dia = objeto_fecha.getUTCDate();
  const fecha_iso = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const inicio_anio = new Date(Date.UTC(anio, 0, 1));
  const diferencia_dias = Math.floor(
    (objeto_fecha.getTime() - inicio_anio.getTime()) / 86400000,
  );
  const semana = Math.max(
    1,
    Math.min(53, Math.ceil((diferencia_dias + inicio_anio.getUTCDay() + 1) / 7)),
  );

  return { fecha_iso, anio, mes, semana };
}

/**
 * Determina si una celda del Excel contiene una marca afirmativa ("X", "1", "SI", "SÍ", "OK").
 */
export function es_marca_afirmativa(valor_celda: unknown): boolean {
  if (valor_celda === undefined || valor_celda === null) return false;
  const texto_mayusculas = String(valor_celda).trim().toUpperCase();
  return (
    texto_mayusculas === "X" ||
    texto_mayusculas === "1" ||
    texto_mayusculas === "SI" ||
    texto_mayusculas === "SÍ" ||
    texto_mayusculas === "YES" ||
    texto_mayusculas === "OK"
  );
}

/**
 * Normaliza una calificación cruda de Excel a escala decimal de 0 a 1 (ej. 0.8571).
 */
export function normalizar_calificacion_decimal(valor_celda: unknown): number | null {
  if (valor_celda === "" || valor_celda === null || valor_celda === undefined) {
    return null;
  }
  const numero_convertido = Number(valor_celda);
  if (Number.isNaN(numero_convertido)) return null;
  if (numero_convertido > 1.05) {
    return Number((numero_convertido / 100).toFixed(4));
  }
  return Number(numero_convertido.toFixed(4));
}
