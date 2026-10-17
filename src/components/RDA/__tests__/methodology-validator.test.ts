/**
 * methodology-validator.test.ts
 * Pruebas unitarias del validador automático de consistencia metodológica para PDCA y RDA.
 */
import { describe, it, expect } from "vitest";
import {
  evaluateRdaMethodology,
  evaluatePdcaMethodology,
} from "@/components/ui/methodology-validator-card";
import { defaultRda } from "@/data/rda";

describe("MethodologyValidator — RDA y PDCA", () => {
  it("evalúa un RDA vacío como incompleto pero devuelve las 5 dimensiones", () => {
    const res = evaluateRdaMethodology(defaultRda);
    expect(res.criteria).toHaveLength(5);
    expect(res.scorePct).toBeGreaterThanOrEqual(20);
    expect(res.scorePct).toBeLessThan(60);
  });

  it("evalúa un RDA completo con 100% de consistencia metodológica", () => {
    const completeRda = {
      ...defaultRda,
      title: "Desviación de presión en llenadora",
      problemDescription: {
        que: "Caída de presión",
        como: "Variación de 0.8 bar",
        cuando: "Turno 2",
        donde: "Línea 4",
        quien: "Operador de llenadora",
        cual: "Válvula proporcional",
      },
      timeline: [{ id: "t1", time: "10:00", description: "Evento", images: ["https://img/1.jpg"] }],
      immediateActions: [
        {
          id: "ia1",
          categoria: "Máquina",
          causaPotencial: "Ajuste manual",
          accion: "Ajustar regulador",
          responsable: "Juan",
          fechaLimite: "2026-10-15",
          estatus: "Completa" as const,
          esCausaRaiz: "SI" as const,
        },
      ],
      ishikawa: [
        {
          effect: "Desviación de presión en llenadora",
          causes: {
            Maquina: [{ text: "Sello desgastado" }, { text: "Resorte vencido" }, { text: "Sensor sucio" }],
          },
        },
      ],
      validationActions: [
        {
          id: "va1",
          categoria: "Maquina",
          causaPotencial: "Sello desgastado",
          accion: "Inspección física",
          responsable: "Juan",
          fechaLimite: "2026-10-16",
          estatus: "Completa" as const,
          esCausaRaiz: "SI" as const,
        },
      ],
      pda: [
        {
          id: "pda1",
          accion: "Reemplazar sello y calibrar válvula",
          responsable: "Juan",
          fecha: "2026-10-20",
          status: "Completada" as const,
          done: true,
        },
      ],
      efectividadRda: {
        indicadorEvaluado: "Presión",
        items: [],
        resultado: "Sin recurrencia en 30 días",
      },
    };

    const res = evaluateRdaMethodology(completeRda);
    expect(res.scorePct).toBe(100);
    expect(res.suggestedQualityEval.definicionProblema).toBe(5);
    expect(res.suggestedQualityEval.causaRaiz).toBe(5);
  });

  it("evalúa un PDCA completo con 100% de consistencia metodológica", () => {
    const res = evaluatePdcaMethodology({
      kpiLabel: "Extracto Aparente",
      desdeVal: "2.1",
      aVal: "1.8",
      hasParetoOrCorrelation: true,
      ishikawaCausesCount: 4,
      fiveWhysCount: 2,
      rootCauseConclusionsCount: 2,
      actionsCount: 3,
      actionsWithOwnerCount: 3,
      hasAfterComparison: true,
      sdcaCheckedCount: 5,
    });
    expect(res.criteria).toHaveLength(5);
    expect(res.scorePct).toBe(100);
  });
});
