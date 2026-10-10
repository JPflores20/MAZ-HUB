import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FONT_SIZES = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
  { label: "36", value: "7" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder = "Escribe aquí...",
  minHeight = "140px",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  React.useEffect(() => {
    if (!editorRef.current) return;
    if (!isMounted.current) {
      editorRef.current.innerHTML = value || "";
      isMounted.current = true;
      return;
    }
    if (value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCmd = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={cn("border border-border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30 flex-wrap">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("bold");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("italic");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Unordered list */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertUnorderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        {/* Ordered list */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertOrderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Font size */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
          <span className="font-medium">Tamaño:</span>
          <Select defaultValue="3" onValueChange={(val) => execCmd("fontSize", val)}>
            <SelectTrigger
              className="h-7 w-[64px] text-xs px-2 focus:ring-0"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs cursor-pointer">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight }}
        className="p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
      />

      {/* Placeholder style */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `,
        }}
      />
    </div>
  );
}
