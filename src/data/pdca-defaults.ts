/**
 * Constantes y valores por defecto del dominio PDCA.
 * Contiene: listas de fases, estilos de fase y valores DEFAULT_*
 * usados para inicializar formularios y documentos vacíos.
 */
import type { Phase, ParticipantesData, VpoCheckpointItem, ParetoItem } from "./pdca-types";

export const PHASES: Phase[] = ["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"];

/** @deprecated Usar PHASES. Mantenido por compatibilidad durante la migración. */
export const phases = PHASES;

export interface AreaOption {
  value: string;
  label: string;
  parentArea?: string;
}

export const OFFICIAL_PLANTAS = ["Zacatecas"] as const;

export const OFFICIAL_DEPARTAMENTOS = [
  "Elaboración",
  "S&E",
  "Tratamiento de Agua",
] as const;

export const OFFICIAL_AREAS = [
  "Cocimientos",
  "Cuartos Frios",
  "Mantenimiento",
] as const;

export const OFFICIAL_ETAPAS = [
  "Agua de Proceso",
  "Materiales Auxiliares",
  "CIP Cocimientos",
  "Materias Primas",
  "Ensilado",
  "Molienda",
  "Reclamo de malta",
  "Dislucion de Grits",
  "Cocedor",
  "Maceración",
  "Filtración de Mosto",
  "Ebullicion",
  "Lupulado de Mosto",
  "Evaporador",
  "Reposo de Mosto",
  "Enfriamiento de Mosto",
  "CIP Bloque Frio",
  "Fermentación",
  "Manejo de levadura",
  "CMF/Cerveza Recuperada",
  "Reposo",
  "Filtración de Cerveza",
  "Estabilizacion de Cerveza",
  "BBT",
  "Multiblender",
  "Servicios y Energia",
  "Procesos de Mantto",
] as const;

export const AREAS: AreaOption[] = [
  { value: "Cocimientos", label: "Cocimientos" },
  { value: "Cuartos Frios", label: "Cuartos Frios" },
  { value: "Mantenimiento", label: "Mantenimiento" },
];

