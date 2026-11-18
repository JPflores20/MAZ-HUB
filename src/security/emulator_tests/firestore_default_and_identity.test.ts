/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust de denegación por defecto, colecciones legadas e identidad en Firestore.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  build_valid_pdca,
  build_valid_rda,
  initialize_security_test_environment,
  seed_standard_users_fixture,
  seed_test_user,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — Denegación por defecto e identidad corporativa", () => {
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

  it("deniega por defecto colecciones arbitrarias y colecciones legadas /pdca y /rda incluso a admin", async () => {
    const base_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .firestore();

    await assertFails(base_admin.collection("secrets").doc("s1").get());
    await assertFails(base_admin.collection("secrets").doc("s1").set({ key: "x" }));
    await assertFails(base_admin.collection("pdca").doc("legacy-1").get());
    await assertFails(base_admin.collection("pdca").doc("legacy-1").set({ titulo: "x" }));
    await assertFails(base_admin.collection("rda").doc("legacy-1").get());
    await assertFails(base_admin.collection("rda").doc("legacy-1").set({ title: "x" }));
  });

  it("bloquea usuarios anónimos, correos no corporativos, no verificados y pendientes de aprobación", async () => {
    await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
      await contexto_sin_reglas.firestore().collection("pdcas").doc("pdca-1").set(build_valid_pdca());
      await contexto_sin_reglas.firestore().collection("rdas").doc("rda-1").set(build_valid_rda());
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

    const base_anonima = entorno_pruebas.unauthenticatedContext().firestore();
    await assertFails(base_anonima.collection("pdcas").doc("pdca-1").get());
    await assertFails(base_anonima.collection("rdas").doc("rda-1").get());
    await assertFails(base_anonima.collection("user_directory").doc("admin-1").get());
    await assertFails(base_anonima.collection("users").doc("pending-1").get());

    const base_externa = entorno_pruebas
      .authenticatedContext("ext-1", { email: "attacker@gmail.com", email_verified: true })
      .firestore();
    await assertFails(
      base_externa.collection("users").doc("ext-1").set({
        uid: "ext-1",
        name: "EXTERNAL",
        email: "attacker@gmail.com",
        role: "user",
        area: "Usuario",
        approved: false,
        emailVerified: true,
      }),
    );
    await assertFails(base_externa.collection("pdcas").get());

    const base_sin_verificar = entorno_pruebas
      .authenticatedContext("unverified-1", {
        email: "unverified@ab-inbev.com",
        email_verified: false,
      })
      .firestore();
    await assertFails(base_sin_verificar.collection("pdcas").doc("pdca-1").get());
    await assertFails(base_sin_verificar.collection("rdas").doc("rda-1").get());
    await assertFails(base_sin_verificar.collection("user_directory").get());
    await assertSucceeds(
      base_sin_verificar.collection("users").doc("unverified-1").set({
        uid: "unverified-1",
        name: "UNVERIFIED",
        email: "unverified@ab-inbev.com",
        role: "user",
        area: "Usuario",
        approved: false,
        verifiedByAdmin: false,
        emailVerified: false,
      }),
    );
    await assertFails(
      base_sin_verificar.collection("users").doc("unverified-1").update({ emailVerified: true }),
    );

    const base_pendiente = entorno_pruebas
      .authenticatedContext("pending-1", {
        email: "pending@gmodelo.com.mx",
        email_verified: true,
      })
      .firestore();
    await assertFails(base_pendiente.collection("pdcas").doc("pdca-1").get());
    await assertFails(base_pendiente.collection("rdas").doc("rda-1").get());
    await assertFails(base_pendiente.collection("user_directory").doc("admin-1").get());
    await assertFails(base_pendiente.collection("notifications").get());
    await assertFails(base_pendiente.collection("users").doc("pending-1").update({ approved: true }));
    await assertFails(base_pendiente.collection("users").doc("pending-1").update({ role: "admin" }));
  });
});
