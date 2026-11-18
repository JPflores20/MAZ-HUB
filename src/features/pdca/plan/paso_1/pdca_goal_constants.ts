/**
 * @fileoverview Valores por defecto para la tabla de Definición de Meta (Paso 1) del PDCA.
 */
import type { DefinicionMeta } from "@/domain/pdca";

export const DEFAULT_DEFINICION_META: DefinicionMeta = {
  kpi: "PÉRDIDA DE EXTRACTO",
  pis: "Extracción de levadura en reposo y extracción de levadura en fermentación",
  metodoCalculo: "HANNA",
  desdeValor: "2,58",
  aValor: "2,35",
  hastaFecha: "2026-02-15",
  unidadMedida: "%",
  benchmark: "",
  mejora: "lower",
  responsable: "",
  facilitadorLider: "Jaime Lagunas",
};
