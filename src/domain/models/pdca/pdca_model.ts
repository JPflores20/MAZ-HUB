/**
 * Composición del tipo principal `Pdca` unificando propiedades base y campos extendidos.
 */
import type { PdcaCoreFields } from "./pdca_core_model";
import type { PdcaExtendedFields } from "./pdca_extended_fields";

/** Representa el documento completo de un proyecto de mejora PDCA. */
export type Pdca = PdcaCoreFields & PdcaExtendedFields;
