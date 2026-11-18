/**
 * Ensamblador del diccionario completo de traducciones en inglés.
 */
import { TRADUCCIONES_NAVEGACION_EN } from "./navigation_and_common";
import { TRADUCCIONES_FASES_PDCA_EN } from "./pdca_phases_and_resumen";
import { TRADUCCIONES_RDA_BASE_EN } from "./rda_main";
import { TRADUCCIONES_RDA_INTERNO_EN } from "./rda_internal_extended";
import { TRADUCCIONES_PDCA_PLAN_BASE_EN } from "./pdca_plan_core";
import { TRADUCCIONES_PDCA_DINAMICO_1_EN } from "./pdca_plan_dynamic_part_1";
import { TRADUCCIONES_PDCA_DINAMICO_2_EN } from "./pdca_plan_dynamic_part_2";
import { TRADUCCIONES_TABLAS_PDCA_EN } from "./pdca_tables";

const { rdaInternalPart1: rda_interno_parte_1, ...resto_rda_en } = TRADUCCIONES_RDA_BASE_EN;

/** Objeto de traducción completo para i18next (en). */
export const TRADUCCION_EN = {
  ...TRADUCCIONES_NAVEGACION_EN,
  ...TRADUCCIONES_FASES_PDCA_EN,
  ...resto_rda_en,
  rdaInternal: {
    ...rda_interno_parte_1,
    ...TRADUCCIONES_RDA_INTERNO_EN,
  },
  pdcaPlan: {
    ...TRADUCCIONES_PDCA_PLAN_BASE_EN,
    dynamic: {
      ...TRADUCCIONES_PDCA_DINAMICO_1_EN,
      ...TRADUCCIONES_PDCA_DINAMICO_2_EN,
    },
  },
  pdcaTables: TRADUCCIONES_TABLAS_PDCA_EN,
};
