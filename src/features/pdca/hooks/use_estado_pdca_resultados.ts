/**
 * @fileoverview Hook unificado de resultados, verificación (CHECK), estandarización (ACT) y evaluación R2D2.
 */
import type { Pdca } from "@/domain/pdca";
import { use_estado_pdca_resultados_check } from "./use_estado_pdca_resultados_check";
import { use_estado_pdca_resultados_act } from "./use_estado_pdca_resultados_act";

/**
 * Combina el estado de verificación posterior y estandarización final del PDCA.
 */
export const use_estado_pdca_resultados = (pdca_inicial: Pdca) => ({
  ...use_estado_pdca_resultados_check(pdca_inicial),
  ...use_estado_pdca_resultados_act(pdca_inicial),
});
