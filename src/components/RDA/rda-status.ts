import type { Rda } from "@/data/rda";

export const RDA_PHASE_STEP_IDS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  1: [],
  2: ["rda-step-1", "rda-step-2", "rda-step-3", "rda-step-4"],
  3: [
    "rda-step-5",
    "rda-step-6",
    "rda-step-7",
    "rda-step-8",
    "rda-step-9",
    "rda-step-11",
    "rda-step-12",
  ],
  4: ["rda-step-14"],
  5: ["rda-step-15"],
};

/**
 * Checks whether a specific phase of an RDA is complete / correct.
 * Phases:
 * 1. Resumen
 * 2. Descripción del Problema
 * 3. Análisis de Causas Raíz
 * 4. Evaluación de Calidad RDA
 * 5. Evaluación de Efectividad de RDA
 */
export const isRdaPhaseComplete = (rda: Rda, phaseNum: 1 | 2 | 3 | 4 | 5): boolean => {
  if (!rda) return false;
  const completedPhases = rda.completedPhases || [];
  const completedSteps = new Set([...(rda.completedSteps || []), ...(rda.naSteps || [])]);

  const phasePrefix = `${phaseNum}.`;
  if (completedPhases.some((p) => p.trim().startsWith(phasePrefix))) {
    return true;
  }

  const requiredSteps = RDA_PHASE_STEP_IDS[phaseNum];
  if (requiredSteps.length > 0 && requiredSteps.every((s) => completedSteps.has(s))) {
    return true;
  }

  return false;
};

/**
 * Calculates the RDA status according to business rules:
 * - "Evaluado": cuando esté la fase 4 y 5 completas
 * - "Cerrado": cuando esté correcta la fase 1, 2 y 3
 * - "Abierto": cuando está abierto (no cerrado ni evaluado)
 */
export const getRdaStatus = (
  rda: Rda,
  options?: { ignoreLegacyStatus?: boolean }
): "Abierto" | "Cerrado" | "Evaluado" => {
  if (!rda) return "Abierto";

  const p4 = isRdaPhaseComplete(rda, 4);
  const p5 = isRdaPhaseComplete(rda, 5);

  // Evaluado cuando esté la fase 4 y 5 completas
  if (p4 && p5) {
    return "Evaluado";
  }

  const p1 = isRdaPhaseComplete(rda, 1);
  const p2 = isRdaPhaseComplete(rda, 2);
  const p3 = isRdaPhaseComplete(rda, 3);

  // Cerrado cuando esté correcta la fase 1, 2 y 3
  if (p1 && p2 && p3) {
    return "Cerrado";
  }

  // Compatibilidad con registros anteriores que ya tenían estatus guardado sin fases marcadas
  const hasPhaseOrStepData =
    (rda.completedPhases && rda.completedPhases.length > 0) ||
    (rda.completedSteps && rda.completedSteps.length > 0) ||
    (rda.naSteps && rda.naSteps.length > 0);

  if (!options?.ignoreLegacyStatus && !hasPhaseOrStepData) {
    if (rda.status === "Evaluado") return "Evaluado";
    if (rda.status === "Cerrado") return "Cerrado";
  }

  // Abierto cuando está abierto
  return "Abierto";
};

