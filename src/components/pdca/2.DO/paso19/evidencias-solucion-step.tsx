import React from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { ImageUploadSection } from "../../image-upload-section";
import { Badge } from "@/components/ui/badge";
import type { ActionItem, EvidenciaSolucionItem } from "@/data/pdca";

interface EvidenciasSolucionStepProps {
  actions: ActionItem[];
  evidencias: EvidenciaSolucionItem[];
  onEvidenciasChange: (evs: EvidenciaSolucionItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  title?: string;
  hideStepCard?: boolean;
}

export const EvidenciasSolucionStep: React.FC<EvidenciasSolucionStepProps> = ({
  actions,
  evidencias,
  onEvidenciasChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title,
  hideStepCard,
}) => {
  const handleImageChange = (actionId: string, image: string | undefined) => {
    const newEvidencias = [...evidencias];
    const index = newEvidencias.findIndex((e) => e.actionId === actionId);

    if (image) {
      if (index >= 0 && newEvidencias[index]) {
        newEvidencias[index].image = image;
      } else {
        newEvidencias.push({ actionId, image });
      }
    } else {
      if (index >= 0) {
        newEvidencias.splice(index, 1);
      }
    }

    onEvidenciasChange(newEvidencias);
  };

  const handleFileChange = (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        handleImageChange(actionId, event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const innerContent = (
    <div className={hideStepCard ? "" : "mt-4 space-y-8"}>
      <div className="space-y-4">
        {title && <h4 className="text-sm font-bold text-slate-700 uppercase">{title}</h4>}
        {actions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No hay acciones definidas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, i) => {
              const label = `${action.accion || "Sin acción"} - ${action.resultados || "Sin solución/resultado"}`;
              const existing = evidencias.find((e) => e.actionId === action.id)?.image;
              return (
                <div
                  key={action.id}
                  className="flex flex-col border border-border rounded-xl p-3 bg-white"
                >
                  <p
                    className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                    title={label}
                  >
                    {i + 1}. {label}
                  </p>
                  <div className="relative mt-auto h-32 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden group">
                    {existing ? (
                      <>
                        {existing.startsWith("data:application/pdf") ||
                        existing.toLowerCase().includes(".pdf") ? (
                          <div className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
                            <FileText className="size-8 mb-2" />
                            <span className="text-[10px] font-semibold">Documento PDF</span>
                            <a
                              href={existing}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] underline hover:text-blue-800 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver PDF
                            </a>
                          </div>
                        ) : (
                          <img
                            src={existing}
                            alt={`Evidencia ${i + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                        <button
                          onClick={() => handleImageChange(action.id, undefined)}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                        <UploadCloud className="size-6 mb-1" />
                        <span className="text-[10px] uppercase font-semibold">Subir Foto</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(action.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (hideStepCard) {
    return innerContent;
  }

  return (
    <StepCard
      title={title || "PASO 19: EVIDENCIA DE SOLUCIONES"}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        Por cada acción del plan, adjunta una foto o PDF como evidencia.
      </StepInstructions>
      {innerContent}
    </StepCard>
  );
};
