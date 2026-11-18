/**
 * rich_text_editor.tsx
 * Editor de texto enriquecido sanitizado contra XSS con barra de herramientas integrada.
 */
import React, { useRef } from "react";
import { cn } from "@/shared/utils/class_names";
import { sanitize_rich_text_html } from "@/core/security";
import { RichTextToolbar } from "./rich_text_toolbar";

export interface RichTextEditorProps {
  value: string;
  onChange: (next_html: string) => void;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  minHeight?: string | undefined;
  className?: string | undefined;
}

/**
 * Área editable `contentEditable` que sanea cualquier entrada HTML mediante `DOMPurify`.
 *
 * @param props - Contenido HTML controlado, callback `onChange` y estado deshabilitado.
 * @returns Componente de edición de texto enriquecido.
 */
export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder = "Escribe aquí...",
  minHeight = "140px",
  className,
}: RichTextEditorProps) {
  const editor_ref = useRef<HTMLDivElement>(null);
  const is_mounted_ref = useRef(false);

  React.useEffect(() => {
    if (!editor_ref.current) return;
    const safe_html = sanitize_rich_text_html(value || "");
    if (!is_mounted_ref.current) {
      editor_ref.current.innerHTML = safe_html;
      is_mounted_ref.current = true;
      return;
    }
    if (safe_html !== editor_ref.current.innerHTML) {
      editor_ref.current.innerHTML = safe_html;
    }
  }, [value]);

  const execute_editor_command = (command_name: string, command_argument?: string) => {
    if (disabled) return;
    editor_ref.current?.focus();
    document.execCommand(command_name, false, command_argument);
    if (editor_ref.current) {
      onChange(sanitize_rich_text_html(editor_ref.current.innerHTML));
    }
  };

  const handle_editor_input = () => {
    if (disabled || !editor_ref.current) return;
    onChange(sanitize_rich_text_html(editor_ref.current.innerHTML));
  };

  return (
    <div className={cn("border border-border rounded-md overflow-hidden", className)}>
      <RichTextToolbar onCommand={execute_editor_command} />

      <div
        ref={editor_ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handle_editor_input}
        onBlur={handle_editor_input}
        style={{ minHeight }}
        className="rich-text-editable p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}
