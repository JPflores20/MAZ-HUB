/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre `/users` y `/user_directory`:
 * impide escalación de privilegios, guardado de contraseñas, enumeración y escrituras en directorio.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  initialize_security_test_environment,
  seed_standard_users_fixture,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — Usuarios, Anti-Escalación y Directorio", () => {
  beforeAll(async () => {
    entorno_pruebas = await initialize_security_test_environment();
  });

  afterAll(async () => {
    if (entorno_pruebas) {
      await entorno_pruebas.cleanup();
    }
  });

  beforeEach(async () => {
    await seed_standard_users_fixture(entorno_pruebas);
  });

  it("impide auto-escalación en create, enumeración de /users y campos prohibidos como password", async () => {
    const base_registro_malicioso = entorno_pruebas
      .authenticatedContext("new-u", { email: "new.user@ab-inbev.com", email_verified: false })
      .firestore();

    await assertFails(
      base_registro_malicioso.collection("users").doc("new-u").set({
        uid: "new-u",
        name: "ATTACKER",
        email: "new.user@ab-inbev.com",
        role: "admin",
        area: "Usuario",
        approved: false,
        emailVerified: false,
      }),
    );
    await assertFails(
      base_registro_malicioso.collection("users").doc("new-u").set({
        uid: "new-u",
        name: "ATTACKER",
        email: "new.user@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: true,
        emailVerified: false,
      }),
    );
    await assertFails(
      base_registro_malicioso.collection("users").doc("new-u").set({
        uid: "new-u",
        name: "ATTACKER",
        email: "new.user@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: false,
        emailVerified: false,
        permissions: { canManageUsers: true },
      }),
    );
    await assertFails(
      base_registro_malicioso.collection("users").doc("new-u").set({
        uid: "new-u",
        name: "ATTACKER",
        email: "new.user@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: false,
        emailVerified: false,
        password: "PlainTextPassword123!",
      }),
    );

    const base_usuario = entorno_pruebas
      .authenticatedContext("user-coc", { email: "user.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .firestore();

    await assertFails(base_usuario.collection("users").get());
    await assertFails(base_usuario.collection("users").doc("admin-1").get());
    await assertSucceeds(base_usuario.collection("users").doc("user-coc").get());

    await assertSucceeds(base_admin.collection("users").get());
    await assertFails(base_admin.collection("users").doc("admin-1").delete());
  });

  it("aplica allowlist en auto-edición de perfil, frena DoS de tamaño y bloquea escrituras en user_directory", async () => {
    const base_usuario = entorno_pruebas
      .authenticatedContext("user-coc", { email: "user.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .firestore();
    const base_visor = entorno_pruebas
      .authenticatedContext("viewer-1", { email: "viewer@ab-inbev.com", email_verified: true })
      .firestore();

    await assertSucceeds(
      base_usuario.collection("users").doc("user-coc").update({
        firstName: "JUAN",
        phone: "6691234567",
        bio: "Ingeniero de procesos",
        updatedAt: "2026-02-01T00:00:00.000Z",
      }),
    );
    await assertFails(base_usuario.collection("users").doc("user-coc").update({ role: "admin" }));
    await assertFails(
      base_usuario.collection("users").doc("user-coc").update({ permissions: { canManageUsers: true } }),
    );
    await assertFails(
      base_usuario.collection("users").doc("user-coc").update({ password: "PlainTextPassword!" }),
    );
    await assertFails(
      base_usuario.collection("users").doc("user-coc").update({ bio: "x".repeat(501) }),
    );

    await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
      await contexto_sin_reglas.firestore().collection("user_directory").doc("user-coc").set({
        uid: "user-coc",
        name: "USER COCIMIENTOS",
        email: "user.coc@gmodelo.com.mx",
        area: "Cocimientos",
        role: "user",
        approved: true,
      });
    });

    await assertSucceeds(base_visor.collection("user_directory").get());
    await assertFails(
      base_admin.collection("user_directory").doc("user-coc").update({ role: "viewer" }),
    );
    await assertFails(base_usuario.collection("user_directory").doc("evil").set({ uid: "evil" }));
  });
});
