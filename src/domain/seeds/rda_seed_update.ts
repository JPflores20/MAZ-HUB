/**
 * Script idempotente para actualizar y normalizar el caso semilla `RDA_2026_19` en Firestore.
 */
import { create_rda } from "@/shared/services/rda/rda_firestore_mutations";
import type { Rda } from "../models/rda";
import { RDA_SEED_19_CHECKLIST } from "./rda_seed_19_validations";
import { RDA_SEED_UPDATE_BASE } from "./rda_seed_update_core";
import { RDA_SEED_UPDATE_VALIDATION_ACTIONS } from "./rda_seed_update_validations";

const RDA_SEMILLA_ACTUALIZADA: Rda = {
  ...RDA_SEED_UPDATE_BASE,
  validationActions: RDA_SEED_UPDATE_VALIDATION_ACTIONS,
  checklistEstandarizacion: RDA_SEED_19_CHECKLIST,
  pda: [],
};

let actualizacion_inyectada = false;

/**
 * Ejecuta una única vez la actualización del reporte `RDA_2026_19` en Firestore.
 */
export function seed_rda_update(): void {
  if (actualizacion_inyectada) return;
  actualizacion_inyectada = true;
  create_rda(RDA_SEMILLA_ACTUALIZADA)
    .then(() => {
      console.log("RDA 19 Updated");
    })
    .catch((error_actualizacion) => console.error("Error injecting", error_actualizacion));
}
