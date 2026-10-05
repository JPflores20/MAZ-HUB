import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Rda } from "@/data/rda";
import { IshikawaSection } from "../pdca-dialog/ishikawa-section";
import { FiveWhysSection } from "../pdca-dialog/five-whys-section";
import { RdaContextForm } from "./RdaContextForm";
import { RdaValidationTable } from "./RdaValidationTable";
import { RdaPreventionTable } from "./RdaPreventionTable";
import { RdaClosureSection } from "./RdaClosureSection";
import { ArrowLeft, Save, UploadCloud, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RdaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rda: Rda | null;
  onSave?: (rda: Rda) => void;
}

type RdaPhase = "Contexto" | "Ishikawa" | "Validación" | "Prevención" | "Cierre";

const RDA_PHASES: { id: RdaPhase; label: string }[] = [
  { id: "Contexto", label: "Contexto" },
  { id: "Ishikawa", label: "Ishikawa" },
  { id: "Validación", label: "Validación" },
  { id: "Prevención", label: "Prevención" },
  { id: "Cierre", label: "Cierre" },
];

export function RdaDialog({ open, onOpenChange, rda, onSave }: RdaDialogProps) {
  const [localRda, setLocalRda] = useState<Rda | null>(null);
  const [activeTab, setActiveTab] = useState<RdaPhase>("Contexto");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rda && open) {
      setLocalRda({ ...rda });
    }
  }, [rda, open]);

  if (!localRda) return null;

  const handleIshikawaChange = (ishikawas: any[]) => {
    setLocalRda((prev) => prev ? { ...prev, ishikawa: ishikawas } : prev);
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave(localRda);
      setIsSaving(false);
    }
  };

  const getPhaseTabColors = (id: RdaPhase, isCurrent: boolean) => {
    if (isCurrent) {
      switch (id) {
        case "Contexto": return "bg-blue-600 text-white shadow-sm";
        case "Ishikawa": return "bg-red-600 text-white shadow-sm";
        case "Validación": return "bg-yellow-400 text-black shadow-sm";
        case "Prevención": return "bg-emerald-500 text-white shadow-sm";
        case "Cierre": return "bg-indigo-900 text-white shadow-sm";
      }
    }
    switch (id) {
      case "Contexto": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
      case "Ishikawa": return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
      case "Validación": return "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30";
      case "Prevención": return "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20";
      case "Cierre": return "bg-indigo-900/10 text-indigo-900 hover:bg-indigo-900/20";
    }
  };

  const currentIndex = RDA_PHASES.findIndex((p) => p.id === activeTab);
  const progressPct = Math.round(((currentIndex + 1) / RDA_PHASES.length) * 100);

  return (
    <div id="rda-content" className="space-y-6">
      
      {/* HEADER IDÉNTICO AL PDCA */}
      <div className="space-y-4">
        {/* Row 1: Back link */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Volver a Mis RDAs
        </button>

        {/* Row 2: Meta + Save */}
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

        {/* Row 3: Title + Progress */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
            {localRda.title || "Nuevo RDA"}
          </h1>

          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-semibold text-foreground whitespace-nowrap">
              Progreso del RDA: <span className="text-primary">{progressPct}%</span>
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                ({currentIndex}/{RDA_PHASES.length} pasos)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STEPPER IDÉNTICO AL PDCA */}
      <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5">
        {RDA_PHASES.map((phase, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={phase.id}
              onClick={() => setActiveTab(phase.id)}
              className={cn(
                "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group cursor-pointer select-none",
                getPhaseTabColors(phase.id, isCurrent)
              )}
            >
              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    isCurrent ? "border-transparent bg-white/20 text-current" : "border-current/20 text-current opacity-70"
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                    {phase.label}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido Principal */}
      <div className="mt-8">
        {activeTab === "Contexto" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">1. Contexto de la Anomalía</h3>
              <RdaContextForm 
                context={localRda.context} 
                onChange={(ctx) => setLocalRda(prev => prev ? { ...prev, context: ctx } : prev)} 
              />
            </div>
          </div>
        )}

        {activeTab === "Ishikawa" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">2. Ishikawa & 5 Porqués</h3>
              <IshikawaSection
                ishikawas={localRda.ishikawa || []}
                onChange={handleIshikawaChange}
                isStepCompleted={true}
              />
              <div className="mt-8 border-t pt-8">
                <FiveWhysSection
                  tables={(localRda as any).five_whys_tables || []}
                  onChange={(tables) => setLocalRda(prev => prev ? { ...prev, five_whys_tables: tables } as Rda : prev)}
                  isStepCompleted={true}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Validación" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">3. Validación y Acción</h3>
              <RdaValidationTable
                items={(localRda as any).validacion || []}
                onChange={(items) => setLocalRda(prev => prev ? { ...prev, validacion: items } as any : prev)}
              />
            </div>
          </div>
        )}

        {activeTab === "Prevención" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">4. Prevención y Estandarización</h3>
              <RdaPreventionTable
                items={(localRda as any).prevencion || []}
                onChange={(items) => setLocalRda(prev => prev ? { ...prev, prevencion: items } as any : prev)}
              />
            </div>
          </div>
        )}

        {activeTab === "Cierre" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">5. Cierre de Anomalía</h3>
              <RdaClosureSection
                standardization={(localRda as any).estandarizacion}
                closure={(localRda as any).cierre}
                onChange={(std, cls) => setLocalRda(prev => prev ? { ...prev, estandarizacion: std, cierre: cls } as any : prev)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
