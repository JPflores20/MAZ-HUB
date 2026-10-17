/**
 * plan-subfase-analisis.tsx
 * Wrapper de compatibilidad que delega en Subphase2 (`./components/subphase_2`)
 * para evitar duplicidad de código entre la Subfase 1.2 (Pasos 8-18).
 */
import React from "react";
import { Subphase2 } from "./components/subphase_2";
import type { PhasePlanProps } from "./components/phase_plan_types";

export type PropiedadesSubfaseAnalisis = Partial<PhasePlanProps> &
  Pick<PhasePlanProps, "completed_steps" | "on_toggle_step" | "is_admin_user">;

/** Subfase 2: Análisis (Pasos 8-18) */
export function SubfaseAnalisis(props: PropiedadesSubfaseAnalisis) {
  return <Subphase2 {...(props as PhasePlanProps)} />;
}
