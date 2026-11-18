/**
 * Ensamblador de datos semilla PDCA destinado únicamente al servicio de seeding inicial en Firestore.
 */
import type { Pdca } from "../models/pdca";
import { SEED_PDCAS_PART_1 } from "./pdca_seed_part_1";
import { SEED_PDCAS_PART_2 } from "./pdca_seed_part_2";

/** Lista unificada de PDCAs de ejemplo usada exclusivamente en scripts/servicios de sembrado. */
export const SEED_PDCAS: Pdca[] = [...SEED_PDCAS_PART_1, ...SEED_PDCAS_PART_2];
