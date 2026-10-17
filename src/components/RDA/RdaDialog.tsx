/**
 * RdaDialog.tsx
 * Contenedor principal del editor de Reportes de Anomalía (RDA).
 * Gestiona la navegación entre las 5 fases metodológicas, el marcado de fases/pasos,
 * el cálculo de progreso y el autoguardado sincronizado con Firestore.
 */
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Save, UploadCloud, Check, AlertTriangle, CircleDot } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Rda } from "@/data/rda";
import { cn } from "@/lib/utils";
import { DocumentTooLargeError } from "@/services/inline-media";

import { RdaPhase1Resumen } from "./RdaPhase1Resumen";
import { RdaPhase2Problem } from "./RdaPhase2Problem";
import { RdaPhase3Analysis } from "./RdaPhase3Analysis";
import { RdaPhase6QualityEval } from "./RdaPhase6QualityEval";
import { RdaPhase7EffectivenessEval } from "./RdaPhase7EffectivenessEval";
import { getRdaDisplayName, normalizeRdaName } from "./rda-name";
import { getRdaStatus, isRdaPhaseComplete, RDA_PHASE_STEP_IDS } from "./rda-status";

interface RdaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rda: Rda | null;
  /** Debe persistir el RDA y devolver la versión guardada; debe lanzar error si falla. */
  onSave?: ((rda: Rda) => Promise<Rda>) | undefined;
}

const AUTOSAVE_DELAY_MS = 2500;

