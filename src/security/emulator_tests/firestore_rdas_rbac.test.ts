/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre `/rdas`:
 * verifica bloqueo de `viewer`/`intern`, propiedad, aislamiento por área y campos de gobernanza.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  build_valid_rda,
  initialize_security_test_environment,
  seed_standard_users_fixture,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — RBAC estricto en /rdas", () => {
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
      await contexto_sin_reglas.firestore().collection("rdas").doc("rda-1").set(
        build_valid_rda({
          assignedUids: ["user-assigned"],
          assignedEmails: ["assigned@ab-inbev.com"],
        }),
      );
    });
  });

  it("permite lectura pero deniega create/update/delete a viewer, intern y usuarios ajenos", async () => {
    const base_visor = entorno_pruebas
      .authenticatedContext("viewer-1", { email: "viewer@ab-inbev.com", email_verified: true })
      .firestore();
    const base_becario = entorno_pruebas
      .authenticatedContext("intern-1", { email: "intern@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_ajeno = entorno_pruebas
      .authenticatedContext("user-other", { email: "other@ab-inbev.com", email_verified: true })
      .firestore();

    await assertSucceeds(base_visor.collection("rdas").doc("rda-1").get());
    await assertSucceeds(base_becario.collection("rdas").get());
    await assertFails(
      base_visor.collection("rdas").doc("rda-v").set(
        build_valid_rda({
          id: "rda-v",
          ownerUid: "viewer-1",
          portada: { titulo: "No permitido", autorEmail: "viewer@ab-inbev.com" },
        }),
      ),
    );
    await assertFails(
      base_becario.collection("rdas").doc("rda-1").update({ observacionesAdicionales: "X" }),
    );
    await assertFails(base_visor.collection("rdas").doc("rda-1").delete());
    await assertFails(base_ajeno.collection("rdas").doc("rda-1").update({ title: "Secuestrado" }));
    await assertFails(base_ajeno.collection("rdas").doc("rda-1").delete());
  });

  it("permite edición acotada al asignado y líder de la misma área, y borrado solo al dueño", async () => {
    const base_dueno = entorno_pruebas
      .authenticatedContext("user-coc", { email: "user.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_asignado = entorno_pruebas
      .authenticatedContext("user-assigned", { email: "assigned@ab-inbev.com", email_verified: true })
      .firestore();
    const base_lider_coc = entorno_pruebas
      .authenticatedContext("lead-coc", { email: "lead.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_lider_env = entorno_pruebas
      .authenticatedContext("lead-env", { email: "lead.env@gmodelo.com.mx", email_verified: true })
      .firestore();

    await assertSucceeds(
      base_dueno.collection("rdas").doc("rda-2").set(build_valid_rda({ id: "rda-2" })),
    );
    await assertSucceeds(
      base_asignado.collection("rdas").doc("rda-1").update({ observacionesAdicionales: "OK" }),
    );
    await assertFails(
      base_asignado
        .collection("rdas")
        .doc("rda-1")
        .update({ assignedEmails: ["other@ab-inbev.com"] }),
    );
    await assertFails(base_asignado.collection("rdas").doc("rda-1").delete());
    await assertSucceeds(
      base_lider_coc.collection("rdas").doc("rda-1").update({ observacionesAdicionales: "Líder" }),
    );
    await assertFails(
      base_lider_env.collection("rdas").doc("rda-1").update({ observacionesAdicionales: "Otra área" }),
    );
    await assertSucceeds(base_dueno.collection("rdas").doc("rda-2").delete());
  });
});
