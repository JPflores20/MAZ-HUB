import { useTranslation } from "react-i18next";
import React from "react";
import type { Rda } from "@/data/rda";
import { IshikawaInteractivo } from "@/components/pdca/1.PLAN/paso16/ishikawa-interactive";
import { ParetoInteractive } from "@/components/pdca/1.PLAN/paso10/pareto/pareto_interactive";
import { FlavorCorrelationSection } from "@/components/pdca/1.PLAN/paso11/flavor-correlation-section";
import { MultiImageUploadSection } from "@/components/pdca/image-upload/index";
import { RdaPhase3ValidationSteps } from "./RdaPhase3ValidationSteps";

// Phase 3: Analisis de Causas Raiz
// 5. Ishikawa
// 6. Paretos (NA)
// 7. Correlaciones (NA)
// 8. Analisis Estadistico (NA)

interface Props {
  rda: Rda;
  onChange: (rda: Rda) => void;
}

export function RdaPhase3Analysis({ rda, onChange }: Props) {
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
  // Setup Ishikawa adapter logic
  const ishikawas = rda.ishikawa || [];
  if (ishikawas.length === 0) {
    // initialize at least one
    ishikawas.push({
      id: crypto.randomUUID(),
      title: t("rdaInternal.mainProblem"),
      effect: rda.title || "",
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
    });
  }

  const handleIshikawaChange = (idx: number, newIshikawa: any) => {
    const updated = [...ishikawas];
    updated[idx] = newIshikawa;
    onChange({ ...rda, ishikawa: updated });
  };

  const currentIshikawa = ishikawas[0];

  return (
    <div className="space-y-8">
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
        efectoPrincipal={currentIshikawa.effect || ""}
        alCambiarEfecto={(effect) => handleIshikawaChange(0, { ...currentIshikawa, effect })}
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
        data={{
          seriesList: rda.correlaciones || [],
          positiveTitle: t("rdaInternal.positiveCorrelation"),
          negativeTitle: t("rdaInternal.negativeCorrelation"),
        }}
        onChange={(newData) => onChange({ ...rda, correlaciones: newData.seriesList })}
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
