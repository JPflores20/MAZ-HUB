/**
 * Políticas de autorización en servidor para aprobar o rechazar solicitudes de acceso sobre PDCA y RDA.
 * Evita repetición de reglas RBAC unificando la evaluación de propietario, asignados y líderes de área.
 */
import { normalize_area, normalize_email } from "./domain_and_strings";
import { WRITE_CONTENT_ROLES, type UserRole } from "./roles_and_permissions";

export interface AccessGrantEvaluationParams {
  callerUid: string;
  callerEmail: string;
  callerRole: UserRole;
  callerArea: string;
  callerApproved: boolean;
  module: "PDCA" | "RDA";
  targetData: Record<string, unknown>;
}

/**
 * Evalúa coincidencias comunes de propiedad, asignación o liderazgo de área entre PDCA y RDA.
 * @param parametros - Parámetros del solicitante y campos extraídos del documento objetivo.
 * @param area_documento - Área operativa registrada en el PDCA o RDA.
 * @param correo_autor - Correo del autor original del documento.
 * @returns `true` cuando el solicitante posee autoridad sobre el documento.
 */
function has_shared_grant_authority(
  parametros: AccessGrantEvaluationParams,
  area_documento: string,
  correo_autor: string,
): boolean {
  const correo_solicitante = normalize_email(parametros.callerEmail);
  const area_solicitante = normalize_area(parametros.callerArea);

  if (
    parametros.callerRole === "area_lead" &&
    area_solicitante &&
    area_documento &&
    area_documento === area_solicitante
  ) {
    return true;
  }

  if (parametros.targetData["ownerUid"] === parametros.callerUid) {
    return true;
  }

  if (correo_solicitante && correo_autor === correo_solicitante) {
    return true;
  }

  const uids_asignados = Array.isArray(parametros.targetData["assignedUids"])
    ? (parametros.targetData["assignedUids"] as unknown[])
    : [];
  if (uids_asignados.includes(parametros.callerUid)) {
    return true;
  }

  const correos_asignados = Array.isArray(parametros.targetData["assignedEmails"])
    ? (parametros.targetData["assignedEmails"] as unknown[]).map(normalize_email)
    : [];
  return Boolean(correo_solicitante && correos_asignados.includes(correo_solicitante));
}

/**
 * Determina si un usuario aprobado tiene autoridad en servidor para otorgar o rechazar acceso
 * a una solicitud entrante sobre un PDCA o RDA.
 * @param parametros - Contexto del usuario aprobador verificado y datos del documento destino.
 * @returns `true` si el aprobador es admin, propietario, colaborador asignado o líder de esa área.
 */
export function can_authorize_access_grant(parametros: AccessGrantEvaluationParams): boolean {
  if (!parametros.callerApproved || !WRITE_CONTENT_ROLES.has(parametros.callerRole)) {
    return false;
  }
  if (parametros.callerRole === "admin") {
    return true;
  }

  if (parametros.module === "PDCA") {
    const area_pdca = normalize_area(parametros.targetData["area"]);
    const autor_pdca = normalize_email(parametros.targetData["autorEmail"]);
    if (has_shared_grant_authority(parametros, area_pdca, autor_pdca)) {
      return true;
    }

    const correo_solicitante = normalize_email(parametros.callerEmail);
    const asignados_pdca = Array.isArray(parametros.targetData["asignados"])
      ? (parametros.targetData["asignados"] as Record<string, unknown>[])
      : [];
    return asignados_pdca.some(
      (registro_asignado) =>
        correo_solicitante && normalize_email(registro_asignado?.["email"]) === correo_solicitante,
    );
  }

  const portada_rda =
    (parametros.targetData["portada"] as Record<string, unknown> | undefined) ?? {};
  const contexto_rda =
    (parametros.targetData["context"] as Record<string, unknown> | undefined) ?? {};
  const area_rda = normalize_area(contexto_rda["area"] || portada_rda["area"]);
  const autor_rda = normalize_email(portada_rda["autorEmail"]);

  return has_shared_grant_authority(parametros, area_rda, autor_rda);
}
