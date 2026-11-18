/**
 * @fileoverview Normalizadores puros de estructuras legadas para Ishikawa y Temas GOP.
 */
import type { IshikawaItem, Pdca } from "@/domain/pdca";
import { normalizar_tablas_cinco_porques } from "./pdca_five_whys_normalizer";

export { normalizar_tablas_cinco_porques };

type RegistroCrudo = Record<string, unknown>;

function intentar_parsear_json<T>(crudo: unknown, respaldo: T): T {
  if (typeof crudo !== "string") return (crudo as T) ?? respaldo;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return respaldo;
  }
}

function normalizar_causas_ishikawa(causas_entrada: unknown): Record<string, string[]> {
  const causas_objeto = intentar_parsear_json<RegistroCrudo>(causas_entrada, {});
  const resultado: Record<string, string[]> = {
    machine: [],
    method: [],
    material: [],
    manpower: [],
    measurement: [],
    environment: [],
  };
  if (!causas_objeto || typeof causas_objeto !== "object") return resultado;

  for (const [clave_categoria, lista_causas] of Object.entries(causas_objeto)) {
    if (!Array.isArray(lista_causas)) continue;
    const clave_lower = clave_categoria.toLowerCase();
    if (clave_lower.includes("m\u00e1quina") || clave_lower.includes("maquina") || clave_lower.includes("machine")) {
      resultado["machine"]!.push(...lista_causas);
    } else if (clave_lower.includes("m\u00e9todo") || clave_lower.includes("metodo") || clave_lower.includes("method")) {
      resultado["method"]!.push(...lista_causas);
    } else if (clave_lower.includes("material")) {
      resultado["material"]!.push(...lista_causas);
    } else if (clave_lower.includes("mano") || clave_lower.includes("obra") || clave_lower.includes("manpower")) {
      resultado["manpower"]!.push(...lista_causas);
    } else if (clave_lower.includes("medici\u00f3n") || clave_lower.includes("medicion") || clave_lower.includes("measurement")) {
      resultado["measurement"]!.push(...lista_causas);
    } else if (clave_lower.includes("medio") || clave_lower.includes("ambiente") || clave_lower.includes("environment")) {
      resultado["environment"]!.push(...lista_causas);
    } else {
      resultado["machine"]!.push(...lista_causas);
    }
  }
  return resultado;
}

/**
 * Normaliza diagramas Ishikawa modernos o migra el formato legado de causa única.
 */
export function normalizar_ishikawas_iniciales(pdca_inicial: Pdca): IshikawaItem[] {
  const objeto_crudo = pdca_inicial.ishikawas;
  const lista_cruda = Array.isArray(objeto_crudo)
    ? objeto_crudo
    : objeto_crudo && typeof objeto_crudo === "object"
      ? (Object.values(objeto_crudo as RegistroCrudo) as IshikawaItem[])
      : null;

  if (lista_cruda && lista_cruda.length > 0) {
    return lista_cruda.map((diagrama_crudo) => {
      const diagrama = diagrama_crudo as IshikawaItem;
      return {
        ...diagrama,
        causes: normalizar_causas_ishikawa(diagrama.causes),
        prioritization: Array.isArray(diagrama.prioritization)
          ? diagrama.prioritization
          : intentar_parsear_json<unknown[]>(diagrama.prioritization, []),
      };
    });
  }

  const extendido = pdca_inicial as unknown as RegistroCrudo;
  const causas_legadas = pdca_inicial.ishikawaCauses || extendido["ishikawa_causes"];
  if (causas_legadas) {
    const priorizacion_legada = pdca_inicial.prioritizationCauses || extendido["prioritization_causes"];
    return [
      {
        id: "ishikawa-1",
        title: "Análisis de Causa",
        effect: (pdca_inicial.ishikawaEffect || extendido["ishikawa_effect"] || "Efecto / Problema") as string,
        prioritization: Array.isArray(priorizacion_legada)
          ? priorizacion_legada
          : intentar_parsear_json<unknown[]>(priorizacion_legada, []),
        prioritization_custom_criterion: (extendido["prioritizationCustomCriterion"] ||
          extendido["prioritization_custom_criterion"] ||
          "") as string,
        custom_labels: (pdca_inicial.ishikawaConceptos || extendido["ishikawa_conceptos"] || {}) as Record<string, string>,
        causes: normalizar_causas_ishikawa(causas_legadas),
      },
    ];
  }

  return [
    {
      id: "ishikawa-1",
      title: "Análisis de Causa",
      effect: "Efecto / Problema",
      causes: normalizar_causas_ishikawa({}),
      prioritization: [],
    },
  ];
}

