/**
 * evidencias-solucion-step.tsx
 * Paso de registro de evidencias Antes vs. Después de la implementación de las acciones de mejora.
 */
import React from "react";
import { UploadCloud, X, FileText, Plus } from "lucide-react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import type { ActionItem, EvidenciaSolucionItem } from "@/data/pdca";

type MultiEvidenciaSolucionItem = EvidenciaSolucionItem & {
  images?: string[];
};

interface EvidenciasSolucionStepProps {
  actions: ActionItem[];
  evidencias: MultiEvidenciaSolucionItem[];
  onEvidenciasChange: (evs: MultiEvidenciaSolucionItem[]) => void;
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
  const getActionImages = (actionId: string): string[] => {
    const found = evidencias.find((e) => e.actionId === actionId);
    if (!found) return [];
    if (Array.isArray(found.images) && found.images.length > 0) {
      return found.images;
    }
    return found.image ? [found.image] : [];
  };

  const handleAddImages = (actionId: string, newDataUrls: string[]) => {
    if (newDataUrls.length === 0) return;
    const newEvidencias = [...evidencias];
    const index = newEvidencias.findIndex((e) => e.actionId === actionId);
    const currentImages = getActionImages(actionId);
    const merged = [...currentImages, ...newDataUrls];

    if (index >= 0 && newEvidencias[index]) {
      newEvidencias[index] = {
        ...newEvidencias[index],
        image: merged[0] || "",
        images: merged,
      };
    } else {
      newEvidencias.push({
        actionId,
        image: merged[0] || "",
        images: merged,
      });
    }

    onEvidenciasChange(newEvidencias);
  };

  const handleRemoveImage = (actionId: string, imgIndex: number) => {
    const newEvidencias = [...evidencias];
    const index = newEvidencias.findIndex((e) => e.actionId === actionId);
    if (index < 0) return;
    const currentImages = getActionImages(actionId);
    const updated = currentImages.filter((_, idx) => idx !== imgIndex);

    if (updated.length === 0) {
      newEvidencias.splice(index, 1);
    } else {
      newEvidencias[index] = {
        actionId,
        image: updated[0] || "",
        images: updated,
      };
    }

    onEvidenciasChange(newEvidencias);
  };

  const handleFileChange = async (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (fileList.length === 0) return;

    const readPromises = fileList.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(typeof event.target?.result === "string" ? event.target.result : "");
          };
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        }),
    );

    const results = (await Promise.all(readPromises)).filter(Boolean);
    handleAddImages(actionId, results);
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
              const existingImages = getActionImages(action.id);
              return (
                <div
                  key={action.id}
                  className="flex flex-col border border-border rounded-xl p-3 bg-white"
                >
                  <p
                    className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2 text-justify"
                    title={label}
                  >
                    {i + 1}. {label}
                  </p>
                  <div className="relative mt-auto min-h-32 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-lg flex flex-col justify-center overflow-hidden group">
                    {existingImages.length > 0 ? (
                      <div
                        className={`grid gap-1.5 p-2 ${
                          existingImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        }`}
                      >
                        {existingImages.map((imgUrl, imgIdx) => (
                          <div
                            key={`${action.id}-ev-${imgIdx}`}
                            className="relative h-24 rounded border border-border/60 bg-white overflow-hidden flex items-center justify-center group/item"
                          >
                            {imgUrl.startsWith("data:application/pdf") ||
                            imgUrl.toLowerCase().includes(".pdf") ? (
                              <div className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
                                <FileText className="size-6 mb-1" />
                                <a
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] underline hover:text-blue-800 font-semibold"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Ver PDF {imgIdx + 1}
                                </a>
                              </div>
                            ) : (
                              <img
                                src={imgUrl}
                                alt={`Evidencia ${i + 1} - ${imgIdx + 1}`}
                                className="w-full h-full object-contain"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(action.id, imgIdx)}
                              className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm cursor-pointer"
                              title="Eliminar imagen"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}

                        <label className="h-24 rounded border border-dashed border-slate-300 bg-white/60 hover:bg-white flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-primary transition">
                          <Plus className="size-5 mb-0.5" />
                          <span className="text-[9px] uppercase font-bold">Agregar más</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(action.id, e)}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                        <UploadCloud className="size-6 mb-1" />
                        <span className="text-[10px] uppercase font-semibold">Subir Foto</span>
                        <input
                          type="file"
                          multiple
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
        Por cada acción del plan, adjunta una o varias fotos o PDFs como evidencia.
      </StepInstructions>
      {innerContent}
    </StepCard>
  );
};
