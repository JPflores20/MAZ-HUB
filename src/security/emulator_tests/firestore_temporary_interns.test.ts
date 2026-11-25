/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre becarios temporales con correo externo (Gmail) y expiración en Firestore Rules.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  build_valid_pdca,
  initialize_security_test_environment,
  seed_standard_users_fixture,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — Becarios temporales (Gmail + vigencia + anti-escalación)", () => {
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
    await entorno_pruebas.withSecurityRulesDisabled(async (contexto_sin_reglas) => {
      const db_raw = contexto_sin_reglas.firestore();
      await db_raw.collection("pdcas").doc("pdca-1").set(build_valid_pdca());
      await db_raw
        .collection("users")
        .doc("intern-temp-ok")
        .set({
          uid: "intern-temp-ok",
          name: "BECARIO TEMPORAL",
          email: "becario.ok@gmail.com",
          role: "intern",
          area: "ENVASE",
          approved: true,
          verifiedByAdmin: true,
          emailVerified: true,
          temporaryAccount: true,
          activeDays: 30,
          expiresAtMs: Date.now() + 86_400_000,
        });
      await db_raw
        .collection("users")
        .doc("intern-temp-exp")
        .set({
          uid: "intern-temp-exp",
          name: "BECARIO EXPIRADO",
          email: "becario.exp@gmail.com",
          role: "intern",
          area: "ENVASE",
          approved: true,
          verifiedByAdmin: true,
          emailVerified: true,
          temporaryAccount: true,
          activeDays: 5,
          expiresAtMs: Date.now() - 60_000,
        });
    });
  });

  it("bloquea auto-registro externo como becario temporal y bloquea lectura de becarios expirados", async () => {
    const self_external = entorno_pruebas
      .authenticatedContext("ext-self", { email: "self.becario@gmail.com", email_verified: true })
      .firestore();

    await assertFails(
      self_external
        .collection("users")
        .doc("ext-self")
        .set({
          uid: "ext-self",
          name: "INTRUSO",
          email: "self.becario@gmail.com",
          role: "intern",
          area: "ENVASE",
          approved: false,
          verifiedByAdmin: false,
          emailVerified: true,
          temporaryAccount: true,
          activeDays: 30,
          expiresAtMs: Date.now() + 86_400_000,
        }),
    );

    const corp_self = entorno_pruebas
      .authenticatedContext("corp-self", {
        email: "corp.self@ab-inbev.com",
        email_verified: false,
      })
      .firestore();
    await assertFails(
      corp_self
        .collection("users")
        .doc("corp-self")
        .set({
          uid: "corp-self",
          name: "CORP INTRUSO",
          email: "corp.self@ab-inbev.com",
          role: "user",
          area: "ENVASE",
          approved: false,
          verifiedByAdmin: false,
          emailVerified: false,
          temporaryAccount: true,
          activeDays: 30,
          expiresAtMs: Date.now() + 86_400_000,
        }),
    );

    const intern_exp = entorno_pruebas
      .authenticatedContext("intern-temp-exp", {
        email: "becario.exp@gmail.com",
        email_verified: true,
      })
      .firestore();
    await assertFails(intern_exp.collection("pdcas").doc("pdca-1").get());
    await assertFails(intern_exp.collection("user_directory").get());
  });

  it("permite lectura de solo consulta al becario temporal vigente e impide escritura o ampliación de vigencia", async () => {
    const intern_ok = entorno_pruebas
      .authenticatedContext("intern-temp-ok", {
        email: "becario.ok@gmail.com",
        email_verified: true,
      })
      .firestore();

    await assertSucceeds(intern_ok.collection("users").doc("intern-temp-ok").get());
    await assertSucceeds(intern_ok.collection("pdcas").doc("pdca-1").get());
    await assertFails(
      intern_ok
        .collection("pdcas")
        .doc("pdca-evil")
        .set(build_valid_pdca({ id: "pdca-evil" })),
    );
    await assertFails(
      intern_ok
        .collection("users")
        .doc("intern-temp-ok")
        .update({ expiresAtMs: Date.now() + 999_999_999 }),
    );
    await assertFails(intern_ok.collection("users").doc("intern-temp-ok").update({ role: "user" }));
  });
});
