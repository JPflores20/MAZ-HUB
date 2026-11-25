/**
 * @fileoverview Approval, activation-link dispatch, and temporary-intern duration mutation helpers.
 */

import { toast } from "sonner";
import type { UserProfile } from "@/features/auth/auth_context";
import {
  get_auth_error_info,
  is_corporate_email,
  is_temporary_intern_account,
} from "@/features/auth/email_validation";
import { user_service } from "@/features/auth/user_service";

/** Approves and marks a corporate account email-verified directly on the server without sending mail. */
export async function execute_approve_user(
  user_profile: UserProfile,
  approve_fn: (uid: string) => Promise<void>,
): Promise<boolean> {
  if (!is_corporate_email(user_profile.email)) {
    toast.error(
      `No se puede aprobar a ${user_profile.email}: solo se permiten correos @ab-inbev.com o @gmodelo.com.mx.`,
    );
    return false;
  }
  try {
    await approve_fn(user_profile.uid);
    toast.success(
      `${user_profile.name} (${user_profile.email}) fue aprobado y verificado sin enviar correo.`,
    );
    return true;
  } catch (caught_error: unknown) {
    console.error("Error al aprobar usuario:", caught_error);
    toast.error(
      get_auth_error_info(caught_error).message || "No se pudo aprobar la cuenta en el servidor.",
    );
    return false;
  }
}

/** Bulk-approves all pending corporate accounts directly on the server without sending mail. */
export async function execute_bulk_approve_users(
  pending_users: UserProfile[],
  approve_fn: (uid: string) => Promise<void>,
): Promise<string[]> {
  if (pending_users.length === 0) return [];
  const settlement_results = await Promise.allSettled(
    pending_users.map(async (user_entry) => {
      await approve_fn(user_entry.uid);
      return user_entry.uid;
    }),
  );

  const approved_uids: string[] = [];
  let failed_count = 0;
  for (const settled_item of settlement_results) {
    if (settled_item.status === "fulfilled") {
      approved_uids.push(settled_item.value);
    } else {
      failed_count += 1;
      console.error("Error en aprobación masiva de usuario:", settled_item.reason);
    }
  }

  if (approved_uids.length > 0 && failed_count === 0) {
    toast.success(
      `${approved_uids.length} cuenta(s) corporativa(s) aprobada(s) y verificada(s) sin enviar correo.`,
    );
  } else if (approved_uids.length > 0) {
    toast.warning(
      `Se aprobaron ${approved_uids.length} cuenta(s), pero ${failed_count} fallaron (revisa si existen en Auth).`,
    );
  } else {
    toast.error("No se pudo aprobar ninguna cuenta corporativa pendiente.");
  }
  return approved_uids;
}

/** Sends a password-reset activation email link for a corporate collaborator or temporary intern account. */
export async function execute_send_verification_link(
  user_profile: UserProfile,
  send_link_fn: (target: {
    uid?: string;
    email: string;
    temporaryAccount?: boolean;
  }) => Promise<unknown>,
): Promise<void> {
  if (!user_profile.email) {
    toast.error("Este usuario no tiene un correo electrónico válido.");
    return;
  }
  const is_temp_intern = is_temporary_intern_account(user_profile);
  try {
    await send_link_fn({
      uid: user_profile.uid,
      email: user_profile.email,
      ...(is_temp_intern ? { temporaryAccount: true } : {}),
    });
    toast.success(
      `Se envió a ${user_profile.email} un enlace seguro de Firebase para restablecer contraseña y activar su acceso.`,
      { duration: 6000 },
    );
  } catch (caught_error: unknown) {
    console.error("Error al reenviar enlace:", caught_error);
    const { code, message } = get_auth_error_info(caught_error);
    toast.warning(
      code === "auth/too-many-requests"
        ? "Firebase envió un enlace recientemente a este correo. Espera unos minutos antes de reenviar otro."
        : message || "No se pudo enviar el enlace al correo del usuario.",
    );
  }
}

/** Updates active duration in days for a temporary intern account via Cloud Function. */
export async function execute_extend_intern_days(
  user_profile: UserProfile,
  active_days: number,
): Promise<boolean> {
  try {
    await user_service.admin_update_user_access({
      uid: user_profile.uid,
      activeDays: active_days,
    });
    toast.success(`Vigencia de ${user_profile.name} actualizada a ${active_days} día(s).`);
    return true;
  } catch (caught_error: unknown) {
    console.error("Error al actualizar vigencia del becario:", caught_error);
    toast.error(
      get_auth_error_info(caught_error).message || "No se pudo actualizar la vigencia temporal.",
    );
    return false;
  }
}
