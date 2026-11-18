/**
 * Constructores de documentos base válidos (PDCA y RDA) para pruebas de seguridad sobre el emulador Firestore.
 * Garantizan el cumplimiento del esquema mínimo exigido por `firestore.rules`.
 */

/**
 * Construye un documento PDCA válido compatible con el esquema exigido por `firestore.rules`.
 * @param sobreescrituras - Campos opcionales a sobreescribir para pruebas específicas.
 * @returns Objeto completo listo para insertarse en la colección `/pdcas`.
 */
export function build_valid_pdca(sobreescrituras: Record<string, unknown> = {}) {
  return {
    id: "pdca-1",
    titulo: "Reducción de mermas en línea 3",
    area: "Cocimientos",
    fase: "Plan",
    progreso: 25,
    ownerUid: "user-coc",
    autor: "USER COCIMIENTOS",
    autorEmail: "user.coc@gmodelo.com.mx",
    asignados: [],
    assignedUids: [],
    assignedEmails: [],
    fechaFinalizacion: "2026-12-31",
    ...sobreescrituras,
  };
}

/**
 * Construye un documento RDA válido compatible con el esquema exigido por `firestore.rules`.
 * @param sobreescrituras - Campos opcionales a sobreescribir para pruebas específicas.
 * @returns Objeto completo listo para insertarse en la colección `/rdas`.
 */
export function build_valid_rda(sobreescrituras: Record<string, unknown> = {}) {
  return {
    id: "rda-1",
    title: "Desviación de presión en filtro",
    status: "Abierto",
    ownerUid: "user-coc",
    assignedUids: [],
    assignedEmails: [],
    context: { area: "Cocimientos", folio: "RDA-2026-001", responsable: "" },
    portada: {
      titulo: "Desviación de presión en filtro",
      area: "Cocimientos",
      autorOriginal: "USER COCIMIENTOS",
      autorEmail: "user.coc@gmodelo.com.mx",
      usuariosAsignados: [],
    },
    ...sobreescrituras,
  };
}
