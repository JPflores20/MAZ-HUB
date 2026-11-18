/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre `/pdcas`:
 * verifica bloqueo a `viewer`/`intern`, aislamiento por área/propiedad, gobernanza y `_config`.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  build_valid_pdca,
  initialize_security_test_environment,
  seed_standard_users_fixture,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — RBAC estricto en /pdcas", () => {
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
      await contexto_sin_reglas.firestore().collection("pdcas").doc("pdca-1").set(
        build_valid_pdca({
          assignedUids: ["user-assigned"],
          assignedEmails: ["assigned@ab-inbev.com"],
        }),
      );
    });
  });

  it("permite lectura pero rechaza create/update/delete para viewer e intern", async () => {
    const base_visor = entorno_pruebas
      .authenticatedContext("viewer-1", { email: "viewer@ab-inbev.com", email_verified: true })
      .firestore();
    const base_becario = entorno_pruebas
      .authenticatedContext("intern-1", { email: "intern@gmodelo.com.mx", email_verified: true })
      .firestore();

    await assertSucceeds(base_visor.collection("pdcas").doc("pdca-1").get());
    await assertSucceeds(base_becario.collection("pdcas").get());

    await assertFails(
      base_visor.collection("pdcas").doc("pdca-v").set(
        build_valid_pdca({ id: "pdca-v", ownerUid: "viewer-1", autorEmail: "viewer@ab-inbev.com" }),
      ),
    );
    await assertFails(
      base_becario.collection("pdcas").doc("pdca-i").set(
        build_valid_pdca({ id: "pdca-i", ownerUid: "intern-1", autorEmail: "intern@gmodelo.com.mx" }),
      ),
    );
    await assertFails(base_visor.collection("pdcas").doc("pdca-1").update({ problema: "X" }));
    await assertFails(base_becario.collection("pdcas").doc("pdca-1").delete());
  });

  it("aplica propiedad, aislamiento entre áreas, bloqueo de gobernanza y protección de _config", async () => {
    const base_dueno = entorno_pruebas
      .authenticatedContext("user-coc", { email: "user.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_asignado = entorno_pruebas
      .authenticatedContext("user-assigned", { email: "assigned@ab-inbev.com", email_verified: true })
      .firestore();
    const base_ajeno = entorno_pruebas
      .authenticatedContext("user-other", { email: "other@ab-inbev.com", email_verified: true })
      .firestore();
    const base_lider_coc = entorno_pruebas
      .authenticatedContext("lead-coc", { email: "lead.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_lider_env = entorno_pruebas
      .authenticatedContext("lead-env", { email: "lead.env@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .firestore();

    await assertSucceeds(
      base_dueno.collection("pdcas").doc("pdca-new").set(build_valid_pdca({ id: "pdca-new" })),
    );
    await assertFails(
      base_ajeno.collection("pdcas").doc("pdca-spoof").set(build_valid_pdca({ id: "pdca-spoof" })),
    );
    await assertFails(
      base_dueno
        .collection("pdcas")
        .doc("pdca-dos")
        .set(build_valid_pdca({ id: "pdca-dos", progreso: 999 })),
    );

    await assertFails(base_ajeno.collection("pdcas").doc("pdca-1").update({ problema: "Hack" }));
    await assertFails(base_ajeno.collection("pdcas").doc("pdca-1").delete());

    await assertSucceeds(
      base_asignado.collection("pdcas").doc("pdca-1").update({ problema: "Actualización asignado" }),
    );
    await assertFails(
      base_asignado.collection("pdcas").doc("pdca-1").update({ fechaFinalizacion: "Sin límite" }),
    );
    await assertFails(
      base_asignado
        .collection("pdcas")
        .doc("pdca-1")
        .update({ assignedEmails: ["other@ab-inbev.com"] }),
    );
    await assertFails(base_asignado.collection("pdcas").doc("pdca-1").delete());

    await assertSucceeds(
      base_lider_coc.collection("pdcas").doc("pdca-1").update({ fechaFinalizacion: "2027-01-15" }),
    );
    await assertFails(base_lider_env.collection("pdcas").doc("pdca-1").update({ problema: "Otra área" }));
    await assertFails(base_lider_coc.collection("pdcas").doc("pdca-1").delete());

    await assertFails(base_dueno.collection("pdcas").doc("_config").set({ isSeeded: false }));
    await assertSucceeds(base_admin.collection("pdcas").doc("_config").set({ isSeeded: true }));
    await assertSucceeds(base_dueno.collection("pdcas").doc("pdca-new").delete());
  });
});
