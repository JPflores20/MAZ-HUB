import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface PropiedadesEditorTextoEnriquecido {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

/** Editor de texto enriquecido mínimo con barra de herramientas */
export function EditorTextoEnriquecido({
  value,
  onChange,
  disabled,
}: PropiedadesEditorTextoEnriquecido) {
  const referenciaEditor = useRef<HTMLDivElement>(null);
  const yaMontado = useRef(false);

  // Sincronizar cambios externos (p.ej. al cargar datos desde la base de datos)
  React.useEffect(() => {
    if (!referenciaEditor.current) return;

    if (!yaMontado.current) {
      referenciaEditor.current.innerHTML = value || "";
      yaMontado.current = true;
      return;
    }

    if (value !== referenciaEditor.current.innerHTML) {
      referenciaEditor.current.innerHTML = value || "";
    }
  }, [value]);

  const ejecutarComando = (comando: string, argumento?: string) => {
    referenciaEditor.current?.focus();
    document.execCommand(comando, false, argumento);
    if (referenciaEditor.current) {
      onChange(referenciaEditor.current.innerHTML);
    }
  };

  const manejarEntrada = () => {
    if (referenciaEditor.current) {
      onChange(referenciaEditor.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertOrderedList"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>
      </div>
      {/* Área editable */}
      <div
        ref={referenciaEditor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={manejarEntrada}
        onBlur={manejarEntrada}
        className="min-h-[120px] p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Describe el problema observado..."
      />
    </div>
  );
}
