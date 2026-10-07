import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Rda, RdaEvidenceItem } from "@/data/rda";
import { RdaPortadaTab } from "./RdaPortadaTab";
import { RdaProblemDescriptionTab } from "./RdaProblemDescriptionTab";
import { RdaTimelineTab } from "./RdaTimelineTab";
import { RdaAnalysisTab } from "./RdaAnalysisTab";
import { RdaEvidenceTab } from "./RdaEvidenceTab";
import { ArrowLeft, Save, UploadCloud, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_DEFINICION_META } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
import { DEFAULT_PARTICIPANTES } from "@/data/pdca-defaults";

interface RdaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rda: Rda | null;
  onSave?: (rda: Rda) => void;
}

type RdaPhase = "A. Portada" | "B. Descripción" | "C. Línea de Tiempo" | "D. Análisis" | "E. Evidencias Causa Raíz";

const RDA_PHASES: { id: RdaPhase; label: string }[] = [
  { id: "A. Portada", label: "A. Portada" },
  { id: "B. Descripción", label: "B. Descripción" },
  { id: "C. Línea de Tiempo", label: "C. Línea de Tiempo" },
  { id: "D. Análisis", label: "D. Análisis" },
  { id: "E. Evidencias Causa Raíz", label: "E. Evidencias Causa Raíz" },
];

const parseEvidenceData = (ev: any): RdaEvidenceItem[] => {
  if (!ev) return [];
  if (Array.isArray(ev)) return ev;
  return [{ id: crypto.randomUUID(), title: "Evidencia Causa Raíz 1", description: ev.description || "", images: ev.images || [] }];
};

