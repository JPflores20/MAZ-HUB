import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, UploadCloud, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Rda } from "@/data/rda";
import { cn } from "@/lib/utils";

import { RdaPhase1Resumen } from "./RdaPhase1Resumen";
import { RdaPhase2Problem } from "./RdaPhase2Problem";
import { RdaPhase3Analysis } from "./RdaPhase3Analysis";
import { RdaPhase6QualityEval } from "./RdaPhase6QualityEval";
import { RdaPhase7EffectivenessEval } from "./RdaPhase7EffectivenessEval";

interface RdaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rda: Rda | null;
  onSave?: (rda: Rda) => void;
}

type RdaPhase =
  | "1. Resumen"
  | "2. Descripción del Problema"
  | "3. Análisis de Causas Raíz"
  | "4. Evaluación de Calidad RDA"
  | "5. Evaluación de Efectividad de RDA";

const RDA_PHASES: { id: RdaPhase; label: string }[] = [
  { id: "1. Resumen", label: "1. Resumen" },
  { id: "2. Descripción del Problema", label: "2. Descripción del Problema" },
  { id: "3. Análisis de Causas Raíz", label: "3. Análisis de Causas Raíz" },
  { id: "4. Evaluación de Calidad RDA", label: "4. Evaluación de Calidad RDA" },
  { id: "5. Evaluación de Efectividad de RDA", label: "5. Evaluación de Efectividad de RDA" },
];

