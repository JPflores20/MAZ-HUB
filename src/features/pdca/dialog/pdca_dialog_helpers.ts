/**
 * @fileoverview Helpers puros para resolver permisos de edición, progreso metodológico y borrador inicial en PdcaDialog.
 */
import type { Pdca } from "@/domain/pdca";
import { ROLE_DEFAULT_PERMISSIONS } from "@/features/auth/user_service";
import type { UserPermissions, UserProfile } from "@/features/auth/auth_context";
import { can_user_edit_pdca } from "@/shared/components/access_request";
import { create_empty_pdca_draft } from "../utils/pdca_draft";
import { ALL_STEP_IDS } from "./pdca_step_constants";

/**
 * Determina el proyecto PDCA efectivo dando prioridad a borradores recuperados o inicializando autoría.
 */
export function resolver_pdca_efectivo(
  pdca_recibido: Pdca | null,
  pdca_restaurado: Pdca | null,
  usuario_autenticado: UserProfile | null,
): Pdca {
  if (pdca_restaurado) return pdca_restaurado;
  if (pdca_recibido) return pdca_recibido;

  const borrador = create_empty_pdca_draft();
  return usuario_autenticado
    ? {
        ...borrador,
        ownerUid: usuario_autenticado.uid,
        autor: usuario_autenticado.name,
        autorEmail: (usuario_autenticado.email || "").trim().toLowerCase(),
      }
    : borrador;
}

/**
 * Verifica si el usuario autenticado puede crear o editar el PDCA activo considerando fecha límite y permisos.
 */
export function verificar_permiso_edicion_pdca(
  usuario_autenticado: UserProfile | null,
  permisos: UserPermissions | null,
  pdca_actual: Pdca,
  es_borrador_nuevo: boolean,
  bloqueado_por_fecha: boolean,
): boolean {
  if (!usuario_autenticado || bloqueado_por_fecha) return false;
  const permisos_efectivos = permisos ?? ROLE_DEFAULT_PERMISSIONS[usuario_autenticado.role];
  const puede_crear =
    usuario_autenticado.role !== "viewer" &&
    usuario_autenticado.role !== "intern" &&
    Boolean(permisos_efectivos.canCreate);

  return es_borrador_nuevo
    ? puede_crear
    : can_user_edit_pdca(pdca_actual, usuario_autenticado, permisos ?? undefined);
}

/**
 * Calcula el porcentaje global de avance excluyendo los pasos marcados como No Aplica (N/A).
 */
export function calcular_progreso_pdca(
  pasos_completados: Set<string>,
  pasos_no_aplica: Set<string>,
): number {
  const pasos_validos = ALL_STEP_IDS.filter((paso_id) => !pasos_no_aplica.has(paso_id));
  if (pasos_validos.length === 0) return 0;
  const conteo_completado = pasos_validos.filter((paso_id) =>
    pasos_completados.has(paso_id),
  ).length;
  return Math.round((conteo_completado / pasos_validos.length) * 100);
}
