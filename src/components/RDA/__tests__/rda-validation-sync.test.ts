import { describe, expect, it } from "vitest";
import { syncRootCausesToPda } from "../RdaPhase3ValidationSteps";
import type { RdaValidationAction } from "@/data/rda";
import { crearFilaAccionVacia } from "@/components/pdca/2.DO/paso18/utils/action-plan-utils";

describe("syncRootCausesToPda — Paso 9 (Plan de Validación) -> Paso 12 (PDA Causa Raíz)", () => {
  it("coloca automáticamente la causa potencial en la causa raíz del Paso 12 cuando esCausaRaiz === 'SI'", () => {
    const validationActions: RdaValidationAction[] = [
      {
        id: "val_1",
        categoria: "Mano de obra",
        causaPotencial: "Exceso de despunte al arranque de filtro",
        accion: "Revisar protocolo de pasos para verificar que se respete el volumen programado",
        responsable: "Iván Rojero",
        fechaLimite: "2026-10-10",
        estatus: "Completa",
        esCausaRaiz: "SI",
      },
      {
        id: "val_2",
        categoria: "Método",
        causaPotencial: "Bajos ciclos de filtración",
        accion: "Verificar ciclos",
        responsable: "Iván Rojero",
        fechaLimite: "2026-10-10",
        estatus: "Completa",
        esCausaRaiz: "NO",
      },
    ];

    const { nextPda, changed } = syncRootCausesToPda(
      validationActions,
      [],
      "DQO fuera de especificación",
    );

    expect(changed).toBe(true);
    expect(nextPda).toHaveLength(1);
    expect(nextPda[0]?.causaRaiz).toBe("Exceso de despunte al arranque de filtro");
    expect(nextPda[0]?.tema).toBe("DQO fuera de especificación");
    expect(nextPda[0]?.accion).toBe("");
  });

  it("actualiza el texto en el Paso 12 si se edita la causa potencial en el Paso 9 y conserva la acción correctiva escrita", () => {
    const initialValidation: RdaValidationAction[] = [
      {
        id: "val_1",
        categoria: "Mano de obra",
        causaPotencial: "Exceso de despunte",
        accion: "Validar",
        responsable: "Iván",
        fechaLimite: "",
        estatus: "Completa",
        esCausaRaiz: "SI",
      },
    ];

    const firstSync = syncRootCausesToPda(initialValidation, [], "DQO");
    // El usuario escribe una acción correctiva en el Paso 12
    const pdaWithAction = firstSync.nextPda.map((row) => ({
      ...row,
      accion: "Estandarizar volumen de despunte en SOP",
    }));

    const editedValidation: RdaValidationAction[] = [
      {
        ...initialValidation[0]!,
        causaPotencial: "Exceso de despunte al arranque de filtro",
      },
    ];

    const secondSync = syncRootCausesToPda(
      editedValidation,
      pdaWithAction,
      "DQO",
      initialValidation,
    );

    expect(secondSync.changed).toBe(true);
    expect(secondSync.nextPda).toHaveLength(1);
    expect(secondSync.nextPda[0]?.causaRaiz).toBe("Exceso de despunte al arranque de filtro");
    expect(secondSync.nextPda[0]?.accion).toBe("Estandarizar volumen de despunte en SOP");
  });

  it("retira automáticamente del Paso 12 la causa si cambia de 'SI' a 'NO' y aún no tiene acción correctiva escrita", () => {
    const prevValidation: RdaValidationAction[] = [
      {
        id: "val_1",
        categoria: "Mano de obra",
        causaPotencial: "Exceso de despunte al arranque de filtro",
        accion: "Validar",
        responsable: "Iván",
        fechaLimite: "",
        estatus: "Completa",
        esCausaRaiz: "SI",
      },
    ];

    const firstSync = syncRootCausesToPda(prevValidation, [crearFilaAccionVacia()], "DQO");
    expect(firstSync.nextPda).toHaveLength(1);

    const nextValidation: RdaValidationAction[] = [
      {
        ...prevValidation[0]!,
        esCausaRaiz: "NO",
      },
    ];

    const secondSync = syncRootCausesToPda(
      nextValidation,
      firstSync.nextPda,
      "DQO",
      prevValidation,
    );

    expect(secondSync.changed).toBe(true);
    expect(secondSync.nextPda).toHaveLength(0);
  });
});
