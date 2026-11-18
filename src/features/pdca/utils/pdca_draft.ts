/**
 * @fileoverview Utilidades para construir borradores iniciales vacíos de proyectos PDCA.
 */
import { DEFAULT_VPO_CHECKPOINTS, type Pdca } from "@/domain/pdca";

/**
 * Genera una estructura base vacía para crear un nuevo proyecto PDCA.
 * @returns Objeto PDCA con valores por defecto listos para edición.
 */
export const create_empty_pdca_draft = (): Pdca => ({
  id: `PDCA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  titulo: "",
  planta: "Zacatecas",
  departamento: "Elaboración",
  area: "Cocimientos",
  etapa: "",
  fase: "Plan",
  actualizado: new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  progreso: 0,
  problema: "",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Indicador principal", antes: 0, despues: 0, unidad: "%" },
  serie: [
    { mes: "May", valor: 0 },
    { mes: "Jun", valor: 0 },
    { mes: "Jul", valor: 0 },
    { mes: "Ago", valor: 0 },
  ],
  vpoCheckpoints: DEFAULT_VPO_CHECKPOINTS.map((checkpoint_item) => ({
    ...checkpoint_item,
    status: "",
    evidencia: "",
  })),
  equipo: [],
});
