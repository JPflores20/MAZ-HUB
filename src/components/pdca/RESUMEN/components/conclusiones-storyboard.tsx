import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface Props {
  htmlStoryboard?: string;
  alCambiarHtmlStoryboard?: (html: string) => void;
  esEditable: boolean;
  imagenStoryboard?: string;
  alCambiarImagenStoryboard?: (img?: string) => void;
}

export const SeccionStoryboardConclusiones: React.FC<Props> = ({
  htmlStoryboard,
  alCambiarHtmlStoryboard,
  esEditable,
  imagenStoryboard,
  alCambiarImagenStoryboard,
}) => {
  return (
    <div className="pt-6 border-t">
      <p className="text-sm font-bold text-center mb-4">
        Para la conclusión - Crear el Storyboard de PDCA (insertar texto, capturas de pantalla, etc. para el resumen)
      </p>
      <RichTextEditor
        value={htmlStoryboard || ""}
        onChange={alCambiarHtmlStoryboard || (() => {})}
        disabled={!esEditable}
        placeholder="Pega el texto del Storyboard de PDCA aquí..."
      />
      <div className="mt-4">
        <p className="text-xs font-bold mb-2">Subir imagen del Storyboard (opcional)</p>
        {imagenStoryboard ? (
          <div className="relative border rounded-md overflow-hidden bg-black/5 group">
            <img
              src={imagenStoryboard}
              alt="Storyboard"
              className="w-full h-auto object-contain max-h-[500px]"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
              onClick={() => alCambiarImagenStoryboard?.(undefined)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-md p-8 text-center bg-secondary/10 hover:bg-secondary/20 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="storyboard-upload"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) {
                  const lector = new FileReader();
                  lector.onload = (evento) => {
                    alCambiarImagenStoryboard?.(evento.target?.result as string);
                  };
                  lector.readAsDataURL(archivo);
                }
              }}
            />
            <label htmlFor="storyboard-upload" className="cursor-pointer flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Haz clic para subir imagen</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
