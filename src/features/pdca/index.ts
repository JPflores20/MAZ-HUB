/**
 * @fileoverview Barrel público de la feature PDCA para consumo desde Dashboard, RDA y servicios compartidos.
 */
export { PdcaDialog } from "./dialog/pdca_dialog";
export { ALL_STEP_IDS, TOTAL_STEPS } from "./dialog/pdca_step_constants";
export { PhaseBadge } from "./components/pdca_badge";
export {
  MultiImageUploadSection,
  subir_archivo_a_firebase,
} from "./image_upload";
export { ProblemTimelineSection } from "./plan/paso_1/problem_timeline_section";
export { ParetoInteractive } from "./plan/paso_10_pareto/pareto_interactive";
export { FlavorCorrelationSection } from "./plan/paso_11_flavor_correlation/flavor_correlation_section";
export { IshikawaInteractivo } from "./plan/paso_16_ishikawa/ishikawa_interactive";
export { ActionPlanTable } from "./do/paso_18/action_plan_table";
export { crear_fila_accion_vacia } from "./do/paso_18/action_plan_utils";
export { EvidenciasSolucionStep } from "./do/paso_19/evidencias_solucion_step";
