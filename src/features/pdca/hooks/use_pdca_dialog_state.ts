/**
 * @fileoverview Hook central que unifica todo el estado editable del diálogo PDCA y sus subfases.
 */
import type { Pdca } from "@/domain/pdca";
import { use_estado_pdca_general } from "./use_estado_pdca_general";
import { use_estado_pdca_plan_graficas } from "./use_estado_pdca_plan_graficas";
import { use_estado_pdca_herramientas } from "./use_estado_pdca_herramientas";
import { use_estado_pdca_resultados } from "./use_estado_pdca_resultados";
import { mapear_estado_general_y_plan } from "./pdca_state_map_general_plan";
import { mapear_estado_herramientas_y_resultados } from "./pdca_state_map_tools_results";

/**
 * Inicializa y expone un objeto de estado unificado para todas las fases y herramientas del PDCA.
 */
export const use_pdca_dialog_state = (
  initial_pdca: Pdca,
  current_user: { name?: string; email?: string } | null,
) => {
  const general = use_estado_pdca_general(initial_pdca, current_user);
  const graficas = use_estado_pdca_plan_graficas(initial_pdca);
  const herramientas = use_estado_pdca_herramientas(initial_pdca);
  const resultados = use_estado_pdca_resultados(initial_pdca);

  return {
    ...mapear_estado_general_y_plan(general, graficas),
    ...mapear_estado_herramientas_y_resultados(herramientas, resultados),
    id: initial_pdca.id,
    document_identifier: initial_pdca.id,
  };
};

export type EstadoDialogoPdca = ReturnType<typeof use_pdca_dialog_state>;
