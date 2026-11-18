/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre MIME types, tamaños máximos, rutas permitidas y aislamiento por UID en Storage.
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
const BYTES_PNG_MINIMO = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const BYTES_PDF_MINIMO = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

describe("Storage Rules — Validación de payload y aislamiento por propietario UID", () => {
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
      uid: "user-2",
      email: "user2@ab-inbev.com",
      role: "user",
      area: "Envase",
      name: "USUARIO DOS",
    });
  });

  it("permite PNG y PDF dentro de rutas aisladas por UID y rechaza SVG, HTML, rutas prohibidas, spoofing y > 10 MiB", async () => {
    const storage_usuario_uno = entorno_pruebas
      .authenticatedContext("user-1", { email: "user1@gmodelo.com.mx", email_verified: true })
      .storage();

    await assertSucceeds(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/user-1/evidence.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
    await assertSucceeds(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/rda_images/user-1/reporte.pdf",
        BYTES_PDF_MINIMO,
        "application/pdf",
      ),
    );

    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/user-1/evil.svg",
        new TextEncoder().encode("<svg></svg>"),
        "image/svg+xml",
      ),
    );
    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/user-1/evil.html",
        new TextEncoder().encode("<html></html>"),
        "text/html",
      ),
    );
    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/avatars/user-1/avatar.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/flat-legacy.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );
    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/user-2/spoof.png",
        BYTES_PNG_MINIMO,
        "image/png",
      ),
    );

    const carga_excedida = new Uint8Array(10 * 1024 * 1024 + 1);
    await assertFails(
      put_storage_bytes(
        storage_usuario_uno,
        "uploads/pdca_images/user-1/huge.png",
        carga_excedida,
        "image/png",
      ),
    );
  });

  it("impide listar o eliminar archivos ajenos y permite borrado únicamente al propietario o a un admin", async () => {
    await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
      await put_storage_bytes(
        contexto_sin_reglas.storage(),
        "uploads/pdca_images/user-1/evidence.png",
        BYTES_PNG_MINIMO,
        "image/png",
      );
      await put_storage_bytes(
        contexto_sin_reglas.storage(),
        "uploads/pdca_images/user-2/other.png",
        BYTES_PNG_MINIMO,
        "image/png",
      );
    });

    const storage_usuario_uno = entorno_pruebas
      .authenticatedContext("user-1", { email: "user1@gmodelo.com.mx", email_verified: true })
      .storage();
    const storage_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .storage();

    await assertFails(storage_usuario_uno.ref("uploads/pdca_images/user-2").listAll());
    await assertFails(storage_usuario_uno.ref("uploads/pdca_images/user-2/other.png").delete());

    await assertSucceeds(
      storage_usuario_uno.ref("uploads/pdca_images/user-1/evidence.png").delete(),
    );
    await assertSucceeds(storage_admin.ref("uploads/pdca_images/user-2/other.png").delete());
  });
});
