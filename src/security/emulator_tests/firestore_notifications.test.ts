/**
 * @vitest-environment node
 * Pruebas adversariales Zero Trust sobre `/notifications`:
 * previene lectura masiva, falsificación de aprobación y alteración de mensajes.
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  initialize_security_test_environment,
  seed_standard_users_fixture,
} from "./emulator_test_helpers";

let entorno_pruebas: RulesTestEnvironment;

describe("Firestore Rules — Seguridad en /notifications", () => {
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
      await contexto_sin_reglas.firestore().collection("notifications").doc("n1").set({
        senderUid: "user-other",
        userId: "USER COCIMIENTOS",
        recipientUid: "user-coc",
        recipientEmail: "user.coc@gmodelo.com.mx",
        requesterUid: "user-other",
        requesterEmail: "other@ab-inbev.com",
        type: "access_request",
        pdcaId: "pdca-1",
        pdcaTitle: "Reducción de mermas",
        message: "Solicito acceso",
        read: false,
        approved: false,
        rejected: false,
        createdAt: "2026-01-02T00:00:00.000Z",
      });
    });
  });

  it("impide lectura sin filtro o lectura ajena e impide falsificar aprobaciones o tareas", async () => {
    const base_destinatario = entorno_pruebas
      .authenticatedContext("user-coc", { email: "user.coc@gmodelo.com.mx", email_verified: true })
      .firestore();
    const base_tercero = entorno_pruebas
      .authenticatedContext("user-assigned", { email: "assigned@ab-inbev.com", email_verified: true })
      .firestore();
    const base_visor = entorno_pruebas
      .authenticatedContext("viewer-1", { email: "viewer@ab-inbev.com", email_verified: true })
      .firestore();
    const base_admin = entorno_pruebas
      .authenticatedContext("admin-1", { email: "admin@ab-inbev.com", email_verified: true })
      .firestore();

    await assertFails(base_tercero.collection("notifications").get());
    await assertFails(base_tercero.collection("notifications").doc("n1").get());
    await assertSucceeds(
      base_destinatario.collection("notifications").where("recipientUid", "==", "user-coc").get(),
    );
    await assertSucceeds(base_admin.collection("notifications").get());

    await assertFails(
      base_tercero.collection("notifications").add({
        senderUid: "user-assigned",
        recipientUid: "user-assigned",
        requesterUid: "user-assigned",
        type: "access_approved",
        message: "Auto aprobado",
        read: false,
        approved: true,
      }),
    );
    await assertFails(
      base_visor.collection("notifications").add({
        senderUid: "viewer-1",
        recipientUid: "user-coc",
        type: "task_assigned",
        message: "Viewer creando tarea",
        read: false,
      }),
    );
    await assertSucceeds(
      base_visor.collection("notifications").add({
        senderUid: "viewer-1",
        recipientUid: "user-coc",
        requesterUid: "viewer-1",
        requesterEmail: "viewer@ab-inbev.com",
        type: "access_request",
        message: "Solicito ver PDCA",
        read: false,
        approved: false,
        rejected: false,
      }),
    );

    await assertFails(
      base_destinatario.collection("notifications").doc("n1").update({ approved: true }),
    );
    await assertFails(
      base_destinatario.collection("notifications").doc("n1").update({ message: "Editado" }),
    );
    await assertFails(base_tercero.collection("notifications").doc("n1").update({ read: true }));
    await assertSucceeds(base_destinatario.collection("notifications").doc("n1").update({ read: true }));
    await assertFails(base_destinatario.collection("notifications").doc("n1").delete());
    await assertSucceeds(base_admin.collection("notifications").doc("n1").delete());
  });
});
