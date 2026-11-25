/**
 * Helpers compartidos en servidor para reconciliar perfiles corporativos y becarios temporales
 * y calcular Custom Claims consistentes entre triggers de identidad y Cloud Functions invocables.
 */
import { firestore_db } from "../core/firebase_admin";
import {
  clamp_string,
  is_corporate_email,
  is_profile_expired,
  is_temporary_intern_profile,
  normalize_email,
} from "../security/domain_and_strings";
import { normalize_role, type UserRole } from "../security/roles_and_permissions";

export interface EnsureCorporateProfileInput {
  uid: string;
  email: unknown;
  displayName?: unknown;
  emailVerified: boolean;
  createIfMissingUnverified?: boolean;
}

export interface EnsureCorporateProfileResult {
  exists: boolean;
  created: boolean;
  updatedApproval: boolean;
  role: UserRole;
  area: string;
  approved: boolean;
  emailVerified: boolean;
  temporaryAccount: boolean;
  expiresAtMs?: number;
  expired: boolean;
}

/** Construye el mapa estándar de Custom Claims para Identity Platform y Firestore Rules. */
export function build_custom_claims(params: {
  role: UserRole;
  area: string;
  approved: boolean;
  temporaryAccount?: boolean;
  expiresAtMs?: number;
}): Record<string, unknown> {
  const is_temp = params.temporaryAccount === true;
  return {
    role: params.role,
    area: params.area,
    approved: params.approved,
    admin: params.role === "admin" && params.approved && !is_temp,
    ...(is_temp ? { temporaryAccount: true } : {}),
    ...(is_temp && typeof params.expiresAtMs === "number"
      ? { expiresAtMs: params.expiresAtMs }
      : {}),
  };
}

/** Construye el documento inicial de usuario `/users/{uid}` respetando el esquema Zero Trust. */
export function build_initial_profile_payload(
  uid: string,
  email: string,
  display_name: unknown,
  email_verified: boolean,
  now_iso: string,
): Record<string, unknown> {
  return {
    uid,
    name: clamp_string(display_name, 120).toUpperCase() || "USUARIO",
    email,
    role: "user",
    area: "Usuario",
    approved: email_verified,
    emailVerified: email_verified,
    verifiedByAdmin: false,
    createdAt: now_iso,
    updatedAt: now_iso,
  };
}

function empty_profile_result(expired = false): EnsureCorporateProfileResult {
  return {
    exists: false,
    created: false,
    updatedApproval: false,
    role: "user",
    area: "Usuario",
    approved: false,
    emailVerified: false,
    temporaryAccount: false,
    expired,
  };
}

/**
 * Reconcilia en servidor perfiles corporativos verificados y cuentas temporales de becario vigentes.
 */
export async function ensure_verified_corporate_profile(
  params: EnsureCorporateProfileInput,
): Promise<EnsureCorporateProfileResult> {
  const correo_normalizado = normalize_email(params.email);
  const es_corporativo = is_corporate_email(correo_normalizado);
  const referencia_perfil = firestore_db.collection("users").doc(params.uid);
  const perfil_snapshot = await referencia_perfil.get();
  const ahora_iso = new Date().toISOString();

  if (!perfil_snapshot.exists) {
    if (!es_corporativo || (!params.emailVerified && !params.createIfMissingUnverified)) {
      return empty_profile_result();
    }
    await referencia_perfil.set(
      build_initial_profile_payload(
        params.uid,
        correo_normalizado,
        params.displayName,
        params.emailVerified,
        ahora_iso,
      ),
    );
    return {
      exists: true,
      created: true,
      updatedApproval: params.emailVerified,
      role: "user",
      area: "Usuario",
      approved: params.emailVerified,
      emailVerified: params.emailVerified,
      temporaryAccount: false,
      expired: false,
    };
  }

  const datos_perfil = (perfil_snapshot.data() ?? {}) as Record<string, unknown>;
  const es_becario_temporal = is_temporary_intern_profile(datos_perfil);
  if (!es_corporativo && !es_becario_temporal) {
    return empty_profile_result();
  }

  const rol_verificado = normalize_role(datos_perfil["role"]);
  const area_verificada = clamp_string(datos_perfil["area"], 80) || "Usuario";
  const expirado = is_profile_expired(datos_perfil);
  const expiracion_ms =
    typeof datos_perfil["expiresAtMs"] === "number" ? datos_perfil["expiresAtMs"] : undefined;
  const es_temporal = datos_perfil["temporaryAccount"] === true;

  if (expirado) {
    return {
      exists: true,
      created: false,
      updatedApproval: false,
      role: rol_verificado,
      area: area_verificada,
      approved: false,
      emailVerified: datos_perfil["emailVerified"] === true || params.emailVerified,
      temporaryAccount: es_temporal,
      ...(typeof expiracion_ms === "number" ? { expiresAtMs: expiracion_ms } : {}),
      expired: true,
    };
  }

  const aprobado_previo = datos_perfil["approved"] === true;
  const verificado_previo = datos_perfil["emailVerified"] === true;
  const debe_aprobar_corp = es_corporativo && params.emailVerified && !aprobado_previo;
  const debe_marcar_verificado = params.emailVerified && !verificado_previo;

  if (debe_aprobar_corp || debe_marcar_verificado) {
    await referencia_perfil.set(
      {
        ...(es_corporativo ? { approved: true } : {}),
        emailVerified: true,
        updatedAt: ahora_iso,
      },
      { merge: true },
    );
  }

  return {
    exists: true,
    created: false,
    updatedApproval: debe_aprobar_corp,
    role: rol_verificado,
    area: area_verificada,
    approved: debe_aprobar_corp ? true : aprobado_previo,
    emailVerified: verificado_previo || params.emailVerified,
    temporaryAccount: es_temporal,
    ...(typeof expiracion_ms === "number" ? { expiresAtMs: expiracion_ms } : {}),
    expired: false,
  };
}
