/**
 * Helpers compartidos para las suites adversariales Zero Trust sobre emuladores de Firestore y Storage.
 * Centraliza la creación del entorno aislado, sembrado de usuarios y constructores de documentos válidos.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";

/** Identificador del proyecto demo aislado utilizado por Firebase Emulators. */
export const SECURITY_PROJECT_ID = "demo-maz-hub-security";

export interface SeedUserParams {
  uid: string;
  email: string;
  role: "admin" | "area_lead" | "user" | "intern" | "viewer";
  area: string;
  name: string;
  approved?: boolean;
  emailVerified?: boolean;
}

/**
 * Extrae host y puerto desde variables de entorno del emulador Firebase.
 * @param variable_entorno - Cadena `host:puerto` exportada por `firebase emulators:exec`.
 * @param host_respaldo - Host local por defecto.
 * @param puerto_respaldo - Puerto numérico por defecto.
 * @returns Par `{ host, port }` válido para `@firebase/rules-unit-testing`.
 */
export function parse_emulator_host(
  variable_entorno: string | undefined,
  host_respaldo: string,
  puerto_respaldo: number,
): { host: string; port: number } {
  if (!variable_entorno) {
    return { host: host_respaldo, port: puerto_respaldo };
  }
  const [host_leido, puerto_texto] = variable_entorno.split(":");
  const puerto_numero = Number(puerto_texto);
  return {
    host: host_leido || host_respaldo,
    port: Number.isFinite(puerto_numero) && puerto_numero > 0 ? puerto_numero : puerto_respaldo,
  };
}

/**
 * Inicializa el entorno de pruebas de reglas cargando `firestore.rules` y opcionalmente `storage.rules`.
 * @param opciones - Permite activar el emulador de Cloud Storage además de Firestore.
 * @returns Instancia lista de `RulesTestEnvironment`.
 */
export async function initialize_security_test_environment(
  opciones: { incluir_storage?: boolean } = {},
): Promise<RulesTestEnvironment> {
  const host_firestore = parse_emulator_host(
    process.env["FIRESTORE_EMULATOR_HOST"],
    "127.0.0.1",
    8080,
  );
  const host_storage = parse_emulator_host(
    process.env["FIREBASE_STORAGE_EMULATOR_HOST"],
    "127.0.0.1",
    9199,
  );

  return initializeTestEnvironment({
    projectId: SECURITY_PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      host: host_firestore.host,
      port: host_firestore.port,
    },
    ...(opciones.incluir_storage
      ? {
          storage: {
            rules: readFileSync(resolve(process.cwd(), "storage.rules"), "utf8"),
            host: host_storage.host,
            port: host_storage.port,
          },
        }
      : {}),
  });
}

/**
 * Crea un documento de usuario directamente sin reglas para configurar escenarios de prueba.
 * @param entorno_pruebas - Entorno de emulador activo.
 * @param usuario - Atributos del usuario a sembrar en `/users/{uid}`.
 */
export async function seed_test_user(
  entorno_pruebas: RulesTestEnvironment,
  usuario: SeedUserParams,
): Promise<void> {
  const esta_aprobado = usuario.approved ?? true;
  const correo_verificado = usuario.emailVerified ?? true;
  await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
    await contexto_sin_reglas
      .firestore()
      .collection("users")
      .doc(usuario.uid)
      .set({
        uid: usuario.uid,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        area: usuario.area,
        approved: esta_aprobado,
        emailVerified: correo_verificado,
        verifiedByAdmin: esta_aprobado,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
  });
}

/**
 * Limpia emuladores activos y siembra el elenco estándar de los 5 roles corporativos por área.
 * @param entorno_pruebas - Entorno de emulador activo.
 * @param opciones - Si es `true`, limpia también Cloud Storage antes de sembrar.
 */
export async function seed_standard_users_fixture(
  entorno_pruebas: RulesTestEnvironment,
  opciones: { limpiar_storage?: boolean } = {},
): Promise<void> {
  await entorno_pruebas.clearFirestore();
  if (opciones.limpiar_storage) {
    await entorno_pruebas.clearStorage();
  }
  const cuentas_base: SeedUserParams[] = [
    { uid: "admin-1", email: "admin@ab-inbev.com", role: "admin", area: "Dirección", name: "ADMIN UNO" },
    { uid: "lead-coc", email: "lead.coc@gmodelo.com.mx", role: "area_lead", area: "Cocimientos", name: "LIDER COCIMIENTOS" },
    { uid: "lead-env", email: "lead.env@gmodelo.com.mx", role: "area_lead", area: "Envase", name: "LIDER ENVASE" },
    { uid: "user-coc", email: "user.coc@gmodelo.com.mx", role: "user", area: "Cocimientos", name: "USER COCIMIENTOS" },
    { uid: "user-assigned", email: "assigned@ab-inbev.com", role: "user", area: "Envase", name: "ASIGNADO" },
    { uid: "user-other", email: "other@ab-inbev.com", role: "user", area: "Envase", name: "OTRO USUARIO" },
    { uid: "viewer-1", email: "viewer@ab-inbev.com", role: "viewer", area: "Cocimientos", name: "AUDITOR" },
    { uid: "intern-1", email: "intern@gmodelo.com.mx", role: "intern", area: "Cocimientos", name: "BECARIO" },
  ];
  for (const cuenta_usuario of cuentas_base) {
    await seed_test_user(entorno_pruebas, cuenta_usuario);
  }
}

export { build_valid_pdca, build_valid_rda } from "./emulator_fixture_builders";

type StorageInstance = ReturnType<
  ReturnType<RulesTestEnvironment["unauthenticatedContext"]>["storage"]
>;

/**
 * Envuelve el `UploadTask` del SDK compat de Storage en una `Promise` estándar para `assertSucceeds`/`assertFails`.
 */
export function put_storage_bytes(
  instancia_storage: StorageInstance,
  ruta_objeto: string,
  carga_bytes: Uint8Array,
  tipo_mime: string,
): Promise<unknown> {
  return new Promise((resolver, rechazar) => {
    const tarea_subida = instancia_storage
      .ref(ruta_objeto)
      .put(carga_bytes, { contentType: tipo_mime });
    tarea_subida.then(resolver, rechazar);
  });
}
