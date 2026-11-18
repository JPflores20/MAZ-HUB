/**
 * Pruebas unitarias para constantes de fases, valores por defecto PDCA y reglas de áreas.
 */
import { describe, it, expect } from "vitest";
import { PHASES, PHASE_STYLES } from "../constants/pdca_phases";
import {
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
} from "../defaults/pdca_defaults";

describe("PHASES", () => {
  it("contiene exactamente las 6 fases del ciclo PDCA en orden", () => {
    expect(PHASES).toEqual(["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"]);
  });
});

describe("PHASE_STYLES", () => {
  it("tiene una entrada para cada fase del ciclo PDCA", () => {
    expect(Object.keys(PHASE_STYLES)).toEqual([
      "Resumen",
      "Plan",
      "Do",
      "Check",
      "Act",
      "Evaluacion",
    ]);
  });

  it("cada estilo es un string no vacío con clases de Tailwind", () => {
    for (const clase_estilo of Object.values(PHASE_STYLES)) {
      expect(typeof clase_estilo).toBe("string");
      expect(clase_estilo.length).toBeGreaterThan(0);
    }
  });
});

describe("DEFAULT_PARTICIPANTES", () => {
  it("todos los campos son strings vacíos por defecto", () => {
    const valores_campos = Object.values(DEFAULT_PARTICIPANTES);
    expect(valores_campos.every((valor_campo) => valor_campo === "")).toBe(true);
  });

  it("contiene los 6 campos esperados", () => {
    expect(DEFAULT_PARTICIPANTES).toMatchObject({
      locales_nombres: "",
      locales_roles: "",
      externos_nombres: "",
      externos_roles: "",
      fecha_reunion_inicial: "",
      reunion_rutina: "",
    });
  });
});

describe("DEFAULT_TARGET_VS_ACTUAL", () => {
  it("contiene exactamente 12 meses", () => {
    expect(DEFAULT_TARGET_VS_ACTUAL).toHaveLength(12);
  });

  it("el primer mes es Ene y el último es Dic", () => {
    expect(DEFAULT_TARGET_VS_ACTUAL[0]!.mes).toBe("Ene");
    expect(DEFAULT_TARGET_VS_ACTUAL[11]!.mes).toBe("Dic");
  });

  it("los meses del 6 al 12 tienen `actual` nulo (pendientes)", () => {
    const meses_pendientes = DEFAULT_TARGET_VS_ACTUAL.slice(5);
    expect(meses_pendientes.every((mes_actual) => mes_actual.actual === null)).toBe(true);
  });
});

describe("DEFAULT_PARETO_DATA_MAP", () => {
  it("tiene la clave raíz `root`", () => {
    expect(DEFAULT_PARETO_DATA_MAP).toHaveProperty("root");
  });

  it("cada elemento en `root` tiene id, area y gap", () => {
    for (const elemento_pareto of DEFAULT_PARETO_DATA_MAP["root"]!) {
      expect(elemento_pareto).toHaveProperty("id");
      expect(elemento_pareto).toHaveProperty("area");
      expect(typeof elemento_pareto.gap).toBe("number");
    }
  });
});

describe("DEFAULT_VPO_CHECKPOINTS", () => {
  it("contiene exactamente 14 checkpoints VPO", () => {
    expect(DEFAULT_VPO_CHECKPOINTS).toHaveLength(14);
  });

  it("cada checkpoint tiene id único", () => {
    const identificadores = DEFAULT_VPO_CHECKPOINTS.map((checkpoint) => checkpoint.id);
    const identificadores_unicos = new Set(identificadores);
    expect(identificadores_unicos.size).toBe(identificadores.length);
  });

  it("todos los checkpoints tienen status y evidencia vacíos por defecto", () => {
    expect(DEFAULT_VPO_CHECKPOINTS.every((checkpoint) => checkpoint.status === "")).toBe(true);
    expect(DEFAULT_VPO_CHECKPOINTS.every((checkpoint) => checkpoint.evidencia === "")).toBe(true);
  });

  it("los ids siguen el patrón vpo-N", () => {
    DEFAULT_VPO_CHECKPOINTS.forEach((checkpoint, indice_checkpoint) => {
      expect(checkpoint.id).toBe(`vpo-${indice_checkpoint + 1}`);
    });
  });
});
