/**
 * @fileoverview Editor de texto enriquecido sanitizado para descripciones del problema en la Fase PLAN.
 */
import { useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { sanitize_rich_text_html } from "@/core/security";

export interface RichTextEditorProps {
  value: string;
  onChange: (html_sanitizado: string) => void;
  disabled?: boolean;
}

/**
 * Editor minimalista con soporte para negrita, cursiva y listas, sanitizando siempre la salida HTML.
 */
export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const referencia_editor = useRef<HTMLDivElement>(null);
  const esta_montado = useRef(false);

  useEffect(() => {
    if (!referencia_editor.current) return;
    const html_seguro = sanitize_rich_text_html(value || "");

    if (!esta_montado.current) {
      referencia_editor.current.innerHTML = html_seguro;
      esta_montado.current = true;
      return;
    }

    if (html_seguro !== referencia_editor.current.innerHTML) {
      referencia_editor.current.innerHTML = html_seguro;
    }
  }, [value]);

  const ejecutar_comando = (comando: string, argumento?: string) => {
    if (disabled) return;
    referencia_editor.current?.focus();
    document.execCommand(comando, false, argumento);
    if (referencia_editor.current) {
      onChange(sanitize_rich_text_html(referencia_editor.current.innerHTML));
    }
  };

  const manejar_entrada_editor = () => {
    if (disabled || !referencia_editor.current) return;
    onChange(sanitize_rich_text_html(referencia_editor.current.innerHTML));
  };

  const botones_formato = [
    { comando: "bold", titulo: "Negrita", icono: Bold },
    { comando: "italic", titulo: "Itálica", icono: Italic },
    { comando: "insertUnorderedList", titulo: "Lista de viñetas", icono: List },
    { comando: "insertOrderedList", titulo: "Lista numerada", icono: ListOrdered },
  ];

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        {botones_formato.map((boton_formato, indice_boton) => {
          const IconoFormato = boton_formato.icono;
          return (
            <div key={boton_formato.comando} className="flex items-center">
              {indice_boton === 2 && <div className="w-px h-4 bg-border mx-1" />}
              <button
                type="button"
                onMouseDown={(evento) => {
                  evento.preventDefault();
                  ejecutar_comando(boton_formato.comando);
                }}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={boton_formato.titulo}
              >
                <IconoFormato className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <div
        ref={referencia_editor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={manejar_entrada_editor}
        onBlur={manejar_entrada_editor}
        className="min-h-[120px] p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Describe el problema observado..."
      />
    </div>
  );
}