export function RdaDialog({ open, onOpenChange, rda, onSave }: RdaDialogProps) {
  const { t } = useTranslation();

  const [localRda, setLocalRda] = useState<Rda | null>(null);
  const [activeTab, setActiveTab] = useState<RdaPhase>("1. Resumen");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rda && open) {
      setLocalRda({ ...rda });
      setActiveTab("1. Resumen");
    }
  }, [rda, open]);

  if (!localRda) return null;

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave(localRda);
      setIsSaving(false);
    }
  };

  const togglePhaseComplete = (e: React.MouseEvent, phaseId: RdaPhase) => {
    e.stopPropagation();
    setLocalRda((prev) => {
      if (!prev) return prev;
      const completed = prev.completedPhases || [];
      if (completed.includes(phaseId)) {
        return { ...prev, completedPhases: completed.filter((id) => id !== phaseId) };
      } else {
        return { ...prev, completedPhases: [...completed, phaseId] };
      }
    });
  };

  const getPhaseTabColors = (id: RdaPhase, isCurrent: boolean, isCompleted: boolean) => {
    if (isCurrent) {
      switch (id) {
        case "1. Resumen":
          return "bg-purple-600 text-white shadow-sm";
        case "2. Descripción del Problema":
          return "bg-blue-600 text-white shadow-sm";
        case "3. Análisis de Causas Raíz":
          return "bg-orange-500 text-white shadow-sm";
        case "4. Evaluación de Calidad RDA":
          return "bg-teal-600 text-white shadow-sm";
        case "5. Evaluación de Efectividad de RDA":
          return "bg-indigo-600 text-white shadow-sm";
      }
    }
    switch (id) {
      case "1. Resumen":
        return "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20";
      case "2. Descripción del Problema":
        return "bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:bg-blue-900/30";
      case "3. Análisis de Causas Raíz":
        return "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20";
      case "4. Evaluación de Calidad RDA":
        return "bg-teal-600/10 text-teal-700 hover:bg-teal-600/20";
      case "5. Evaluación de Efectividad de RDA":
        return "bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/20";
    }
  };

  const currentIndex = RDA_PHASES.findIndex((p) => p.id === activeTab);
  const isCompletable = (pid: string) =>
    !pid.startsWith("1.") && !pid.startsWith("4.") && !pid.startsWith("5.");

  // Progreso: pasos que cuentan (fases 2 y 3)
  const RDA_PROGRESS_STEP_IDS = [
    "rda-step-1",
    "rda-step-2",
    "rda-step-3",
    "rda-step-4",
    "rda-step-5",
    "rda-step-6",
    "rda-step-7",
    "rda-step-8",
    "rda-step-9",
    "rda-step-10",
    "rda-step-11",
    "rda-step-12",
  ];
  const TOTAL_RDA_STEPS = RDA_PROGRESS_STEP_IDS.length;
  const doneOrNa = new Set([...(localRda.completedSteps || []), ...(localRda.naSteps || [])]);
  const uniqueCompletedSteps = RDA_PROGRESS_STEP_IDS.filter((id) => doneOrNa.has(id)).length;
  const progressPct = Math.round((uniqueCompletedSteps / TOTAL_RDA_STEPS) * 100) || 0;

  return (
    <div id="rda-content" className="space-y-6">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t("rda.backToMyRdas")}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
              {localRda.id || t("rda.newRda")}
            </span>
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
              {activeTab}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {t("rda.statusLabel")} {localRda.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-2">
              {isSaving ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                  <UploadCloud className="size-3.5 animate-bounce" /> {t("rda.saving")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <Check className="size-3.5" />
                  {t("rda.synchronized")}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <UploadCloud className="size-3.5" />
              {t("rda.saveRda")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
            {localRda.title || t("rda.newRda")}
          </h1>

          <div className="flex-shrink-0 text-right min-w-[180px]">
            <div className="text-sm font-semibold text-foreground whitespace-nowrap">
              {t("rda.rdaProgress")}
              <span className="text-primary">{progressPct}%</span>
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                ({uniqueCompletedSteps}/{TOTAL_RDA_STEPS} pasos)
              </span>
            </div>
            <Progress value={progressPct} className="h-2 mt-1.5" />
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("rda-stepper-scroll");
            if (el) el.scrollBy({ left: -200, behavior: "smooth" });
          }}
          className="flex-shrink-0 flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Anterior"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          id="rda-stepper-scroll"
          className="flex flex-1 items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {RDA_PHASES.map((phase, i) => {
            const isCurrent = i === currentIndex;
            const isCompleted = localRda.completedPhases?.includes(phase.id) || false;

            const getPhaseCheckColors = () => {
              if (isCompleted)
                return "bg-emerald-500 text-white border-transparent hover:bg-emerald-600";
              if (isCurrent)
                return "border-white/40 text-white/50 hover:border-white hover:text-white";
              switch (phase.id) {
                case "1. Resumen":
                  return "border-purple-500/30 text-purple-500/30 hover:border-purple-500 hover:text-purple-500";
                case "2. Descripción del Problema":
                  return "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500";
                case "3. Análisis de Causas Raíz":
                  return "border-orange-500/30 text-orange-500/30 hover:border-orange-500 hover:text-orange-500";
                case "4. Evaluación de Calidad RDA":
                  return "border-teal-600/30 text-teal-600/30 hover:border-teal-600 hover:text-teal-600";
                case "5. Evaluación de Efectividad de RDA":
                  return "border-indigo-600/30 text-indigo-600/30 hover:border-indigo-600 hover:text-indigo-600";
                default:
                  return "border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground hover:text-muted-foreground";
              }
            };

            return (
              <div
                key={phase.id}
                onClick={() => setActiveTab(phase.id)}
                className={cn(
                  "flex flex-1 items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none whitespace-nowrap",
                  getPhaseTabColors(phase.id, isCurrent, isCompleted),
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                      isCurrent
                        ? "border-transparent bg-white/20 text-current"
                        : "border-current/20 text-current opacity-70",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-xs font-semibold uppercase tracking-wide truncate">
                      {phase.label.substring(3)}
                    </span>
                  </span>
                </div>

                {isCompletable(phase.id) && (
                  <button
                    type="button"
                    onClick={(e) => togglePhaseComplete(e, phase.id)}
                    className={cn(
                      "shrink-0 size-6 grid place-items-center rounded-full border-2 transition-all",
                      getPhaseCheckColors(),
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("rda-stepper-scroll");
            if (el) el.scrollBy({ left: 200, behavior: "smooth" });
          }}
          className="flex-shrink-0 flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Siguiente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mt-8">
        {activeTab === "1. Resumen" && <RdaPhase1Resumen rda={localRda} onChange={setLocalRda} />}
        {activeTab === "2. Descripción del Problema" && (
          <RdaPhase2Problem rda={localRda} onChange={setLocalRda} />
        )}
        {activeTab === "3. Análisis de Causas Raíz" && (
          <RdaPhase3Analysis rda={localRda} onChange={setLocalRda} />
        )}
        {activeTab === "4. Evaluación de Calidad RDA" && (
          <RdaPhase6QualityEval rda={localRda} onChange={setLocalRda} />
        )}
        {activeTab === "5. Evaluación de Efectividad de RDA" && (
          <RdaPhase7EffectivenessEval rda={localRda} onChange={setLocalRda} />
        )}
      </div>
    </div>
  );
}
