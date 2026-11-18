/**
 * @fileoverview Single validation-action card displaying uploaded photographic/PDF evidence.
 */

import type React from "react";
import { Loader2, Plus, UploadCloud, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { sanitize_external_url } from "@/core/security";
import type { RdaValidationAction } from "@/domain/models/rda";

interface RdaEvidenceCardProps {
  action_item: RdaValidationAction;
  action_index: number;
  existing_images: string[];
  is_uploading: boolean;
  on_upload_files: (action_id: string, file_event: React.ChangeEvent<HTMLInputElement>) => void;
  on_remove_image: (action_id: string, image_index: number) => void;
}

/** Renders the evidence upload grid and validated root-cause badge for one validation action. */
export function RdaEvidenceCard({
  action_item,
  action_index,
  existing_images,
  is_uploading,
  on_upload_files,
  on_remove_image,
}: RdaEvidenceCardProps) {
  const { t } = useTranslation();
  const label_text = `${action_item.causaPotencial || t("rdaInternal.noCause")} - ${action_item.accion || t("rdaInternal.noAction")}`;
  const is_root_cause = action_item.esCausaRaiz === "SI";
  const is_non_root_cause = action_item.esCausaRaiz === "NO";

  const card_classes =
    "flex flex-col border rounded-xl p-3 " +
    (is_root_cause
      ? "bg-red-50 dark:bg-red-900/20 border-red-200"
      : is_non_root_cause
        ? "bg-green-50 dark:bg-green-900/20 border-green-200"
        : "bg-white border-border");

  const dropzone_classes =
    "relative mt-auto min-h-32 border-2 border-dashed rounded-lg flex flex-col justify-between overflow-hidden group " +
    (is_root_cause
      ? "bg-red-100/50 border-red-300"
      : is_non_root_cause
        ? "bg-green-100/50 border-green-300"
        : "bg-slate-50 dark:bg-slate-900 border-slate-200");

  return (
    <div className={card_classes}>
      <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2 text-justify" title={label_text}>
        {action_index + 1}. {label_text}
      </p>
      <div className={dropzone_classes}>
        {is_uploading ? (
          <div className="flex flex-col items-center justify-center w-full h-32 text-primary">
            <Loader2 className="size-6 mb-1 animate-spin" />
            <span className="text-[10px] uppercase font-semibold">{t("rda.saving")}</span>
          </div>
        ) : existing_images.length > 0 ? (
          <>
            <div className={`grid gap-1.5 p-2 ${existing_images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {existing_images.map((image_url, image_index) => {
                const safe_url = sanitize_external_url(image_url, { allowDataMedia: true });
                if (!safe_url) return null;
                const is_pdf =
                  safe_url.startsWith("data:application/pdf") || safe_url.toLowerCase().includes(".pdf");
                return (
                  <div
                    key={`${action_item.id}-img-${image_index}`}
                    className="relative h-24 rounded border border-border/60 bg-white/80 overflow-hidden flex items-center justify-center group/item"
                  >
                    {is_pdf ? (
                      <a
                        href={safe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:bg-red-900/20"
                      >
                        PDF {image_index + 1}
                      </a>
                    ) : (
                      <img
                        src={safe_url}
                        alt={`${t("rdaInternal.evidence")} ${action_index + 1} - ${image_index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => on_remove_image(action_item.id, image_index)}
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm cursor-pointer"
                      title="Eliminar imagen"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}

              <label className="h-24 rounded border border-dashed border-slate-300 bg-white/50 hover:bg-white/80 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-primary transition">
                <Plus className="size-5 mb-0.5" />
                <span className="text-[9px] uppercase font-bold">Agregar más</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(file_event) => on_upload_files(action_item.id, file_event)}
                />
              </label>
            </div>

            <div
              className={`w-full py-1 text-center text-[9px] font-bold text-white uppercase ${
                is_root_cause ? "bg-red-600" : is_non_root_cause ? "bg-green-600" : "bg-slate-600"
              }`}
            >
              {is_root_cause
                ? t("rdaInternal.rootCauseValidated")
                : is_non_root_cause
                  ? t("rdaInternal.notRootCause")
                  : t("rdaInternal.pending")}
            </div>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
            <UploadCloud className="size-6 mb-1" />
            <span className="text-[10px] uppercase font-semibold">{t("rdaInternal.uploadPhoto")}</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(file_event) => on_upload_files(action_item.id, file_event)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