function describeSaveError(error: unknown): string {
  if (error instanceof DocumentTooLargeError) {
    return `${error.message} Elimina o reduce algunas imágenes y vuelve a intentar.`;
  }
  const code = (error as { code?: string } | null)?.code;
  if (code === "permission-denied" || code === "unauthenticated") {
    return "No tienes permiso para guardar este RDA. Cierra sesión y vuelve a entrar.";
  }
  if (code === "unavailable" || code === "deadline-exceeded") {
    return "Sin conexión con el servidor. Revisa tu internet; tus cambios siguen en pantalla.";
  }
  if (code === "storage/unauthorized" || code?.startsWith("storage/")) {
    return "No se pudo subir una de las imágenes del RDA. Inténtalo de nuevo.";
  }
  return "No se pudieron guardar los cambios del RDA. Tus cambios siguen en pantalla; inténtalo de nuevo.";
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [recoverableDraft, setRecoverableDraft] = useState<{ rda: Rda; savedAt: string } | null>(null);

  // JSON de la última versión confirmada por Firestore (para detectar cambios sin guardar).
  const lastSavedJson = useRef<string>("");
  // Siempre apunta a la versión más reciente del RDA en edición.
  const latestRda = useRef<Rda | null>(null);
  latestRda.current = localRda;
  // Guardado en curso (los guardados se serializan para no pisarse).
  const inFlight = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    if (rda && open) {
      const normalized = normalizeRdaName({ ...rda });
      const hasPhaseOrStepData =
        (normalized.completedPhases && normalized.completedPhases.length > 0) ||
        (normalized.completedSteps && normalized.completedSteps.length > 0) ||
        (normalized.naSteps && normalized.naSteps.length > 0);

      if (!hasPhaseOrStepData) {
        if (normalized.status === "Evaluado") {
          normalized.completedPhases = RDA_PHASES.map((p) => p.id);
        } else if (normalized.status === "Cerrado") {
          normalized.completedPhases = [
            "1. Resumen",
            "2. Descripción del Problema",
            "3. Análisis de Causas Raíz",
          ];
        }
      }

      const initialJson = JSON.stringify(normalized);
      setLocalRda(normalized);
      lastSavedJson.current = initialJson;
      setSaveState("idle");
      setActiveTab("1. Resumen");

      // Verificar si existe un borrador local no sincronizado en localStorage (0 lecturas a Firestore)
      try {
        const rawDraft = localStorage.getItem(`maz_hub_rda_draft_${normalized.id}`);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft) as { rda?: Rda; savedAt?: string };
          if (parsed?.rda && parsed?.savedAt && JSON.stringify(parsed.rda) !== initialJson) {
            setRecoverableDraft({ rda: parsed.rda, savedAt: parsed.savedAt });
          } else {
            localStorage.removeItem(`maz_hub_rda_draft_${normalized.id}`);
            setRecoverableDraft(null);
          }
        } else {
          setRecoverableDraft(null);
        }
      } catch {
        setRecoverableDraft(null);
      }
    }
  }, [rda, open]);

  const isDirty = localRda ? JSON.stringify(localRda) !== lastSavedJson.current : false;

  // Respaldo inmediato en localStorage cuando hay cambios pendientes (0 escrituras en Firestore)
  useEffect(() => {
    if (!localRda || !isDirty) return;
    try {
      localStorage.setItem(
        `maz_hub_rda_draft_${localRda.id}`,
        JSON.stringify({ rda: localRda, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Ignorar si localStorage excede cuota
    }
  }, [localRda, isDirty]);

  const handleRestoreDraft = () => {
    if (!recoverableDraft) return;
    setLocalRda(recoverableDraft.rda);
    setRecoverableDraft(null);
    toast.success("Borrador local del RDA restaurado");
  };

  const handleDiscardDraft = () => {
    if (localRda) {
      try {
        localStorage.removeItem(`maz_hub_rda_draft_${localRda.id}`);
      } catch {
        // Ignorar errores de localStorage
      }
    }
    setRecoverableDraft(null);
  };

  const persist = useCallback(async (): Promise<boolean> => {
    if (!onSave) return true;
    while (inFlight.current) await inFlight.current;

    const snapshot = latestRda.current;
    if (!snapshot) return true;
    const snapshotJson = JSON.stringify(snapshot);
    if (snapshotJson === lastSavedJson.current) return true;

    setSaveState("saving");
    const task = (async () => {
      try {
        const currentStatus = getRdaStatus(snapshot, { ignoreLegacyStatus: true });
        const toSave = snapshot.status !== currentStatus ? { ...snapshot, status: currentStatus } : snapshot;
        const saved = await onSave(toSave);
        if (latestRda.current === snapshot) {
          // Nadie editó mientras guardábamos: adoptamos la versión guardada
          // (trae URLs de Storage en lugar de base64 y el nuevo updatedAt).
          lastSavedJson.current = JSON.stringify(saved);
          setLocalRda(saved);
          try {
            localStorage.removeItem(`maz_hub_rda_draft_${snapshot.id}`);
          } catch {
            // Ignorar errores de localStorage
          }
          setRecoverableDraft(null);
        } else {
          lastSavedJson.current = snapshotJson;
        }
        setSaveState("idle");
        return true;
      } catch (error) {
        setSaveState("error");
        toast.error(describeSaveError(error), { id: "rda-save-error", duration: 10000 });
        return false;
      }
    })();

    inFlight.current = task;
    try {
      return await task;
    } finally {
      inFlight.current = null;
    }
  }, [onSave]);

  // Autoguardado: unos segundos después del último cambio.
  useEffect(() => {
    if (!localRda || !isDirty) return;
    const timer = setTimeout(() => void persist(), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localRda, isDirty, persist]);

  // Si el usuario navega a otra sección (sidebar) con cambios pendientes, se guardan igual.
  const persistRef = useRef(persist);
  persistRef.current = persist;
  useEffect(() => () => void persistRef.current(), []);

  // Aviso del navegador al cerrar/recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!isDirty && saveState !== "saving") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, saveState]);

  if (!localRda) return null;

  const handleSave = async () => {
    const ok = await persist();
    if (ok) {
      toast.success(t("rda.savedOk", "RDA guardado correctamente"));
      onOpenChange(false);
    }
  };

  const handleBack = async () => {
    const ok = await persist();
    if (
      ok ||
      window.confirm(
        t(
          "rda.leaveWithoutSaving",
          "No se pudieron guardar los cambios. ¿Salir de todos modos y perderlos?",
        ),
      )
    ) {
      onOpenChange(false);
    }
  };

  const status: "saving" | "error" | "dirty" | "saved" =
    saveState === "saving"
      ? "saving"
      : saveState === "error"
        ? "error"
        : isDirty
          ? "dirty"
          : "saved";

  const handleRdaChange = (next: Rda) => {
    const nextStatus = getRdaStatus(next, { ignoreLegacyStatus: true });
    setLocalRda({ ...next, status: nextStatus });
  };

  const togglePhaseComplete = (
    e: React.MouseEvent,
    phaseId: RdaPhase,
    phaseNum: 1 | 2 | 3 | 4 | 5,
  ) => {
    e.stopPropagation();
    setLocalRda((prev) => {
      if (!prev) return prev;
      const completed = prev.completedPhases || [];
      const currentlyComplete = isRdaPhaseComplete(prev, phaseNum);
      const phaseStepIds = new Set(RDA_PHASE_STEP_IDS[phaseNum]);

      let next: Rda;
      if (currentlyComplete) {
        next = {
          ...prev,
          completedPhases: completed.filter((id) => id !== phaseId),
          completedSteps: (prev.completedSteps || []).filter((s) => !phaseStepIds.has(s)),
          naSteps: (prev.naSteps || []).filter((s) => !phaseStepIds.has(s)),
        };
      } else {
        next = {
          ...prev,
          completedPhases: completed.includes(phaseId) ? completed : [...completed, phaseId],
        };
      }

      return {
        ...next,
        status: getRdaStatus(next, { ignoreLegacyStatus: true }),
      };
    });
  };

  const getPhaseTabColors = (id: RdaPhase, isCurrent: boolean, _isCompleted: boolean) => {
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
  const isCompletable = (_pid: string) => true;

  // Progreso: todos los pasos reales del RDA (fases 2, 3, 4 y 5)
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
    "rda-step-11",
    "rda-step-12",
    "rda-step-14",
    "rda-step-15",
  ];
  const TOTAL_RDA_STEPS = RDA_PROGRESS_STEP_IDS.length;
  const doneOrNa = new Set([...(localRda.completedSteps || []), ...(localRda.naSteps || [])]);
  const uniqueCompletedSteps = RDA_PROGRESS_STEP_IDS.filter((id) => doneOrNa.has(id)).length;
  const progressPct = Math.round((uniqueCompletedSteps / TOTAL_RDA_STEPS) * 100) || 0;

  return (
    <div id="rda-content" className="space-y-6">
      {recoverableDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Se encontró un borrador local sin guardar en la nube (
              {new Date(recoverableDraft.savedAt).toLocaleString()}). ¿Deseas restaurarlo?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDiscardDraft}
              className="h-7 px-2.5 text-xs border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
            >
              Descartar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRestoreDraft}
              className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              Restaurar borrador
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-secondary/60 text-foreground font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer group"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </span>
          <span>{t("rda.backToMyRdas", "Volver a Mis RDAs")}</span>
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
              {t("rda.statusLabel")} {getRdaStatus(localRda, { ignoreLegacyStatus: true })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-2" aria-live="polite">
              {status === "saving" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                  <UploadCloud className="size-3.5 animate-bounce" /> {t("rda.saving")}
                </span>
              ) : status === "error" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                  <AlertTriangle className="size-3.5" />
                  {t("rda.saveError", "Error al guardar")}
                </span>
              ) : status === "dirty" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <CircleDot className="size-3.5" />
                  {t("rda.unsavedChanges", "Cambios sin guardar")}
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
              disabled={status === "saving"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <UploadCloud className="size-3.5" />
              {t("rda.saveRda")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
            {getRdaDisplayName(localRda, t("rda.newRda"))}
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
            const phaseNum = (i + 1) as 1 | 2 | 3 | 4 | 5;
            const isCompleted = isRdaPhaseComplete(localRda, phaseNum);

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
                    onClick={(e) => togglePhaseComplete(e, phase.id, phaseNum)}
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
        {activeTab === "1. Resumen" && <RdaPhase1Resumen rda={localRda} onChange={handleRdaChange} />}
        {activeTab === "2. Descripción del Problema" && (
          <RdaPhase2Problem rda={localRda} onChange={handleRdaChange} />
        )}
        {activeTab === "3. Análisis de Causas Raíz" && (
          <RdaPhase3Analysis
            rda={localRda}
            onChange={handleRdaChange}
            onForceSave={() => void persist()}
          />
        )}
        {activeTab === "4. Evaluación de Calidad RDA" && (
          <RdaPhase6QualityEval rda={localRda} onChange={handleRdaChange} />
        )}
        {activeTab === "5. Evaluación de Efectividad de RDA" && (
          <RdaPhase7EffectivenessEval rda={localRda} onChange={handleRdaChange} />
        )}
      </div>
    </div>
  );
}
