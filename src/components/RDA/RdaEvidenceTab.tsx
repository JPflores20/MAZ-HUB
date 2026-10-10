import React from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud, X } from "lucide-react";
import type { RdaEvidenceItem, RdaValidationAction } from "@/data/rda";

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

  const handleImageChange = (actionId: string, image: string | undefined) => {
    const newItems = [...items];
    const index = newItems.findIndex((e) => e.id === actionId);

    if (image) {
      const existingItem = index >= 0 ? newItems[index] : undefined;
      if (existingItem) {
        newItems[index] = { ...existingItem, images: [image] };
      } else {
        newItems.push({ id: actionId, title: "", description: "", images: [image] });
      }
    } else {
      if (index >= 0) {
        newItems.splice(index, 1);
      }
    }

    onChange(newItems);
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2">
        <h4 className="font-semibold text-blue-900 mb-1">{title}</h4>
        <p className="text-sm text-blue-800">{description}</p>
      </div>

      <div className="space-y-4">
        {validationActions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('rdaInternal.noValidationActions')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {validationActions.map((action, i) => {
              const label = `${action.causaPotencial || t('rdaInternal.noCause')} - ${action.accion || t('rdaInternal.noAction')}`;
              const existing = items.find((e) => e.id === action.id)?.images?.[0];

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
                "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group " +
                (esCausaRaiz
                  ? "bg-red-100/50 border-red-300"
                  : esNoCausaRaiz
                    ? "bg-green-100/50 border-green-300"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200");

              return (
                <div key={action.id} className={cardClasses}>
                  <p
                    className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                    title={label}
                  >
                    {i + 1}. {label}
                  </p>
                  <div className={dropzoneClasses}>
                    {existing ? (
                      <>
                        {existing.startsWith("data:application/pdf") ||
                        existing.toLowerCase().includes(".pdf") ? (
                          <a
                            href={existing}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:bg-red-900/20"
                          >
                            PDF
                          </a>
                        ) : (
                          <img
                            src={existing}
                            alt={`${t('rdaInternal.evidence')} ${i + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                        <button
                          onClick={() => handleImageChange(action.id, undefined)}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm"
                        >
                          <X className="size-4" />
                        </button>

                        <div
                          className={`absolute bottom-0 left-0 right-0 py-1 text-center text-[9px] font-bold text-white uppercase ${esCausaRaiz ? "bg-red-600" : esNoCausaRaiz ? "bg-green-600" : "bg-slate-600"}`}
                        >
                          {esCausaRaiz
                            ? t('rdaInternal.rootCauseValidated')
                            : esNoCausaRaiz
                              ? t('rdaInternal.notRootCause')
                              : t('rdaInternal.pending')}
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                        <UploadCloud className="size-6 mb-1" />
                        <span className="text-[10px] uppercase font-semibold">{t('rdaInternal.uploadPhoto')}</span>
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
}
