// @ts-nocheck
/**
 * RdaPhase3ValidationSteps.tsx
 * Pasos de validación de causas raíz, plan de acción (PDA) y checklist de estandarización dentro de la Fase 3 del RDA.
 */
import { useTranslation } from "react-i18next";
import React from "react";
import { toast } from "sonner";
import type { Rda, RdaEvidenceItem, RdaValidationAction } from "@/data/rda";
import type { ActionItem } from "@/data/pdca";
import { RdaValidationTable } from "./RdaValidationTable";
import { RdaEvidenceTab } from "./RdaEvidenceTab";
import { RdaChecklistEstandarizacion } from "./RdaChecklistEstandarizacion";
import { ActionPlanTable } from "@/components/pdca/2.DO/paso18/action-plan-table";
import { EvidenciasSolucionStep } from "@/components/pdca/2.DO/paso19/evidencias-solucion-step";
import { crearFilaAccionVacia } from "@/components/pdca/2.DO/paso18/utils/action-plan-utils";
import { StepCard } from "@/components/ui/step-card";
import { getRdaName } from "./rda-name";

// Pasos de la fase 3 posteriores al Análisis Estadístico:
// 9. Plan de Validación
// 10. Evidencias de Validación
// 11. Checklist de Estandarización y Gestión del Conocimiento
// 12. PDA (Prevención de Recurrencia) = paso 18 del PDCA

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

const MAPA_CATEGORIAS_ISHIKAWA: Record<string, string> = {
  machine: "Máquina",
  method: "Método",
  material: "Material",
  manpower: "Mano de obra",
  man: "Mano de obra",
  measurement: "Medición",
  environment: "Medio ambiente",
};

