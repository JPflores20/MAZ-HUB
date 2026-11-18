/**
 * Script idempotente de sembrado para insertar el ejemplo histórico `RDA_2026_19` en Firestore si está ausente.
 */
import { create_rda } from "@/shared/services/rda/rda_firestore_mutations";
import type { Rda } from "../models/rda";
import { RDA_SEED_19_BASE } from "./rda_seed_19_core";
import {
  RDA_SEED_19_CHECKLIST,
  RDA_SEED_19_VALIDATION_ACTIONS,
} from "./rda_seed_19_validations";

const RDA_SEMILLA_19: Rda = {
  ...RDA_SEED_19_BASE,
  validationActions: RDA_SEED_19_VALIDATION_ACTIONS,
  checklistEstandarizacion: RDA_SEED_19_CHECKLIST,
};

let semilla_19_inyectada = false;

/**
 * Inyecta el reporte semilla `RDA_2026_19` una única vez cuando la colección cargada no lo contiene.
 * @param lista_rdas - Lista actual de reportes RDA cargados en memoria.
 */
export function seed_rda_19(lista_rdas: Rda[]): void {
  if (semilla_19_inyectada) return;
  if (
    lista_rdas.length > 0 &&
    !lista_rdas.find((reporte_actual) => reporte_actual.id === "RDA_2026_19")
  ) {
    semilla_19_inyectada = true;
    create_rda(RDA_SEMILLA_19)
      .then(() => {
        console.log("RDA 19 Injected");
      })
      .catch((error_inyeccion) => console.error("Error injecting", error_inyeccion));
  }
}
