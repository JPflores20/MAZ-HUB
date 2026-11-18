/**
 * @fileoverview Normalizador puro de tablas históricas de análisis 5 Porqués (Paso 17).
 */
import type { FiveWhysTableData, Pdca } from "@/domain/pdca";

type RegistroCrudo = Record<string, unknown>;

function crear_fila_vacia_5_porques(indice_base: number): RegistroCrudo {
  return {
    id: Date.now() + indice_base,
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    w1: "",
    w2: "",
    w3: "",
    w4: "",
    w5: "",
    accion: "",
    isRootCause: "",
  };
}

function intentar_parsear_json<T>(crudo: unknown, respaldo: T): T {
  if (typeof crudo !== "string") return (crudo as T) ?? respaldo;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return respaldo;
  }
}

/**
 * Convierte cualquier esquema histórico de tablas 5 Porqués a su formato uniforme actual.
 */
export function normalizar_tablas_cinco_porques(pdca_inicial: Pdca): FiveWhysTableData[] {
  const extendido = pdca_inicial as unknown as RegistroCrudo;
  const objeto_tablas = pdca_inicial.fiveWhysTables || extendido["five_whys_tables"];
  const tablas_crudas = Array.isArray(objeto_tablas)
    ? objeto_tablas
    : objeto_tablas && typeof objeto_tablas === "object"
      ? Object.values(objeto_tablas as RegistroCrudo)
      : null;

  if (!tablas_crudas || tablas_crudas.length === 0) {
    return [{ id: "fivewhys-1", title: "MÉTODO", rows: [crear_fila_vacia_5_porques(0)] }];
  }

  return tablas_crudas.map((tabla_actual) => {
    const tabla = tabla_actual as RegistroCrudo;
    const filas_crudas = intentar_parsear_json<unknown>(tabla["rows"] || tabla["data"], []);
    let filas_mapeadas: RegistroCrudo[] = [];

    if (Array.isArray(filas_crudas)) {
      filas_mapeadas = filas_crudas as RegistroCrudo[];
    } else if (filas_crudas && typeof filas_crudas === "object") {
      const registro_filas = filas_crudas as RegistroCrudo;
      filas_mapeadas =
        registro_filas["why1"] !== undefined || registro_filas["q1"] !== undefined
          ? [registro_filas]
          : (Object.values(registro_filas) as RegistroCrudo[]);
    }

    if (filas_mapeadas.length === 0) {
      const llaves_numericas = Object.keys(tabla).filter((llave) => !Number.isNaN(Number(llave)) && llave !== "length");
      if (llaves_numericas.length > 0) {
        filas_mapeadas = llaves_numericas.map((llave) => tabla[llave] as RegistroCrudo);
      } else if (tabla["why1"] !== undefined || tabla["q1"] !== undefined) {
        filas_mapeadas = [tabla];
      }
    }

    const filas_normalizadas =
      filas_mapeadas.length === 0
        ? Array.from({ length: 5 }).map((_, indice) => crear_fila_vacia_5_porques(indice))
        : filas_mapeadas.map((fila_cruda) => ({
            id: fila_cruda["id"] || Date.now() + Math.random(),
            q1: fila_cruda["q1"] !== undefined ? fila_cruda["q1"] : fila_cruda["why1"] || "",
            q2: fila_cruda["q2"] !== undefined ? fila_cruda["q2"] : fila_cruda["why2"] || "",
            q3: fila_cruda["q3"] !== undefined ? fila_cruda["q3"] : fila_cruda["why3"] || "",
            q4: fila_cruda["q4"] !== undefined ? fila_cruda["q4"] : fila_cruda["why4"] || "",
            q5: fila_cruda["q5"] !== undefined ? fila_cruda["q5"] : fila_cruda["why5"] || "",
            w1: fila_cruda["w1"] || "",
            w2: fila_cruda["w2"] || "",
            w3: fila_cruda["w3"] || "",
            w4: fila_cruda["w4"] || "",
            w5: fila_cruda["w5"] || "",
            isRootCause:
              fila_cruda["isRootCause"] !== undefined
                ? fila_cruda["isRootCause"]
                : fila_cruda["rootCause"] === "Sí" || fila_cruda["rootCause"] === "S" || fila_cruda["rootCause"] === "Si"
                  ? "Sí"
                  : fila_cruda["rootCause"] === "No"
                    ? "No"
                    : "",
            accion: fila_cruda["accion"] !== undefined ? fila_cruda["accion"] : fila_cruda["effect"] || "",
            evidencia: fila_cruda["evidencia"] || "",
          }));

    return { ...(tabla as FiveWhysTableData), rows: filas_normalizadas };
  });
}
