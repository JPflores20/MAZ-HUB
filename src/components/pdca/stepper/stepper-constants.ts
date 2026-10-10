import type { Phase } from "@/data/pdca";
import type { CustomPhase } from "./stepper-types";

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
  Check: ["step-21", "step-22", "step-23", "step-24"],
  Act: ["step-25", "step-26", "step-27", "step-28", "step-29", "step-30"],
};

export const getCustomPhases = (isAdmin: boolean, t: any = (k:string,d?:string)=>d): CustomPhase[] => {
  const base: CustomPhase[] = [
    { id: "Resumen", label: t("pdcaGlobal.resumen", "RESUMEN"), sub: "" },
    { id: "Plan", label: t("pdcaGlobal.plan", "1. PLAN"), sub: "" },
    { id: "Do", label: t("pdcaGlobal.do", "2. DO"), sub: "" },
    { id: "Check", label: t("pdcaGlobal.check", "3. CHECK"), sub: "" },
    { id: "Act", label: t("pdcaGlobal.act", "4. ACT"), sub: "" },
  ];

  if (isAdmin) {
    return [...base, { id: "Evaluacion", label: t("pdcaGlobal.evaluacionR2D2", "EVALUACI�N R2D2"), sub: t("pdcaGlobal.soloAdmins", "Solo Administradores") }];
  }
  return base;
};

export const isPhaseStepsCompleted = (
  phaseId: string,
  completedSteps: Set<string>,
  naSteps?: Set<string>,
) => {
  const steps = PHASE_STEPS_MAP[phaseId as Phase] || [];
  return (
    steps.length > 0 && steps.every((s) => completedSteps.has(s) || (naSteps && naSteps.has(s)))
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
