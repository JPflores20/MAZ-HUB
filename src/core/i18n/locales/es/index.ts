/**
 * Ensamblador del diccionario completo de traducciones en español.
 */
import { TRADUCCIONES_NAVEGACION_ES } from "./navigation_and_common";
import { TRADUCCIONES_FASES_PDCA_ES } from "./pdca_phases_and_resumen";
import { TRADUCCIONES_RDA_BASE_ES } from "./rda_main";
import { TRADUCCIONES_RDA_INTERNO_ES } from "./rda_internal_extended";
import { TRADUCCIONES_PDCA_PLAN_BASE_ES } from "./pdca_plan_core";
import { TRADUCCIONES_PDCA_DINAMICO_1_ES } from "./pdca_plan_dynamic_part_1";
import { TRADUCCIONES_PDCA_DINAMICO_2_ES } from "./pdca_plan_dynamic_part_2";
import { TRADUCCIONES_TABLAS_PDCA_ES } from "./pdca_tables";

const { rdaInternalPart1: rda_interno_parte_1, ...resto_rda_es } = TRADUCCIONES_RDA_BASE_ES;

/** Objeto de traducción completo para i18next (es). */
export const TRADUCCION_ES = {
  ...TRADUCCIONES_NAVEGACION_ES,
  ...TRADUCCIONES_FASES_PDCA_ES,
  ...resto_rda_es,
  rdaInternal: {
    ...rda_interno_parte_1,
    ...TRADUCCIONES_RDA_INTERNO_ES,
  },
  pdcaPlan: {
    ...TRADUCCIONES_PDCA_PLAN_BASE_ES,
    dynamic: {
      ...TRADUCCIONES_PDCA_DINAMICO_1_ES,
      ...TRADUCCIONES_PDCA_DINAMICO_2_ES,
    },
  },
  pdcaTables: TRADUCCIONES_TABLAS_PDCA_ES,
};
