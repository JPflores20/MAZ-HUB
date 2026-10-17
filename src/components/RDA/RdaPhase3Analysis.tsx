/**
 * RdaPhase3Analysis.tsx
 * Fase 3 del RDA (Análisis de Causas Raíz). Integra lluvia de ideas, Diagrama de Ishikawa 6M, 5 Porqués, validación, PDA y estandarización.
 */
import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { IshikawaInteractivo } from "@/components/pdca/1.PLAN/paso16/ishikawa-interactive";
import { ParetoInteractive } from "@/components/pdca/1.PLAN/paso10/pareto/pareto_interactive";
import { FlavorCorrelationSection } from "@/components/pdca/1.PLAN/paso11/flavor-correlation-section";
import { MultiImageUploadSection } from "@/components/pdca/image-upload/index";
import { RdaPhase3ValidationSteps } from "./RdaPhase3ValidationSteps";
import { getRdaName, withRdaName } from "./rda-name";

// Phase 3: Analisis de Causas Raiz
// 5. Ishikawa
// 6. Paretos (NA)
// 7. Correlaciones (NA)
// 8. Analisis Estadistico (NA)

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
  onForceSave?: () => void;
}

export function RdaPhase3Analysis({ rda, onChange, onForceSave }: Props) {
  const { t } = useTranslation();

  const correlationData = React.useMemo(() => {
    const raw = rda.correlaciones;
    if (raw && !Array.isArray(raw) && typeof raw === "object") {
      return raw;
    }
    return {
      seriesList: Array.isArray(raw) ? raw : [],
      positiveTitle: t("rdaInternal.positiveCorrelation"),
      negativeTitle: t("rdaInternal.negativeCorrelation"),
    };
  }, [rda.correlaciones, t]);

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
  // Setup Ishikawa adapter logic (sin mutar el prop `rda`)
  const ishikawas = rda.ishikawa?.length
    ? rda.ishikawa
    : [
        {
          id: "ishikawa-0",
          title: t("rdaInternal.mainProblem"),
          effect: getRdaName(rda),
          causes: {
            machine: [""],
            method: [""],
            material: [""],
            man: [""],
            measurement: [""],
            environment: [""],
          },
          prioritizedCauses: [],
          customLabels: {},
        },
      ];

  const handleIshikawaChange = (idx: number, newIshikawa: NonNullable<Rda["ishikawa"]>[number]) => {
    const updated = [...ishikawas];
    updated[idx] = newIshikawa;
    onChange({ ...rda, ishikawa: updated });
  };

  const currentIshikawa = ishikawas[0];

  return (
    <div className="space-y-8">
      {/* Encabezado de Análisis de Causa Raíz (Otros reportes y Participantes) */}
      <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
        <div className="bg-[#0078D7] px-4 py-2 text-center font-bold text-xs uppercase text-white">
          {t("rda.rootCauseAnalysisWarning")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="md:col-span-4 bg-[#0078D7] px-3 py-2.5 flex items-center justify-center text-center font-bold text-[11px] uppercase text-white">
            {t("rdaInternal.analyzedInOtherReports")}
          </div>
          <div className="md:col-span-2 p-2 flex items-center justify-center bg-background">
            <select
              value={rda.analizadoEnOtrosReportes || "No"}
              onChange={(e) =>
                onChange({ ...rda, analizadoEnOtrosReportes: e.target.value })
              }
              className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-semibold text-center text-blue-700 dark:text-blue-400"
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
          <div className="md:col-span-2 bg-[#0078D7] px-3 py-2.5 flex items-center justify-center text-center font-bold text-[11px] uppercase text-white">
            {t("rda.participants")}
          </div>
          <div className="md:col-span-4 p-2 flex items-center bg-background">
            <input
              type="text"
              value={rda.participantesRC || ""}
              onChange={(e) => onChange({ ...rda, participantesRC: e.target.value })}
              placeholder="Nombres de los participantes..."
              className="h-8 w-full rounded border border-input bg-background px-2.5 text-xs font-medium text-blue-700 dark:text-blue-400 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 5. Ishikawa */}
      <IshikawaInteractivo
        tituloPersonalizado={t("rdaInternal.ishikawaDiagram")}
        causasRegistradas={currentIshikawa.causes || {}}
        alCambiarCausas={(newCausesOrUpdater) => {
          const resolved =
            typeof newCausesOrUpdater === "function"
              ? newCausesOrUpdater(currentIshikawa.causes)
              : newCausesOrUpdater;
          handleIshikawaChange(0, { ...currentIshikawa, causes: resolved });
        }}
        efectoPrincipal={getRdaName(rda)}
        alCambiarEfecto={(name) => onChange(withRdaName({ ...rda, ishikawa: ishikawas }, name))}
        hidePrioritizationTable={true}
        causasPriorizadas={currentIshikawa.prioritizedCauses || []}
        alCambiarCausasPriorizadas={(prioritizedCauses) =>
          handleIshikawaChange(0, { ...currentIshikawa, prioritizedCauses })
        }
        etiquetasPersonalizadas={currentIshikawa.customLabels || {}}
        alCambiarEtiquetas={(labelsOrUpdater) => {
          const resolved =
            typeof labelsOrUpdater === "function"
              ? labelsOrUpdater(currentIshikawa.customLabels)
              : labelsOrUpdater;
          handleIshikawaChange(0, { ...currentIshikawa, customLabels: resolved });
        }}
        isStepCompleted={isStepCompleted("rda-step-5")}
        isNa={isStepNa("rda-step-5")}
        onToggleStep={() => toggleStep("rda-step-5")}
        onToggleNa={() => toggleNa("rda-step-5")}
      />

      {/* 6. Paretos (Opcional) */}
      <ParetoInteractive
        title={t("rdaInternal.paretosOptional")}

        level={0}
        pareto_items={rda.pareto_data_map?.["pareto_0"] || []}
        on_items_change={(items) => {
          const newMap = { ...(rda.pareto_data_map || {}) };
          newMap["pareto_0"] = items;
          onChange({ ...rda, pareto_data_map: newMap });
        }}
        is_step_completed={isStepCompleted("rda-step-6")}
        is_na={isStepNa("rda-step-6")}
        on_toggle_step={() => toggleStep("rda-step-6")}
        on_toggle_na={() => toggleNa("rda-step-6")}
      />

      {/* 7. Correlaciones (Opcional) */}
      <FlavorCorrelationSection
        title={t("rdaInternal.correlationsOptional")}
        data={correlationData}
        onChange={(newData) => onChange({ ...rda, correlaciones: newData })}
        onForceSave={onForceSave}
        isStepCompleted={isStepCompleted("rda-step-7")}
        isNa={isStepNa("rda-step-7")}
        onToggleStep={() => toggleStep("rda-step-7")}
        onToggleNa={() => toggleNa("rda-step-7")}
      />

      {/* 8. Análisis Estadístico (Opcional) */}
      <MultiImageUploadSection
        title={t("rdaInternal.statisticalAnalysisOptional")}

        description={t("rdaInternal.statisticalAnalysisDesc")}
        images={rda.statistical_analysis_files || []}
        onChange={(files) => onChange({ ...rda, statistical_analysis_files: files })}
        maxImages={10}
        isStepCompleted={isStepCompleted("rda-step-8")}
        isNa={isStepNa("rda-step-8")}
        onToggleStep={() => toggleStep("rda-step-8")}
        onToggleNa={() => toggleNa("rda-step-8")}
      />

      {/* 9-12: Validación, Checklist y PDA */}
      <RdaPhase3ValidationSteps rda={rda} onChange={onChange} />
    </div>
  );
}
