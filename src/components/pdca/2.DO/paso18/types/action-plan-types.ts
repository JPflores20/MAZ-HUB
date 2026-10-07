import type { ActionItem } from "@/data/pdca";

// ─── Re-export central type ────────────────────────────────────────────────
export type { ActionItem };

// ─── Props del componente principal ───────────────────────────────────────
export interface ActionPlanTableProps {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

// ─── Opciones de selección ─────────────────────────────────────────────────
export const STATUS_OPTIONS = ["Pendiente", "En progreso", "Retrasado", "Completada"] as const;
export const SDCA_OPTIONS = ["", "SDCA", "SOP", "OPL", "Lección de 1 Punto", "Otra"] as const;

export const SCORE_OPTIONS = [
  { value: "", label: "-" },
  { value: "5", label: "5 - Alto" },
  { value: "3", label: "3 - Medio" },
  { value: "1", label: "1 - Bajo" },
];

// ─── Factores de impacto ───────────────────────────────────────────────────
export const DEFAULT_FACTOR_LABELS = [
  "SEGURIDAD (S)",
  "CALIDAD (C)",
  "COSTO (C)",
  "MEDIO AMBIENTE (M)",
  "SERVICIO (S)",
];

export const FACTOR_KEYS = [
  "seguridad",
  "calidadHigiene",
  "costo",
  "medioAmbiente",
  "servicio",
] as const;

export type FactorKey = (typeof FACTOR_KEYS)[number];

// ─── Colores por estado ────────────────────────────────────────────────────
export const STATUS_COLOR: Record<string, string> = {
  Pendiente: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  "En progreso": "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/30",
  Retrasado: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30",
  Completada: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
};

// ─── Columnas de la sección final de la tabla ──────────────────────────────
export const COLUMNAS_FINALES = [
  { label: "COMENTARIOS", w: "min-w-[180px]" },
  { label: "RESPONSABLE", w: "min-w-[140px]" },
  { label: "FECHA", w: "min-w-[110px]" },
  { label: "ESTADO", w: "min-w-[110px]" },
  { label: "SDCA", w: "min-w-[100px]" },
] as const;
