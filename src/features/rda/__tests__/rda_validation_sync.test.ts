/**
 * @fileoverview Unit tests verifying automatic synchronization between Step 9 validation causes and Step 12 PDA.
 */

import { describe, expect, it } from "vitest";
import { crear_fila_accion_vacia } from "@/features/pdca/do/paso_18/action_plan_utils";
import type { RdaValidationAction } from "@/domain/models/rda";
import { sync_root_causes_to_pda } from "../utils/rda_root_cause_sync";

describe("sync_root_causes_to_pda — Paso 9 (Plan de Validación) -> Paso 12 (PDA Causa Raíz)", () => {
  it("coloca automáticamente la causa potencial en la causa raíz del Paso 12 cuando esCausaRaiz === 'SI'", () => {
    const validation_actions: RdaValidationAction[] = [
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

    const { nextPda, changed } = sync_root_causes_to_pda(
      validation_actions,
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
    const initial_validation: RdaValidationAction[] = [
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

    const first_sync = sync_root_causes_to_pda(initial_validation, [], "DQO");
    const pda_with_action = first_sync.nextPda.map((row) => ({
      ...row,
      accion: "Estandarizar volumen de despunte en SOP",
    }));

    const edited_validation: RdaValidationAction[] = [
      {
        ...initial_validation[0]!,
        causaPotencial: "Exceso de despunte al arranque de filtro",
      },
    ];

    const second_sync = sync_root_causes_to_pda(
      edited_validation,
      pda_with_action,
      "DQO",
      initial_validation,
    );

    expect(second_sync.changed).toBe(true);
    expect(second_sync.nextPda).toHaveLength(1);
    expect(second_sync.nextPda[0]?.causaRaiz).toBe("Exceso de despunte al arranque de filtro");
    expect(second_sync.nextPda[0]?.accion).toBe("Estandarizar volumen de despunte en SOP");
  });

  it("retira automáticamente del Paso 12 la causa si cambia de 'SI' a 'NO' y aún no tiene acción correctiva escrita", () => {
    const previous_validation: RdaValidationAction[] = [
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

    const first_sync = sync_root_causes_to_pda(previous_validation, [crear_fila_accion_vacia()], "DQO");
    expect(first_sync.nextPda).toHaveLength(1);

    const next_validation: RdaValidationAction[] = [
      {
        ...previous_validation[0]!,
        esCausaRaiz: "NO",
      },
    ];

    const second_sync = sync_root_causes_to_pda(
      next_validation,
      first_sync.nextPda,
      "DQO",
      previous_validation,
    );

    expect(second_sync.changed).toBe(true);
    expect(second_sync.nextPda).toHaveLength(0);
  });

  it("no vuelve a recrear en el Paso 12 una acción que el usuario eliminó manualmente aunque su causa siga en 'SI' en el Paso 9", () => {
    const validation: RdaValidationAction[] = [
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

    const after_delete_sync = sync_root_causes_to_pda(validation, [], "DQO", validation);
    expect(after_delete_sync.changed).toBe(false);
    expect(after_delete_sync.nextPda).toHaveLength(0);
  });
});
