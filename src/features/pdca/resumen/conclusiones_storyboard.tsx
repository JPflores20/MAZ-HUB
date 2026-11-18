/**
 * @fileoverview Seccion Storyboard de cierre ejecutivo con editor de texto enriquecido e imagen adjunta segura.
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { RichTextEditor } from "@/shared/ui/rich_text_editor";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesStoryboardConclusiones {
  html_storyboard?: string | undefined;
  al_cambiar_html_storyboard?: ((html: string) => void) | undefined;
  es_editable: boolean;
  imagen_storyboard?: string | undefined;
  al_cambiar_imagen_storyboard?: ((imagen_url?: string) => void) | undefined;
}

/**
 * Permite documentar la narrativa visual (Storyboard) y adjuntar su diagrama final sanitizado.
 */
export const SeccionStoryboardConclusiones: React.FC<PropiedadesStoryboardConclusiones> = ({
  html_storyboard,
  al_cambiar_html_storyboard,
  es_editable,
  imagen_storyboard,
  al_cambiar_imagen_storyboard,
}) => {
  const { t: translate } = useTranslation();
  const imagen_segura = imagen_storyboard
    ? sanitize_external_url(imagen_storyboard, { allowDataMedia: true })
    : null;

  return (
    <div className="pt-6 border-t">
      <p className="text-sm font-bold text-center mb-4">
        {translate("pdcaResumen.storyboardInstruction")}
      </p>
      <RichTextEditor
        value={html_storyboard || ""}
        onChange={al_cambiar_html_storyboard || (() => {})}
        disabled={!es_editable}
        placeholder={translate("pdcaResumen.pasteStoryboardText")}
      />
      <div className="mt-4">
        <p className="text-xs font-bold mb-2">{translate("pdcaResumen.uploadStoryboardImage")}</p>
        {imagen_segura ? (
          <div className="relative border rounded-md overflow-hidden bg-black/5 group">
            <img
              src={imagen_segura}
              alt="Storyboard"
              className="w-full h-auto object-contain max-h-[500px]"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
              onClick={() => al_cambiar_imagen_storyboard?.(undefined)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-md p-8 text-center bg-secondary/10 hover:bg-secondary/20 transition-colors">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              id="storyboard-upload"
              onChange={(evento) => {
                const archivo = evento.target.files?.[0];
                if (archivo) {
                  const lector = new FileReader();
                  lector.onload = (evento_carga) => {
                    if (typeof evento_carga.target?.result === "string") {
                      al_cambiar_imagen_storyboard?.(evento_carga.target.result);
                    }
                  };
                  lector.readAsDataURL(archivo);
                }
              }}
            />
            <label htmlFor="storyboard-upload" className="cursor-pointer flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{translate("pdcaResumen.clickToUploadImage")}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