function normalizar_arreglo_meses<T>(valor_crudo: unknown, mapeador: (valor: unknown) => T, defecto: T): T[] {
  if (Array.isArray(valor_crudo)) return Array.from({ length: 12 }, (_, indice) => mapeador(valor_crudo[indice]));
  if (valor_crudo && typeof valor_crudo === "object") {
    const registro = valor_crudo as RegistroCrudo;
    return Array.from({ length: 12 }, (_, indice) => mapeador(registro[String(indice)]));
  }
  return Array.from({ length: 12 }, () => defecto);
}

/**
 * Extrae y normaliza los temas GOP / mensualidades desde cualquiera de las llaves históricas.
 */
export function normalizar_temas_gop_iniciales(pdca_inicial: Pdca): RegistroCrudo[] {
  const extendido = pdca_inicial as unknown as RegistroCrudo;
  const origen_gop =
    pdca_inicial.gopThemesData ||
    extendido["gop_themes_data"] ||
    extendido["gopThemes"] ||
    extendido["gop_themes"] ||
    extendido["temasGop"] ||
    extendido["temas_gop"] ||
    extendido["gopThemesSection"] ||
    extendido["gops"] ||
    extendido["gop"] ||
    extendido["temas"];

  const filas_crudas = Array.isArray(origen_gop)
    ? origen_gop
    : typeof origen_gop === "string"
      ? intentar_parsear_json<unknown[]>(origen_gop, [])
      : origen_gop && typeof origen_gop === "object"
        ? Object.values(origen_gop as RegistroCrudo)
        : [];

  return filas_crudas.map((fila_desconocida, indice) => {
    const fila = fila_desconocida as RegistroCrudo;
    return {
      id: fila["id"] || Date.now() + indice,
      tema: fila["tema"] || fila["nombre"] || fila["topic"] || fila["theme"] || "",
      meses: normalizar_arreglo_meses(
        fila["meses"] || fila["months"] || fila["mesesColumns"] || fila["meses_columns"],
        (valor) => Boolean(valor),
        false,
      ),
      mesesValues: normalizar_arreglo_meses(
        fila["mesesValues"] || fila["meses_values"] || fila["mesesValores"],
        (valor) => (valor !== undefined && valor !== null ? String(valor) : "100%"),
        "100%",
      ),
      mesesColors: normalizar_arreglo_meses(
        fila["mesesColors"] || fila["meses_colors"] || fila["mesesColores"],
        (valor) => (valor ? String(valor) : "red"),
        "red",
      ),
      fechaCompromiso:
        fila["fechaCompromiso"] || fila["fecha_compromiso"] || fila["fecha"] || fila["commitmentDate"] || fila["commitment_date"] || "",
      porcentajeAvance: String(fila["porcentajeAvance"] ?? fila["porcentaje_avance"] ?? fila["avance"] ?? ""),
      focusItems: String(fila["focusItems"] ?? fila["focus_items"] ?? fila["items"] ?? ""),
      focusType: fila["focusType"] || fila["focus_type"] || fila["tipo"] || "#",
      status: fila["status"] || fila["estado"] || fila["estatus"] || "",
    };
  });
}
