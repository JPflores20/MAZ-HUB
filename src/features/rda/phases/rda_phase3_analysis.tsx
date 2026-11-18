/**
 * @fileoverview Phase 3 (Root-Cause Analysis): Ishikawa 6M, optional Pareto/correlation/stats, and validation.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ParetoInteractive } from "@/features/pdca/plan/paso_10_pareto/pareto_interactive";
import { FlavorCorrelationSection } from "@/features/pdca/plan/paso_11_flavor_correlation/flavor_correlation_section";
import { IshikawaInteractivo } from "@/features/pdca/plan/paso_16_ishikawa/ishikawa_interactive";
import { MultiImageUploadSection } from "@/features/pdca/image_upload";
import type { Rda } from "@/domain/models/rda";
import { get_rda_name, with_rda_name } from "../utils/rda_name";
import { create_rda_step_controls } from "../utils/rda_step_helpers";
import { RdaPhase3ValidationSteps } from "./rda_phase3_validation_steps";

interface RdaPhase3AnalysisProps {
  rda: Rda;
  onChange: (rda: Rda) => void;
  onForceSave?: () => void;
}

/** Coordinates Steps 5–12 of the RDA Root-Cause Analysis workflow. */
export function RdaPhase3Analysis({ rda, onChange, onForceSave }: RdaPhase3AnalysisProps) {
  const { t } = useTranslation();
  const { is_step_completed, is_step_na, toggle_step, toggle_na } = create_rda_step_controls(
    rda,
    onChange,
  );

  const correlation_data = useMemo(() => {
    const raw_correlations = rda.correlaciones;
    if (raw_correlations && !Array.isArray(raw_correlations) && typeof raw_correlations === "object") {
      return raw_correlations;
    }
    return {
      seriesList: Array.isArray(raw_correlations) ? raw_correlations : [],
      positiveTitle: t("rdaInternal.positiveCorrelation"),
      negativeTitle: t("rdaInternal.negativeCorrelation"),
    };
  }, [rda.correlaciones, t]);

  const ishikawa_list = rda.ishikawa?.length
    ? rda.ishikawa
    : [
        {
          id: "ishikawa-0",
          title: t("rdaInternal.mainProblem"),
          effect: get_rda_name(rda),
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

  const handle_ishikawa_change = (
    diagram_index: number,
    updated_ishikawa: NonNullable<Rda["ishikawa"]>[number],
  ) => {
    const updated_list = [...ishikawa_list];
    updated_list[diagram_index] = updated_ishikawa;
    onChange({ ...rda, ishikawa: updated_list });
  };

  const primary_ishikawa = ishikawa_list[0]!;

  return (
    <div className="space-y-8">
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
              onChange={(change_event) =>
                onChange({ ...rda, analizadoEnOtrosReportes: change_event.target.value })
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
              onChange={(change_event) =>
                onChange({ ...rda, participantesRC: change_event.target.value })
              }
              placeholder="Nombres de los participantes..."
              className="h-8 w-full rounded border border-input bg-background px-2.5 text-xs font-medium text-blue-700 dark:text-blue-400 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <IshikawaInteractivo
        tituloPersonalizado={t("rdaInternal.ishikawaDiagram")}
        causasRegistradas={primary_ishikawa.causes || {}}
        alCambiarCausas={(causes_or_updater) => {
          const resolved_causes =
            typeof causes_or_updater === "function"
              ? causes_or_updater(primary_ishikawa.causes)
              : causes_or_updater;
          handle_ishikawa_change(0, { ...primary_ishikawa, causes: resolved_causes });
        }}
        efectoPrincipal={get_rda_name(rda)}
        alCambiarEfecto={(next_name) =>
          onChange(with_rda_name({ ...rda, ishikawa: ishikawa_list }, next_name))
        }
        hidePrioritizationTable={true}
        causasPriorizadas={primary_ishikawa.prioritizedCauses || []}
        alCambiarCausasPriorizadas={(prioritized_causes) =>
          handle_ishikawa_change(0, { ...primary_ishikawa, prioritizedCauses: prioritized_causes })
        }
        etiquetasPersonalizadas={primary_ishikawa.customLabels || {}}
        alCambiarEtiquetas={(labels_or_updater) => {
          const resolved_labels =
            typeof labels_or_updater === "function"
              ? labels_or_updater(primary_ishikawa.customLabels)
              : labels_or_updater;
          handle_ishikawa_change(0, { ...primary_ishikawa, customLabels: resolved_labels });
        }}
        isStepCompleted={is_step_completed("rda-step-5")}
        isNa={is_step_na("rda-step-5")}
        onToggleStep={() => toggle_step("rda-step-5")}
        onToggleNa={() => toggle_na("rda-step-5")}
        defaultExpanded={true}
      />

      <ParetoInteractive
        title={t("rdaInternal.paretosOptional")}
        level={0}
        pareto_items={rda.pareto_data_map?.["pareto_0"] || []}
        on_items_change={(pareto_items) => {
          const updated_map = { ...(rda.pareto_data_map || {}), pareto_0: pareto_items };
          onChange({ ...rda, pareto_data_map: updated_map });
        }}
        is_step_completed={is_step_completed("rda-step-6")}
        is_na={is_step_na("rda-step-6")}
        on_toggle_step={() => toggle_step("rda-step-6")}
        on_toggle_na={() => toggle_na("rda-step-6")}
        defaultExpanded={true}
      />

      <FlavorCorrelationSection
        title={t("rdaInternal.correlationsOptional")}
        data={correlation_data}
        onChange={(updated_correlations) => onChange({ ...rda, correlaciones: updated_correlations })}
        onForceSave={onForceSave}
        isStepCompleted={is_step_completed("rda-step-7")}
        isNa={is_step_na("rda-step-7")}
        onToggleStep={() => toggle_step("rda-step-7")}
        onToggleNa={() => toggle_na("rda-step-7")}
        defaultExpanded={true}
      />

      <MultiImageUploadSection
        title={t("rdaInternal.statisticalAnalysisOptional")}
        description={t("rdaInternal.statisticalAnalysisDesc")}
        images={rda.statistical_analysis_files || []}
        onChange={(uploaded_files) => onChange({ ...rda, statistical_analysis_files: uploaded_files })}
        maxImages={10}
        isStepCompleted={is_step_completed("rda-step-8")}
        isNa={is_step_na("rda-step-8")}
        onToggleStep={() => toggle_step("rda-step-8")}
        onToggleNa={() => toggle_na("rda-step-8")}
        defaultExpanded={true}
      />

      <RdaPhase3ValidationSteps rda={rda} onChange={onChange} />
    </div>
  );
}
