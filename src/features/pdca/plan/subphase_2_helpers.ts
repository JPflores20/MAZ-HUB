/**
 * @fileoverview Funciones puras de traspaso de causas entre Ishikawa (Paso 16), 5 Why's (Paso 17) y Conclusiones (Paso 18).
 */
import type { ConclusionCausaRaizItem, FiveWhysTableData } from "@/domain/pdca";

/**
 * Inserta causas priorizadas de Ishikawa hacia la primera tabla de 5 Porqués evitando duplicados.
 */
export function construir_tablas_5_porques_desde_ishikawa(
  tablas_existentes: FiveWhysTableData[],
  causas_priorizadas_texto: string[],
): { tablas_actualizadas: FiveWhysTableData[]; cantidad_agregadas: number } {
  const primera_tabla = tablas_existentes[0] ?? {
    id: `fivewhys-${Date.now()}`,
    title: "CAUSAS PRIORIZADAS ISHIKAWA",
    rows: [],
  };

  const filas_existentes = (
    Array.isArray(primera_tabla.rows)
      ? primera_tabla.rows
      : Object.values(primera_tabla.rows || {})
  ) as Record<string, unknown>[];

  const filas_con_contenido = filas_existentes.filter(
    (fila_actual) =>
      String(fila_actual?.["q1"] || "").trim() !== "" ||
      String(fila_actual?.["w1"] || "").trim() !== "",
  );

  const nuevas_filas = [...filas_con_contenido];
  let cantidad_agregadas = 0;

  causas_priorizadas_texto.forEach((texto_causa, indice_causa) => {
    const ya_existe = nuevas_filas.some(
      (fila_actual) =>
        String(fila_actual?.["q1"] || "")
          .trim()
          .toLowerCase() === texto_causa.toLowerCase(),
    );
    if (!ya_existe) {
      nuevas_filas.push({
        id: Date.now() + indice_causa + Math.random(),
        q1: texto_causa,
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
      });
      cantidad_agregadas += 1;
    }
  });

  const tabla_actualizada: FiveWhysTableData = {
    ...primera_tabla,
    rows: nuevas_filas as FiveWhysTableData["rows"],
  };

  return {
    tablas_actualizadas:
      tablas_existentes.length > 0
        ? [tabla_actualizada, ...tablas_existentes.slice(1)]
        : [tabla_actualizada],
    cantidad_agregadas,
  };
}

/**
 * Añade hallazgos confirmados en 5 Porqués a la tabla de conclusiones evitando duplicados exactos.
 */
export function construir_conclusiones_desde_5_porques(
  conclusiones_existentes: ConclusionCausaRaizItem[],
  hallazgos: { problema: string; causaRaiz: string; accion: string }[],
): { conclusiones_actualizadas: ConclusionCausaRaizItem[]; cantidad_agregadas: number } {
  const conclusiones_actualizadas = [...conclusiones_existentes];
  let cantidad_agregadas = 0;

  hallazgos.forEach((hallazgo) => {
    const ya_existe = conclusiones_actualizadas.some(
      (item_actual) =>
        String(item_actual?.causaRaiz || "")
          .trim()
          .toLowerCase() === hallazgo.causaRaiz.toLowerCase() &&
        String(item_actual?.problema || "")
          .trim()
          .toLowerCase() === hallazgo.problema.toLowerCase(),
    );
    if (!ya_existe) {
      conclusiones_actualizadas.push({
        id: crypto.randomUUID(),
        problema: hallazgo.problema,
        causaRaiz: hallazgo.causaRaiz,
        validacion: "Análisis 5 Porqués",
        valorP: "Validada",
        conclusion: hallazgo.accion || "Causa raíz confirmada para Plan de Acción",
      });
      cantidad_agregadas += 1;
    }
  });

  return { conclusiones_actualizadas, cantidad_agregadas };
}
