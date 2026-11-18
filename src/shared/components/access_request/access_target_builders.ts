/**
 * @fileoverview Builders transforming PDCA and RDA records into normalized access-request metadata.
 */

import type { Pdca } from "@/domain/pdca";
import type { Rda } from "@/domain/models/rda";
import { get_rda_display_name } from "@/features/rda";
import { extract_rda_responsible_names } from "./access_identity_helpers";

/** Descriptor passed to AccessRequestDialog representing a restricted PDCA or RDA record. */
export interface AccessRequestTarget {
  module: "PDCA" | "RDA";
  id: string;
  folioOrCode: string;
  title: string;
  area?: string | undefined;
  creatorName?: string | undefined;
  creatorEmail?: string | undefined;
  responsibles: { name: string; email?: string | undefined }[];
}

/**
 * Converts a PDCA record into an AccessRequestTarget payload for the permission modal.
 *
 * @param {Pdca} pdca_record - PDCA project blocked from current viewer.
 * @returns {AccessRequestTarget} Normalized target metadata for access-request delivery.
 */
export function build_pdca_access_target(pdca_record: Pdca): AccessRequestTarget {
  return {
    module: "PDCA",
    id: pdca_record.id,
    folioOrCode: pdca_record.id,
    title: pdca_record.titulo || `PDCA ${pdca_record.id}`,
    area: pdca_record.area,
    creatorName: pdca_record.autor,
    creatorEmail: pdca_record.autorEmail,
    responsibles: (pdca_record.asignados || []).map((assignee_entry) => ({
      name: assignee_entry.name,
      email: assignee_entry.email,
    })),
  };
}

/**
 * Converts an RDA record into an AccessRequestTarget payload for the permission modal.
 *
 * @param {Rda} rda_record - RDA report blocked from current viewer.
 * @returns {AccessRequestTarget} Normalized target metadata for access-request delivery.
 */
export function build_rda_access_target(rda_record: Rda): AccessRequestTarget {
  const responsible_names = extract_rda_responsible_names(rda_record);
  return {
    module: "RDA",
    id: rda_record.id,
    folioOrCode: rda_record.context?.folio || `RDA-${rda_record.id.slice(-5)}`,
    title: get_rda_display_name(rda_record, "Reporte RDA"),
    area: rda_record.context?.area || rda_record.portada?.area || rda_record.context?.planta,
    creatorName: rda_record.portada?.autorOriginal || rda_record.context?.iniciadoPor,
    creatorEmail: rda_record.portada?.autorEmail,
    responsibles: responsible_names.map((responsible_name) => ({ name: responsible_name })),
  };
}
