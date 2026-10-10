import React, { useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

/**
 * Props for the RichTextEditor component
 */
export interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

/**
 * Un editor de texto enriquecido mínimo.
 * Permite negrita, itálica, y listas.
 */
export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor_ref = useRef<HTMLDivElement>(null);
  const is_mounted = useRef(false);

  // Sync external changes (e.g. when loading from database)
  useEffect(() => {
    if (!editor_ref.current) return;

    if (!is_mounted.current) {
      editor_ref.current.innerHTML = value || "";
      is_mounted.current = true;
      return;
    }

    if (value !== editor_ref.current.innerHTML) {
      editor_ref.current.innerHTML = value || "";
    }
  }, [value]);

  /**
   * Ejecuta un comando del document (ej. bold, italic)
   */
  const exec_cmd = (cmd: string, arg?: string) => {
    editor_ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editor_ref.current) {
      onChange(editor_ref.current.innerHTML);
    }
  };

  /**
   * Maneja la entrada de texto
   */
  const handle_input = () => {
    if (editor_ref.current) {
      onChange(editor_ref.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec_cmd("bold");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec_cmd("italic");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec_cmd("insertUnorderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec_cmd("insertOrderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>
      </div>
      {/* Área editable */}
      <div
        ref={editor_ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handle_input}
        onBlur={handle_input}
        className="min-h-[120px] p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Describe el problema observado..."
      />
    </div>
  );
}