export function RdaDialog({ open, onOpenChange, rda, onSave }: RdaDialogProps) {
  const [localRda, setLocalRda] = useState<Rda | null>(null);
  const [activeTab, setActiveTab] = useState<RdaPhase>("A. Portada");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rda && open) {
      setLocalRda({ ...rda });
      setActiveTab("A. Portada");
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
    setLocalRda(prev => {
      if (!prev) return prev;
      const completed = prev.completedPhases || [];
      if (completed.includes(phaseId)) {
        return { ...prev, completedPhases: completed.filter(id => id !== phaseId) };
      } else {
        return { ...prev, completedPhases: [...completed, phaseId] };
      }
    });
  };

  const getPhaseTabColors = (id: RdaPhase, isCurrent: boolean, isCompleted: boolean) => {
    if (isCurrent) {
      switch (id) {
        case "A. Portada": return "bg-purple-600 text-white shadow-sm";
        case "B. Descripción": return "bg-blue-600 text-white shadow-sm";
        case "C. Línea de Tiempo": return "bg-red-600 text-white shadow-sm";
        case "D. Análisis": return "bg-yellow-400 text-black shadow-sm";
        case "E. Evidencias Causa Raíz": return "bg-emerald-500 text-white shadow-sm";
      }
    }
    
    // For completed non-active tabs, give them a subtle tint or keep their soft color
    switch (id) {
      case "A. Portada": return "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20";
      case "B. Descripción": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
      case "C. Línea de Tiempo": return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
      case "D. Análisis": return "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30";
      case "E. Evidencias Causa Raíz": return "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20";
    }
  };

  const currentIndex = RDA_PHASES.findIndex((p) => p.id === activeTab);
  const completedPhasesCount = localRda.completedPhases?.length || 0;
  const progressPct = Math.round((completedPhasesCount / RDA_PHASES.length) * 100);

  // Consolidate legacy evidence data if evidences array is empty
  const getEvidences = (): RdaEvidenceItem[] => {
    if (localRda.evidences && localRda.evidences.length > 0) return localRda.evidences;
    const merged: RdaEvidenceItem[] = [];
    if (localRda.evidence1 && localRda.evidence1.length > 0) merged.push(...parseEvidenceData(localRda.evidence1));
    if (localRda.evidence2 && localRda.evidence2.length > 0) merged.push(...parseEvidenceData(localRda.evidence2));
    return merged;
  };

  const handleEvidencesChange = (items: RdaEvidenceItem[]) => {
    setLocalRda(prev => prev ? { ...prev, evidences: items } : prev);
  };

  return (
    <div id="rda-content" className="space-y-6">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Volver a Mis RDAs
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
              {localRda.id || "Nuevo RDA"}
            </span>
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-700">
              {activeTab}
            </span>
            <span className="text-xs text-muted-foreground ml-2">ESTATUS: {localRda.status}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-2">
              {isSaving ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                  <UploadCloud className="size-3.5 animate-bounce" /> Guardando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <Check className="size-3.5" /> Sincronizado
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
              Guardar RDA
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
            {localRda.title || "Nuevo RDA"}
          </h1>

          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-semibold text-foreground whitespace-nowrap">
              Progreso del RDA: <span className="text-primary">{progressPct}%</span>
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                ({completedPhasesCount}/{RDA_PHASES.length} pasos)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5 overflow-x-auto">
        {RDA_PHASES.map((phase, i) => {
          const isCurrent = i === currentIndex;
          const isCompleted = localRda.completedPhases?.includes(phase.id) || false;

          const getPhaseCheckColors = () => {
            if (isCompleted) return "bg-emerald-500 text-white border-transparent hover:bg-emerald-600";
            if (isCurrent) return "border-white/40 text-white/50 hover:border-white hover:text-white";
            switch (phase.id) {
              case "A. Portada": return "border-purple-500/30 text-purple-500/30 hover:border-purple-500 hover:text-purple-500";
              case "B. Descripción": return "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500";
              case "C. Línea de Tiempo": return "border-red-500/30 text-red-500/30 hover:border-red-500 hover:text-red-500";
              case "D. Análisis": return "border-yellow-600/30 text-yellow-600/30 hover:border-yellow-600 hover:text-yellow-600";
              case "E. Evidencias Causa Raíz": return "border-emerald-500/30 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-500";
              default: return "border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground hover:text-muted-foreground";
            }
          };

          return (
            <div
              key={phase.id}
              onClick={() => setActiveTab(phase.id)}
              className={cn(
                "flex flex-1 items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none whitespace-nowrap",
                getPhaseTabColors(phase.id, isCurrent, isCompleted)
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    isCurrent ? "border-transparent bg-white/20 text-current" : "border-current/20 text-current opacity-70"
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-semibold uppercase tracking-wide truncate">
                    {phase.label}
                  </span>
                </span>
              </div>
              
              <button
                type="button"
                onClick={(e) => togglePhaseComplete(e, phase.id)}
                className={cn(
                  "shrink-0 size-6 grid place-items-center rounded-full border-2 transition-all",
                  getPhaseCheckColors()
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        {activeTab === "A. Portada" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Declaración del Proyecto</h3>
              <RdaPortadaTab 
                data={localRda.portada || {
                  titulo: localRda.title || "",
                  area: localRda.context?.area || "",
                  fechaLimite: "",
                  autorOriginal: localRda.context?.responsable || "",
                  usuariosAsignados: [],
                  descripcionProblema: "",
                  definicionMeta: DEFAULT_DEFINICION_META,
                  participantes: DEFAULT_PARTICIPANTES,
                }}
                onChange={(data) => {
                  setLocalRda(prev => {
                    if (!prev) return prev;
                    return { 
                      ...prev, 
                      title: data.titulo || prev.title,
                      context: { ...prev.context, area: data.area || prev.context.area },
                      portada: data 
                    };
                  });
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "B. Descripción" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">1. Descripción del Problema (5W + 1H)</h3>
              <RdaProblemDescriptionTab 
                data={localRda.problemDescription || { que: "", como: "", cuando: "", donde: "", quien: "", cual: "" }}
                onChange={(data) => setLocalRda(prev => prev ? { ...prev, problemDescription: data } : prev)}
              />
            </div>
          </div>
        )}

        {activeTab === "C. Línea de Tiempo" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">2. Línea de Tiempo del Problema</h3>
              <RdaTimelineTab 
                events={localRda.timeline || []}
                onChange={(events) => setLocalRda(prev => prev ? { ...prev, timeline: events } : prev)}
              />
            </div>
          </div>
        )}

        {activeTab === "D. Análisis" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">3. Análisis de Datos y Variables</h3>
              <RdaAnalysisTab 
                data={localRda.analysis || { data: "", images: [] }}
                onChange={(data) => setLocalRda(prev => prev ? { ...prev, analysis: data } : prev)}
              />
            </div>
          </div>
        )}

        {activeTab === "E. Evidencias Causa Raíz" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">4. Evidencias de Causa Raíz</h3>
              <RdaEvidenceTab 
                items={getEvidences()}
                onChange={handleEvidencesChange}
                title="Evaluación de Evidencias"
                description="Añade las diferentes evidencias de causa raíz. Puedes evaluar parámetros operativos clave o variables de los tanques según sea necesario."
                placeholder="Ej. Evidencia de concentración de PVPP, análisis de variables en tanque..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
