/**
 * Constantes y funciones auxiliares para la Tabla del Plan de Acción (Paso 18).
 */
import type { ActionItem } from "@/data/pdca";

export const OPCIONES_ESTADO = ["Pendiente", "En progreso", "Retrasado", "Completada"] as const;
export const OPCIONES_SDCA = ["", "SDCA", "SOP", "OPL", "Lección de 1 Punto", "Otra"] as const;

export const COLOR_POR_ESTADO: Record<string, string> = {
  Pendiente: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  "En progreso": "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/30",
  Retrasado: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30",
  Completada: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
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

/** Convierte cualquier representación de valor de factor numérico a número */
export const obtenerValorFactor = (valor: unknown): number => {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    if (valor.includes("5")) return 5;
    if (valor.includes("3")) return 3;
    if (valor.includes("1")) return 1;
  }
  return 0;
};

/** Calcula el producto de todos los factores de una fila */
export function calcularProductoImpacto(fila: ActionItem): number {
  const valores = CLAVES_FACTORES.map((k) => obtenerValorFactor(fila[k]));
  const valoresPositivos = valores.filter((n) => n > 0);
  if (valoresPositivos.length === 0) return 0;
  return valoresPositivos.reduce((acc, val) => acc * val, 1);
}

/** Devuelve texto y clase CSS de color para el resultado de impacto de una fila */
export function obtenerVisualesImpacto(fila: ActionItem): { texto: string; color: string } {
  const producto = calcularProductoImpacto(fila);
  if (producto === 0)
    return { texto: "-", color: "bg-transparent text-muted-foreground border-border" };
  if (producto <= 1)
    return {
      texto: producto.toString(),
      color: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold",
    };
  if (producto < 25)
    return {
      texto: producto.toString(),
      color: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold",
    };
  return {
    texto: producto.toString(),
    color: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold",
  };
}

/** Devuelve clases CSS de color para un dropdown de puntaje de factor */
export const obtenerColorDropdown = (valor: unknown): string => {
  if (valor === "" || valor == null) return "bg-transparent text-muted-foreground border-border";
  if (String(valor).includes("5"))
    return "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold";
  if (String(valor).includes("3"))
    return "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold";
  if (String(valor).includes("1"))
    return "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold";
  return "bg-transparent text-muted-foreground";
};

/** Crea una nueva fila vacía del plan de acción */
export function crearFilaAccionVacia(): ActionItem {
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
