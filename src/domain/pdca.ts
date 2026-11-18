/**
 * Barrel público del dominio PDCA: tipos, catálogos de planta/fases, valores iniciales y semillas.
 */
export * from "./models/pdca";
export { PHASES, PHASE_STYLES } from "./constants/pdca_phases";
export {
  AREAS,
  OFFICIAL_PLANTAS,
  OFFICIAL_DEPARTAMENTOS,
  OFFICIAL_AREAS,
  OFFICIAL_ETAPAS,
  is_bloque_frio_area,
  does_area_belong_to_parent_or_match,
  type AreaOption,
} from "./constants/plant_catalog";
export {
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
} from "./defaults/pdca_defaults";
export { SEED_PDCAS as pdcas } from "./seeds/pdca_seed";
