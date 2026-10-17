/**
 * RdaEvidenceTab.tsx
 * Pestaña para adjuntar y visualizar evidencias fotográficas de la anomalía en el RDA.
 */
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import type { RdaEvidenceItem, RdaValidationAction } from "@/data/rda";
import { subirArchivoAFirebase } from "@/components/pdca/image-upload/utils/upload-utils";

interface RdaEvidenceTabProps {
  validationActions?: RdaValidationAction[];
  items: RdaEvidenceItem[];
  onChange: (items: RdaEvidenceItem[]) => void;
  title: string;
  description: string;
  placeholder?: string;
}

export function RdaEvidenceTab({
  validationActions = [],
  items,
  onChange,
  title,
  description,
}: RdaEvidenceTabProps) {
  const { t } = useTranslation();

  // Refs con los valores más recientes: la subida es asíncrona y, al terminar,
  // no debe sobrescribir cambios hechos mientras tanto con datos viejos.
  const itemsRef = useRef(items);
  const onChangeRef = useRef(onChange);
  itemsRef.current = items;
  onChangeRef.current = onChange;

  const handleAddImages = (actionId: string, newUrls: string[]) => {
    if (newUrls.length === 0) return;
    const newItems = [...itemsRef.current];
    const index = newItems.findIndex((e) => e.id === actionId);
    const existingItem = index >= 0 ? newItems[index] : undefined;

    if (existingItem) {
      newItems[index] = {
        ...existingItem,
        images: [...(existingItem.images || []), ...newUrls],
      };
    } else {
      newItems.push({
        id: actionId,
        title: "",
        description: "",
        images: newUrls,
      });
    }

    onChangeRef.current(newItems);
  };

  const handleRemoveImage = (actionId: string, imgIndex: number) => {
    const newItems = [...itemsRef.current];
    const index = newItems.findIndex((e) => e.id === actionId);
    if (index < 0) return;
    const existingItem = newItems[index];
    if (!existingItem) return;

    const updatedImages = (existingItem.images || []).filter((_, idx) => idx !== imgIndex);
    if (updatedImages.length === 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index] = { ...existingItem, images: updatedImages };
    }

    onChangeRef.current(newItems);
  };

  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileChange = async (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (fileList.length === 0) return;
    setUploadingId(actionId);
    try {
      const urls = await Promise.all(
        fileList.map((file) => subirArchivoAFirebase(file, "rda_images")),
      );
      handleAddImages(actionId, urls);
    } catch (error) {
      console.error("[RdaEvidenceTab] Error subiendo evidencia:", error);
      toast.error("No se pudo subir la evidencia. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2">
        <h4 className="font-semibold text-blue-900 mb-1">{title}</h4>
        <p className="text-sm text-blue-800">{description}</p>
      </div>

      <div className="space-y-4">
        {validationActions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t("rdaInternal.noValidationActions")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {validationActions.map((action, i) => {
              const label = `${action.causaPotencial || t("rdaInternal.noCause")} - ${action.accion || t("rdaInternal.noAction")}`;
              const existingImages = items.find((e) => e.id === action.id)?.images || [];

              const esCausaRaiz = action.esCausaRaiz === "SI";
              const esNoCausaRaiz = action.esCausaRaiz === "NO";

              const cardClasses =
                "flex flex-col border rounded-xl p-3 " +
                (esCausaRaiz
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200"
                  : esNoCausaRaiz
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                    : "bg-white border-border");

              const dropzoneClasses =
                "relative mt-auto min-h-32 border-2 border-dashed rounded-lg flex flex-col justify-between overflow-hidden group " +
                (esCausaRaiz
                  ? "bg-red-100/50 border-red-300"
                  : esNoCausaRaiz
                    ? "bg-green-100/50 border-green-300"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200");

              return (
                <div key={action.id} className={cardClasses}>
                  <p
                    className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2 text-justify"
                    title={label}
                  >
                    {i + 1}. {label}
                  </p>
                  <div className={dropzoneClasses}>
                    {uploadingId === action.id ? (
                      <div className="flex flex-col items-center justify-center w-full h-32 text-primary">
                        <Loader2 className="size-6 mb-1 animate-spin" />
                        <span className="text-[10px] uppercase font-semibold">
                          {t("rda.saving")}
                        </span>
                      </div>
                    ) : existingImages.length > 0 ? (
                      <>
                        <div
                          className={`grid gap-1.5 p-2 ${
                            existingImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
                          }`}
                        >
                          {existingImages.map((imgUrl, imgIdx) => (
                            <div
                              key={`${action.id}-img-${imgIdx}`}
                              className="relative h-24 rounded border border-border/60 bg-white/80 overflow-hidden flex items-center justify-center group/item"
                            >
                              {imgUrl.startsWith("data:application/pdf") ||
                              imgUrl.toLowerCase().includes(".pdf") ? (
                                <a
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:bg-red-900/20"
                                >
                                  PDF {imgIdx + 1}
                                </a>
                              ) : (
                                <img
                                  src={imgUrl}
                                  alt={`${t("rdaInternal.evidence")} ${i + 1} - ${imgIdx + 1}`}
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

                          <label className="h-24 rounded border border-dashed border-slate-300 bg-white/50 hover:bg-white/80 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-primary transition">
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

                        <div
                          className={`w-full py-1 text-center text-[9px] font-bold text-white uppercase ${
                            esCausaRaiz
                              ? "bg-red-600"
                              : esNoCausaRaiz
                                ? "bg-green-600"
                                : "bg-slate-600"
                          }`}
                        >
                          {esCausaRaiz
                            ? t("rdaInternal.rootCauseValidated")
                            : esNoCausaRaiz
                              ? t("rdaInternal.notRootCause")
                              : t("rdaInternal.pending")}
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                        <UploadCloud className="size-6 mb-1" />
                        <span className="text-[10px] uppercase font-semibold">
                          {t("rdaInternal.uploadPhoto")}
                        </span>
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
}