function normalizeAreaKey(val?: string): string {
  return (val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Determina si un área corresponde a Bloque Frío / Cuartos Fríos (incluyendo Fermentación y Filtración).
 */
export function isBloqueFrioArea(area?: string): boolean {
  const norm = normalizeAreaKey(area);
  if (!norm) return false;
  return (
    norm.includes("frio") ||
    norm.includes("fermentacion") ||
    norm.includes("filtracion")
  );
}

/**
 * Determina si el área de un documento (PDCA o RDA) coincide o pertenece al área objetivo (usuario o filtro).
 * Considera que "Fermentación" y "Filtración" pertenecen a "Bloque Frío" / "Cuartos Frios".
 */
export function doesAreaBelongToParentOrMatch(
  docArea?: string,
  targetArea?: string,
): boolean {
  const docNorm = normalizeAreaKey(docArea);
  const targetNorm = normalizeAreaKey(targetArea);
  if (!docNorm || !targetNorm) return false;
  if (docNorm === targetNorm) return true;

  if (targetNorm.includes("bloque frio") || targetNorm.includes("cuartos frios")) {
    return isBloqueFrioArea(docArea);
  }

  return false;
}

export const PHASE_STYLES: Record<Phase, string> = {
  Resumen:
    "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  Plan: "bg-phase-plan/12 text-phase-plan border-phase-plan/30",
  Do: "bg-phase-do/25 text-brand-yellow-foreground border-phase-do/50",
  Check: "bg-phase-check/15 text-phase-check border-phase-check/35",
  Act: "bg-phase-act/15 text-phase-act border-phase-act/35",
  Evaluacion: "bg-primary/15 text-primary border-primary/35",
};

/** @deprecated Usar PHASE_STYLES. Mantenido por compatibilidad durante la migración. */
export const phaseStyles = PHASE_STYLES;

export const DEFAULT_PARTICIPANTES: ParticipantesData = {
  locales_nombres: "",
  locales_roles: "",
  externos_nombres: "",
  externos_roles: "",
  fecha_reunion_inicial: "",
  fecha_reunion_final: "",
  reunion_rutina: "",
};

export const DEFAULT_TARGET_VS_ACTUAL: {
  mes: string;
  target: number;
  actual: number | null;
}[] = [
  { mes: "Ene", target: 0, actual: null },
  { mes: "Feb", target: 0, actual: null },
  { mes: "Mar", target: 0, actual: null },
  { mes: "Abr", target: 0, actual: null },
  { mes: "May", target: 0, actual: null },
  { mes: "Jun", target: 0, actual: null },
  { mes: "Jul", target: 0, actual: null },
  { mes: "Ago", target: 0, actual: null },
  { mes: "Sep", target: 0, actual: null },
  { mes: "Oct", target: 0, actual: null },
  { mes: "Nov", target: 0, actual: null },
  { mes: "Dic", target: 0, actual: null },
];

export const DEFAULT_PARETO_DATA_MAP: Record<string, ParetoItem[]> = {
  root: [],
};

export const DEFAULT_VPO_CHECKPOINTS: VpoCheckpointItem[] = [
  {
    id: "vpo-1",
    pilar: "Mapeo de procesos",
    checkpoint:
      "¿Existe un mapa de procesos de nivel 4 (nivel de tareas) para el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-2",
    pilar: "Creación & ejecución de estándares",
    checkpoint:
      "¿Se han establecido los estándares operativos (SOP) para todas las tareas críticas de nivel 4 definidas en el mapa de procesos del proceso afectado? ¿Se han establecido y ejecutado los mantenimientos planificados de alta calidad con la frecuencia adecuada para todos los equipos afectados?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-3",
    pilar: "Creación & ejecución de estándares",
    checkpoint:
      "¿Se han realizado OWDs en los SOPs de tareas críticas relacionadas con el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-4",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿El producto/proceso afectado es monitoreado rutinariamente a través de checklists?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-5",
    pilar: "Gestión del conocimiento",
    checkpoint: "¿Has implementado las GOPs relacionadas con tu problema KPI/PI o Proceso?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-6",
    pilar: "5S",
    checkpoint:
      "¿Están las 5S totalmente integradas en el área del problema, y específicamente para las tareas de trabajo asociadas con el problema? ¿Se ha asignado el dueño de las 5S, se ha hecho un checklist diario y se han realizado auditorías mensualmente?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-7",
    pilar: "Indicadores de producto y proceso",
    checkpoint:
      "¿Existe un árbol de KPI para el problema KPI o KPI relacionado con el problema PI? ¿Es adecuado para mostrar todos los IP y SIC que impactan en el KPI?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-8",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Existe un Indicador de Producto/Proceso (PI) para monitorear rutinariamente el Producto/Proceso afectado? ¿Incluye el PI un plan de reacción a seguir si el PI alcanza el límite amarillo/rojo?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-9",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Se han utilizado los gráficos SIC para recopilar datos de todos los puntos de medición, y se han utilizado los datos para identificar/resolver la causa raíz del problema?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-10",
    pilar: "Solución de problemas",
    checkpoint:
      "¿Existen disparadores de 5-por qué y relatos de anomalías para tratar las desviaciones relacionadas con el producto/proceso afectado? ¿Se generan y completan los reportes de 5-por qué y relato de anomalías cuando se disparan los gatillos?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-11",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Se revisa rutinariamente el producto/proceso afectado en el MCRS de tu departamento?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-12",
    pilar: "Descripción del negocio",
    checkpoint:
      "¿Existe un Acuerdo de Nivel de Servicio definido y rastreado para el Producto/Proceso afectado? (Consulte la Descripción de Negocio y Matriz de Criticidad)",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-13",
    pilar: "Proceso de revisión del rendimiento",
    checkpoint: "¿Se ha generado un GaPA para el KPI afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-14",
    pilar: "Gestión del conocimiento",
    checkpoint:
      "¿Se ha utilizado el benchmarking interno/externo para identificar las mejores prácticas existentes en relación con el producto o proceso afectado?",
    evidencia: "",
    status: "",
  },
];