function isRootCauseConfirmed(val?: string): boolean {
  const norm = String(val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  return norm === "SI";
}

/**
 * Sincroniza de forma automática las causas potenciales del Paso 9 (Plan de Validación)
 * que tengan "¿Es Causa Raíz? = Sí" hacia la columna "Causa Raíz" del Paso 12 (PDA).
 */
export function syncRootCausesToPda(
  validationActions: RdaValidationAction[],
  currentPda: ActionItem[],
  defaultTopic: string,
  prevValidationActions?: RdaValidationAction[],
): { nextPda: ActionItem[]; changed: boolean } {
  let changed = false;
  let list = currentPda.map((item) => ({ ...item })) as (ActionItem & {
    sourceValidationId?: string;
  })[];

  const confirmedMap = new Map<string, RdaValidationAction>();
  (validationActions || []).forEach((v) => {
    if (isRootCauseConfirmed(v.esCausaRaiz) && String(v.causaPotencial || "").trim() !== "") {
      confirmedMap.set(v.id, v);
    }
  });

  // Causas que antes estaban en "SI" y ahora cambiaron a "NO"/"Pendiente" o se eliminaron
  const unconfirmedCausesLower = new Set<string>();
  const unconfirmedIds = new Set<string>();
  (prevValidationActions || []).forEach((prev) => {
    if (isRootCauseConfirmed(prev.esCausaRaiz) && !confirmedMap.has(prev.id)) {
      unconfirmedIds.add(prev.id);
      const text = String(prev.causaPotencial || "").trim().toLowerCase();
      if (text) unconfirmedCausesLower.add(text);
    }
  });
  (validationActions || []).forEach((curr) => {
    if (!isRootCauseConfirmed(curr.esCausaRaiz)) {
      unconfirmedIds.add(curr.id);
    }
  });

  // 1. Si una causa dejó de ser "Sí" y su fila en el Paso 12 no tiene una acción correctiva escrita aún, retirarla
  const filteredList = list.filter((p) => {
    const hasCustomAction = String(p.accion || "").trim() !== "";
    if (p.sourceValidationId && !confirmedMap.has(p.sourceValidationId) && !hasCustomAction) {
      changed = true;
      return false;
    }
    const pCausaLower = String(p.causaRaiz || "").trim().toLowerCase();
    if (
      !p.sourceValidationId &&
      pCausaLower &&
      unconfirmedCausesLower.has(pCausaLower) &&
      !hasCustomAction
    ) {
      changed = true;
      return false;
    }
    return true;
  });
  list = filteredList;

  // 2. Por cada causa potencial con "¿Es Causa Raíz? = Sí", colocarla o actualizarla en el Paso 12
  confirmedMap.forEach((v) => {
    const causaTexto = String(v.causaPotencial || "").trim();
    const causaLower = causaTexto.toLowerCase();

    // Buscar si ya existe por sourceValidationId o por texto de causaRaiz
    let existingIdx = list.findIndex((p) => p.sourceValidationId === v.id);
    if (existingIdx === -1) {
      existingIdx = list.findIndex(
        (p) =>
          !p.sourceValidationId &&
          String(p.causaRaiz || "").trim().toLowerCase() === causaLower,
      );
    }

    if (existingIdx !== -1) {
      const existing = list[existingIdx]!;
      const nextTema = String(existing.tema || "").trim() || defaultTopic;
      if (
        existing.causaRaiz !== causaTexto ||
        existing.sourceValidationId !== v.id ||
        existing.tema !== nextTema
      ) {
        list[existingIdx] = {
          ...existing,
          sourceValidationId: v.id,
          tema: nextTema,
          causaRaiz: causaTexto,
        };
        changed = true;
      }
    } else {
      // Buscar si hay una fila completamente vacía sin usar para reutilizarla
      const blankIdx = list.findIndex(
        (p) =>
          !p.sourceValidationId &&
          !String(p.tema || "").trim() &&
          !String(p.causaRaiz || "").trim() &&
          !String(p.accion || "").trim(),
      );

      const newRow: ActionItem & { sourceValidationId?: string } = {
        ...crearFilaAccionVacia(),
        sourceValidationId: v.id,
        tema: defaultTopic,
        causaRaiz: causaTexto,
        accion: "",
        priorizar: "SI",
      };

      if (blankIdx !== -1) {
        list[blankIdx] = {
          ...newRow,
          id: list[blankIdx]!.id,
        };
      } else {
        list.push(newRow);
      }
      changed = true;
    }
  });

  return { nextPda: list, changed };
}

export function RdaPhase3ValidationSteps({ rda, onChange }: Props) {
  const { t } = useTranslation();

  const isStepCompleted = (stepId: string) => rda.completedSteps?.includes(stepId) || false;
  const isStepNa = (stepId: string) => rda.naSteps?.includes(stepId) || false;

  const toggleStep = (stepId: string) => {
    const completed = rda.completedSteps || [];
    const na = rda.naSteps || [];
    if (completed.includes(stepId)) {
      onChange({ ...rda, completedSteps: completed.filter((s) => s !== stepId) });
    } else {
      onChange({
        ...rda,
        completedSteps: [...completed, stepId],
        naSteps: na.filter((s) => s !== stepId),
      });
    }
  };

  const toggleNa = (stepId: string) => {
    const na = rda.naSteps || [];
    const completed = rda.completedSteps || [];
    if (na.includes(stepId)) {
      onChange({ ...rda, naSteps: na.filter((s) => s !== stepId) });
    } else {
      onChange({
        ...rda,
        naSteps: [...na, stepId],
        completedSteps: completed.filter((s) => s !== stepId),
      });
    }
  };

  const stepProps = (stepId: string) => ({
    defaultExpanded: true,
    isStepCompleted: isStepCompleted(stepId),
    isNa: isStepNa(stepId),
    onToggleStep: () => toggleStep(stepId),
    onToggleNa: () => toggleNa(stepId),
  });

  const handleImportFromIshikawa = () => {
    const causesObj = rda.ishikawa?.[0]?.causes || {};
    const actuales = [...(rda.validationActions || [])];
    let agregadas = 0;

    Object.entries(causesObj).forEach(([claveCat, lista]) => {
      const categoriaNombre = MAPA_CATEGORIAS_ISHIKAWA[claveCat] || "Método";
      const causasArr = Array.isArray(lista) ? lista : Object.values(lista || {});
      causasArr.forEach((causaRaw, idx) => {
        const texto = String(causaRaw || "").trim();
        if (!texto) return;
        const yaExiste = actuales.some(
          (item) => String(item.causaPotencial || "").trim().toLowerCase() === texto.toLowerCase(),
        );
        if (!yaExiste) {
          actuales.push({
            id: `${Date.now()}-${claveCat}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            categoria: categoriaNombre,
            causaPotencial: texto,
            accion: "",
            responsable: "",
            fechaLimite: "",
            estatus: "Pendiente",
            esCausaRaiz: "Pendiente",
          });
          agregadas++;
        }
      });
    });

    if (agregadas === 0) {
      toast.info("No se encontraron causas nuevas en el Diagrama de Ishikawa para importar.");
      return;
    }

    onChange({ ...rda, validationActions: actuales });
    toast.success(`Se importaron ${agregadas} causa(s) del Ishikawa al Plan de Validación.`);
  };

  const efectoProblema = getRdaName(rda) || rda.title || "Anomalía RDA";

  // Sincronización automática: si en el Paso 9 ya hay causas con "¿Es Causa Raíz? = Sí"
  // que aún no están en el Paso 12 (PDA), colocarlas automáticamente al cargar/actualizar.
  React.useEffect(() => {
    const { nextPda, changed } = syncRootCausesToPda(
      rda.validationActions || [],
      rda.pda || [],
      efectoProblema,
    );
    if (changed) {
      onChange({ ...rda, pda: nextPda });
    }
  }, [rda.validationActions]);

  const handleValidationActionsChange = (newActions: RdaValidationAction[]) => {
    const { nextPda } = syncRootCausesToPda(
      newActions,
      rda.pda || [],
      efectoProblema,
      rda.validationActions || [],
    );
    onChange({
      ...rda,
      validationActions: newActions,
      pda: nextPda,
    });
  };

  return (
    <>
      <StepCard title={t("rdaInternal.validationPlan")} {...stepProps("rda-step-9")}>
        <RdaValidationTable
          items={rda.validationActions || []}
          onChange={handleValidationActionsChange}
          onImportFromIshikawa={handleImportFromIshikawa}
        />

        <div className="mt-8 border-t pt-8">
          <RdaEvidenceTab
            title={t("rdaInternal.evidenceByAction")}
            description={t("rdaInternal.evidenceDesc")}
            items={rda.evidenciasValidacion || []}
            onChange={(newEvidencias) => onChange({ ...rda, evidenciasValidacion: newEvidencias })}
            validationActions={rda.validationActions || []}
          />
        </div>
      </StepCard>

      <StepCard
        title={t("rdaInternal.standardizationChecklist")}
        {...stepProps("rda-step-11")}
      >
        <div className="overflow-x-auto w-full py-4">
          <RdaChecklistEstandarizacion
            data={rda.checklistEstandarizacion || {}}
            onChange={(newData) => onChange({ ...rda, checklistEstandarizacion: newData })}
          />
        </div>
      </StepCard>

      <div className="overflow-x-auto w-full">
        <ActionPlanTable
          title={t("rdaInternal.pdaRecurrencePrevention")}
          items={rda.pda || []}
          onChange={(newItems) => onChange({ ...rda, pda: newItems })}
          isStepCompleted={isStepCompleted("rda-step-12")}
          isNa={isStepNa("rda-step-12")}
          onToggleStep={() => toggleStep("rda-step-12")}
          onToggleNa={() => toggleNa("rda-step-12")}
          bottomContent={
            <div className="mt-8 border-t pt-8">
              <EvidenciasSolucionStep
                title={t("rdaInternal.pdaEvidence")}
                actions={rda.pda || []}
                evidencias={(rda.evidenciasEliminacionCausa || []).map((e) => ({
                  actionId: e.id,
                  image: e.images?.[0],
                  images: e.images || [],
                }))}
                onEvidenciasChange={(newEvs) =>
                  onChange({
                    ...rda,
                    evidenciasEliminacionCausa: newEvs.map((ev) => ({
                      id: ev.actionId,
                      title: "",
                      description: "",
                      images:
                        Array.isArray(ev.images) && ev.images.length > 0
                          ? ev.images
                          : ev.image
                            ? [ev.image]
                            : [],
                    })) as RdaEvidenceItem[],
                  })
                }
                hideStepCard={true}
              />
            </div>
          }
        />
      </div>

      {/* Reporte de cierre */}
      <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
        <div className="bg-[#0078D7] px-4 py-2 text-center font-bold text-xs uppercase text-white">
          Reporte de cierre
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#0078D7] text-white">
                <th className="border-r border-white/20 p-2 font-bold uppercase text-[10px] text-center">
                  ¿Las acciones correctivas eliminaron la causa raíz?
                </th>
                <th className="border-r border-white/20 p-2 font-bold uppercase text-[10px] text-center">
                  ¿Es requerido escalarlo a nivel de zona?
                </th>
                <th className="border-r border-white/20 p-2 font-bold uppercase text-[10px] text-center">
                  ¿Se necesita CAPEX?
                </th>
                <th className="border-r border-white/20 p-2 font-bold uppercase text-[10px] text-center">
                  ¿Se incluye como GOP/Buena Práctica/Innovación?
                </th>
                <th className="p-2 font-bold uppercase text-[10px] text-center">
                  Fecha de finalización
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {(
                  [
                    "eliminoCausaRaiz",
                    "requiereEscalar",
                    "necesitaCapex",
                    "incluyeComoGop",
                  ] as const
                ).map((field) => {
                  const val = Boolean(rda.closure?.[field]);
                  return (
                    <td key={field} className="border-r border-border p-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...rda,
                            closure: {
                              eliminoCausaRaiz: false,
                              requiereEscalar: false,
                              necesitaCapex: false,
                              incluyeComoGop: false,
                              fechaFinalizacion: "",
                              ...(rda.closure || {}),
                              [field]: !val,
                            },
                          })
                        }
                        className="px-4 py-1.5 rounded-sm font-bold text-xs text-white bg-[#3C7D22] hover:bg-[#2f631b] transition-colors min-w-[70px] cursor-pointer"
                      >
                        {val ? t("rdaInternal.yes", "Sí") : t("rdaInternal.no", "No")}
                      </button>
                    </td>
                  );
                })}
                <td className="p-2 text-center">
                  <input
                    type="date"
                    value={rda.closure?.fechaFinalizacion || ""}
                    onChange={(e) =>
                      onChange({
                        ...rda,
                        closure: {
                          eliminoCausaRaiz: false,
                          requiereEscalar: false,
                          necesitaCapex: false,
                          incluyeComoGop: false,
                          ...(rda.closure || {}),
                          fechaFinalizacion: e.target.value,
                        },
                      })
                    }
                    className="h-8 rounded border border-input bg-background px-2 text-xs text-center"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
