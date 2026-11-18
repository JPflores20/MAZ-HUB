/**
 * @fileoverview Constantes de configuración, mapeo de pasos y estilos de pilar del stepper PDCA.
 */
import type { TFunction } from "i18next";
import type { Phase } from "@/domain/pdca";
import type { CustomPhase } from "./stepper_types";

export const PHASE_STEPS_MAP: Record<string, string[]> = {
  Plan: [
    "step-1",
    "step-2",
    "step-3",
    "step-4",
    "step-5",
    "step-6",
    "step-12",
    "step-7",
    "step-8",
    "step-9",
    "step-10",
    "step-11",
    "step-13",
    "step-gops",
    "step-14",
    "step-15",
    "step-16",
    "step-17",
  ],
  Do: ["step-18", "step-19", "step-20"],
  Check: ["step-22", "step-23", "step-24", "step-25", "step-26", "step-27"],
  Act: ["step-28", "step-29", "step-30", "step-31", "step-32", "step-33", "step-34"],
};

/**
 * Construye la lista de pestañas de navegación PDCA visibles según rol administrativo.
 * @param es_admin - Indica si el usuario puede acceder a la pestaña de evaluación R2D2.
 * @param translate - Función de localización i18n.
 */
export const obtener_fases_personalizadas = (
  es_admin: boolean,
  translate?: TFunction,
): CustomPhase[] => {
  const traducir = (clave: string, respaldo: string) =>
    translate ? translate(clave, respaldo) : respaldo;
  const fases_base: CustomPhase[] = [
    { id: "Resumen", label: traducir("pdcaGlobal.resumen", "RESUMEN"), sub: "" },
    { id: "Plan", label: traducir("pdcaGlobal.plan", "1. PLAN"), sub: "" },
    { id: "Do", label: traducir("pdcaGlobal.do", "2. DO"), sub: "" },
    { id: "Check", label: traducir("pdcaGlobal.check", "3. CHECK"), sub: "" },
    { id: "Act", label: traducir("pdcaGlobal.act", "4. ACT"), sub: "" },
  ];

  if (es_admin) {
    return [
      ...fases_base,
      {
        id: "Evaluacion",
        label: traducir("pdcaGlobal.evaluacionR2D2", "EVALUACIÓN R2D2"),
        sub: traducir("pdcaGlobal.soloAdmins", "Solo Administradores"),
      },
    ];
  }
  return fases_base;
};

/**
 * Determina si todos los pasos de una fase fueron completados o marcados como N/A.
 */
export const esta_fase_completada = (
  fase_id: string,
  pasos_completados: Set<string>,
  pasos_no_aplica?: Set<string>,
): boolean => {
  const pasos_fase = PHASE_STEPS_MAP[fase_id as Phase] || [];
  return (
    pasos_fase.length > 0 &&
    pasos_fase.every(
      (paso_id) => pasos_completados.has(paso_id) || Boolean(pasos_no_aplica?.has(paso_id)),
    )
  );
};

export const PILAR_STYLE_MAP: Record<string, { bg: string; text: string; border: string }> = {
  "Mapeo de procesos": {
    bg: "bg-blue-500/15 dark:bg-blue-500/25",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/40",
  },
  "Creación & ejecución de estándares": {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/40",
  },
  "Proceso de revisión de rutina": {
    bg: "bg-cyan-500/15 dark:bg-cyan-500/25",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/40",
  },
  "Gestión del conocimiento": {
    bg: "bg-purple-500/15 dark:bg-purple-500/25",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/40",
  },
  "5S": {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/40",
  },
  "Indicadores de producto y proceso": {
    bg: "bg-amber-500/15 dark:bg-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/40",
  },
  "Solución de problemas": {
    bg: "bg-rose-500/15 dark:bg-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/40",
  },
  "Descripción del negocio": {
    bg: "bg-teal-500/15 dark:bg-teal-500/25",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/40",
  },
  "Proceso de revisión del rendimiento": {
    bg: "bg-violet-500/15 dark:bg-violet-500/25",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/40",
  },
};
