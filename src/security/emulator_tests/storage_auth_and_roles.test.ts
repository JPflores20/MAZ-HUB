/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre autenticación, verificación y roles RBAC en Cloud Storage Rules.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  initialize_security_test_environment,
  put_storage_bytes,
  seed_standard_users_fixture,
  seed_test_user,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;
const RUTA_EVIDENCIA_EXISTENTE = "uploads/pdca_images/user-1/existing.png";
const BYTES_PNG_MINIMO = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);

describe("Storage Rules — Autenticación corporativa y control por roles", () => {
  beforeAll(async () => {
    entorno_pruebas = await initialize_security_test_environment({ incluir_storage: true });
  });

  afterAll(async () => {
    if (entorno_pruebas) {
      await entorno_pruebas.cleanup();
    }
  });

  beforeEach(async () => {
    await seed_standard_users_fixture(entorno_pruebas, { limpiar_storage: true });
    await seed_test_user(entorno_pruebas, {
      uid: "user-1",
      email: "user1@gmodelo.com.mx",
      role: "user",
      area: "Cocimientos",
      name: "USUARIO UNO",
    });
    await seed_test_user(entorno_pruebas, {
      uid: "pending-1",
      email: "pending@gmodelo.com.mx",
      role: "user",
      area: "Usuario",
      name: "PENDIENTE",
      approved: false,
      emailVerified: true,
    });
    await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
      await put_storage_bytes(
        contexto_sin_reglas.storage(),
        RUTA_EVIDENCIA_EXISTENTE,
        BYTES_PNG_MINIMO,
        "image/png",
      );
    });
  });

  it("bloquea lectura y escritura para anónimos, externos, no verificados y usuarios pendientes", async () => {
    const storage_anonimo = entorno_pruebas.unauthenticatedContext().storage();
    const storage_externo = entorno_pruebas
      .authenticatedContext("ext-1", { email: "ext@gmail.com", email_verified: true })
      .storage();
    const storage_no_verificado = entorno_pruebas
      .authenticatedContext("user-1", { email: "user1@gmodelo.com.mx", email_verified: false })
      .storage();
    const storage_pendiente = entorno_pruebas
      .authenticatedContext("pending-1", { email: "pending@gmodelo.com.mx", email_verified: true })
      .storage();

    for (const instancia_storage of [
      storage_anonimo,
      storage_externo,
      storage_no_verificado,
      storage_pendiente,
    ]) {
      await assertFails(instancia_storage.ref(RUTA_EVIDENCIA_EXISTENTE).getDownloadURL());
    }

    await assertFails(
      put_storage_bytes(
        storage_pendiente,
        "uploads/pdca_images/pending-1/test.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
  });

  it("permite únicamente lectura a viewer e intern bloqueando subidas y eliminaciones", async () => {
    const storage_viewer = entorno_pruebas
      .authenticatedContext("viewer-1", { email: "viewer@ab-inbev.com", email_verified: true })
      .storage();
    const storage_intern = entorno_pruebas
      .authenticatedContext("intern-1", { email: "intern@gmodelo.com.mx", email_verified: true })
      .storage();

    await assertSucceeds(storage_viewer.ref(RUTA_EVIDENCIA_EXISTENTE).getDownloadURL());
    await assertSucceeds(storage_intern.ref(RUTA_EVIDENCIA_EXISTENTE).getDownloadURL());

    await assertFails(
      put_storage_bytes(
        storage_viewer,
        "uploads/pdca_images/viewer-1/x.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
    await assertFails(
      put_storage_bytes(
        storage_intern,
        "uploads/pdca_images/intern-1/x.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
    await assertFails(storage_viewer.ref(RUTA_EVIDENCIA_EXISTENTE).delete());
  });
});
