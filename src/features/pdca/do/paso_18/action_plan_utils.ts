/**
 * @fileoverview Constantes y utilidades puras para cálculo de impacto y filas del Plan de Acción (Paso 18).
 */
import type { ActionItem } from "@/domain/pdca";

export const OPCIONES_ESTADO = ["Pendiente", "En progreso", "Retrasado", "Completada"] as const;
export const OPCIONES_SDCA = ["", "SDCA", "SOP", "OPL", "Lección de 1 Punto", "Otra"] as const;

export const COLOR_POR_ESTADO: Record<string, string> = {
  Pendiente: "bg-slate-100 text-slate-700 border-slate-300",
  "En progreso": "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  "En proceso": "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  Retrasado: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30",
  Completada: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
  Completa: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
  Completo: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
};

export const OPCIONES_PUNTAJE = [
  { value: "", label: "-" },
  { value: "5", label: "5 - Alto" },
  { value: "3", label: "3 - Medio" },
  { value: "1", label: "1 - Bajo" },
];

export const OPCIONES_PUNTAJE_COSTO = [
  { value: "", label: "-" },
  { value: "5", label: "5 - Menor costo" },
  { value: "3", label: "3 - Medio" },
  { value: "1", label: "1 - Mayor costo" },
];

export const ETIQUETAS_FACTORES = [
  "SEGURIDAD (S)",
  "CALIDAD (C)",
  "COSTO (C)",
  "MEDIO AMBIENTE (M)",
  "SERVICIO (S)",
];

export const CLAVES_FACTORES = [
  "seguridad",
  "calidadHigiene",
  "costo",
  "medioAmbiente",
  "servicio",
] as const;

/**
 * Convierte cualquier representación de puntaje de factor a número entero (5, 3, 1 ó 0).
 * @param valor_factor - Valor numérico o cadena con etiqueta.
 */
export const obtener_valor_factor = (valor_factor: unknown): number => {
  if (typeof valor_factor === "number") return valor_factor;
  if (typeof valor_factor === "string") {
    if (valor_factor.includes("5")) return 5;
    if (valor_factor.includes("3")) return 3;
    if (valor_factor.includes("1")) return 1;
  }
  return 0;
};

/**
 * Calcula el producto multiplicativo de los factores evaluados mayores que cero.
 * @param fila_accion - Fila del plan de acción a evaluar.
 */
export function calcular_producto_impacto(fila_accion: ActionItem): number {
  const valores_factores = CLAVES_FACTORES.map((clave_factor) =>
    obtener_valor_factor(fila_accion[clave_factor]),
  );
  const valores_positivos = valores_factores.filter((puntaje) => puntaje > 0);
  if (valores_positivos.length === 0) return 0;
  return valores_positivos.reduce((acumulador, puntaje) => acumulador * puntaje, 1);
}

/**
 * Devuelve texto y clases CSS codificadas por severidad según el producto de impacto.
 * @param fila_accion - Fila del plan de acción.
 */
export function obtener_visuales_impacto(fila_accion: ActionItem): {
  texto: string;
  color: string;
} {
  const producto_total = calcular_producto_impacto(fila_accion);
  if (producto_total === 0) {
    return { texto: "-", color: "bg-transparent text-muted-foreground border-border" };
  }
  if (producto_total <= 1) {
    return {
      texto: producto_total.toString(),
      color: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold",
    };
  }
  if (producto_total < 25) {
    return {
      texto: producto_total.toString(),
      color: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold",
    };
  }
  return {
    texto: producto_total.toString(),
    color: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold",
  };
}

/**
 * Devuelve las clases CSS de color para un selector desplegable de puntaje.
 * @param valor_puntaje - Valor actual del selector.
 */
export const obtener_color_dropdown = (valor_puntaje: unknown): string => {
  if (valor_puntaje === "" || valor_puntaje == null) {
    return "bg-transparent text-muted-foreground border-border";
  }
  const texto_puntaje = String(valor_puntaje);
  if (texto_puntaje.includes("5")) {
    return "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold";
  }
  if (texto_puntaje.includes("3")) {
    return "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold";
  }
  if (texto_puntaje.includes("1")) {
    return "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold";
  }
  return "bg-transparent text-muted-foreground";
};

/**
 * Crea una nueva fila vacía con valores iniciales seguros para el Plan de Acción.
 */
export function crear_fila_accion_vacia(): ActionItem {
  return {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    seguridad: "",
    calidadHigiene: "",
    costo: "",
    medioAmbiente: "",
    servicio: "",
    resultados: "",
    priorizar: "",
    quickWin: "",
    technologyRequired: "",
    tema: "",
    causaRaiz: "",
    accion: "",
    causaRaiz2: "",
    accion2: "",
    comentarios: "",
    responsable: "",
    fecha: "",
    status: "Pendiente",
    herramientaSdca: "",
  };
}
