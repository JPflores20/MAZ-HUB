/**
 * @fileoverview Generadores de plantillas rápidas (anual 12 meses o semanal por mes) para series temporales.
 */
import type { ElementoSerieTemporal } from "./time_series_table";

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Construye una plantilla de serie de tiempo vacía según la opción elegida (`meses` o `sem-Mes`).
 */
export function generar_plantilla_serie(opcion_plantilla: string): ElementoSerieTemporal[] {
  if (opcion_plantilla === "meses") {
    return MESES_CORTOS.map((nombre_mes) => ({
      mes: nombre_mes,
      target: 0,
      actual: null,
    }));
  }
  if (opcion_plantilla.startsWith("sem-")) {
    const mes_prefijo = opcion_plantilla.split("-")[1] ?? "";
    return [1, 2, 3, 4, 5].map((numero_semana) => ({
      mes: `${mes_prefijo} Sem ${numero_semana}`,
      target: 0,
      actual: null,
    }));
  }
  return [];
}

/**
 * Listado de claves i18n para opciones semanales en el selector de plantillas.
 */
export const OPCIONES_PLANTILLAS_SEMANA = [
  { valor: "sem-Ene", clave_i18n: "pdcaPlan.dynamic.eneroSemanas" },
  { valor: "sem-Feb", clave_i18n: "pdcaPlan.dynamic.febreroSemanas" },
  { valor: "sem-Mar", clave_i18n: "pdcaPlan.dynamic.marzoSemanas" },
  { valor: "sem-Abr", clave_i18n: "pdcaPlan.dynamic.abrilSemanas" },
  { valor: "sem-May", clave_i18n: "pdcaPlan.dynamic.mayoSemanas" },
  { valor: "sem-Jun", clave_i18n: "pdcaPlan.dynamic.junioSemanas" },
  { valor: "sem-Jul", clave_i18n: "pdcaPlan.dynamic.julioSemanas" },
  { valor: "sem-Ago", clave_i18n: "pdcaPlan.dynamic.agostoSemanas" },
  { valor: "sem-Sep", clave_i18n: "pdcaPlan.dynamic.septiembreSemanas" },
  { valor: "sem-Oct", clave_i18n: "pdcaPlan.dynamic.octubreSemanas" },
  { valor: "sem-Nov", clave_i18n: "pdcaPlan.dynamic.noviembreSemanas" },
  { valor: "sem-Dic", clave_i18n: "pdcaPlan.dynamic.diciembreSemanas" },
] as const;
