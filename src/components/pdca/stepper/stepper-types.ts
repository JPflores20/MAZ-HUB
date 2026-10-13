/**
 * stepper-types.ts
 * Tipos TypeScript para las propiedades del componente stepper del PDCA.
 */
import type { Phase } from "@/data/pdca";

export interface CustomPhase {
  id: string;
  label: string;
  sub: string;
}
