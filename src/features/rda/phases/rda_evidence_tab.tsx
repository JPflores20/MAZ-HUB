/**
 * @fileoverview Evidence gallery container attaching photos/PDFs per RDA validation action.
 */

import type React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { subir_archivo_a_firebase } from "@/features/pdca/image_upload/upload_utils";
import type { RdaEvidenceItem, RdaValidationAction } from "@/domain/models/rda";
import { RdaEvidenceCard } from "./rda_evidence_card";

interface RdaEvidenceTabProps {
  validationActions?: RdaValidationAction[];
  items: RdaEvidenceItem[];
  onChange: (items: RdaEvidenceItem[]) => void;
  title: string;
  description: string;
}

/** Manages Firebase Storage / inline media uploads mapped to individual validation actions. */
export function RdaEvidenceTab({
  validationActions = [],
  items,
  onChange,
  title,
  description,
}: RdaEvidenceTabProps) {
  const { t } = useTranslation();
  const [uploading_id, set_uploading_id] = useState<string | null>(null);

  const items_ref = useRef(items);
  const on_change_ref = useRef(onChange);
  items_ref.current = items;
  on_change_ref.current = onChange;

  const append_images = (action_id: string, uploaded_urls: string[]) => {
    if (uploaded_urls.length === 0) return;
    const next_items = [...items_ref.current];
    const existing_index = next_items.findIndex((entry) => entry.id === action_id);
    const existing_entry = existing_index >= 0 ? next_items[existing_index] : undefined;

    if (existing_entry) {
      next_items[existing_index] = {
        ...existing_entry,
        images: [...(existing_entry.images || []), ...uploaded_urls],
      };
    } else {
      next_items.push({ id: action_id, title: "", description: "", images: uploaded_urls });
    }
    on_change_ref.current(next_items);
  };

  const handle_remove_image = (action_id: string, image_index: number) => {
    const next_items = [...items_ref.current];
    const existing_index = next_items.findIndex((entry) => entry.id === action_id);
    if (existing_index < 0) return;
    const existing_entry = next_items[existing_index];
    if (!existing_entry) return;

    const updated_images = (existing_entry.images || []).filter(
      (_unused_url, idx) => idx !== image_index,
    );
    if (updated_images.length === 0) {
      next_items.splice(existing_index, 1);
    } else {
      next_items[existing_index] = { ...existing_entry, images: updated_images };
    }
    on_change_ref.current(next_items);
  };

  const handle_upload_files = async (
    action_id: string,
    file_event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected_files = file_event.target.files ? Array.from(file_event.target.files) : [];
    file_event.target.value = "";
    if (selected_files.length === 0) return;
    set_uploading_id(action_id);
    try {
      const uploaded_urls = await Promise.all(
        selected_files.map((selected_file) => subir_archivo_a_firebase(selected_file, "rda_images")),
      );
      append_images(action_id, uploaded_urls);
    } catch (upload_error) {
      console.error("[RdaEvidenceTab] Error subiendo evidencia:", upload_error);
      toast.error("No se pudo subir la evidencia. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      set_uploading_id(null);
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
          <p className="text-xs text-muted-foreground italic">{t("rdaInternal.noValidationActions")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {validationActions.map((action_item, action_index) => (
              <RdaEvidenceCard
                key={action_item.id}
                action_item={action_item}
                action_index={action_index}
                existing_images={items.find((entry) => entry.id === action_item.id)?.images || []}
                is_uploading={uploading_id === action_item.id}
                on_upload_files={(id, evt) => void handle_upload_files(id, evt)}
                on_remove_image={handle_remove_image}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
