/**
 * rich_text_toolbar.tsx
 * Barra de herramientas de formato enriquecido (negrita, cursiva, listas y tamaño de fuente).
 */
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const FONT_SIZE_OPTIONS = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
  { label: "36", value: "7" },
];

interface RichTextToolbarProps {
  onCommand: (command_name: string, command_argument?: string) => void;
}

/**
 * Renderiza los controles de formato y tamaño tipográfico para `<RichTextEditor />`.
 *
 * @param props.onCommand - Ejecuta un comando de edición sobre el documento enriquecido.
 * @returns Barra de herramientas HTML.
 */
export function RichTextToolbar({ onCommand }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30 flex-wrap">
      <button
        type="button"
        onMouseDown={(mouse_event) => {
          mouse_event.preventDefault();
          onCommand("bold");
        }}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Negrita"
      >
        <Bold className="size-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(mouse_event) => {
          mouse_event.preventDefault();
          onCommand("italic");
        }}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Itálica"
      >
        <Italic className="size-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <button
        type="button"
        onMouseDown={(mouse_event) => {
          mouse_event.preventDefault();
          onCommand("insertUnorderedList");
        }}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Lista de viñetas"
      >
        <List className="size-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(mouse_event) => {
          mouse_event.preventDefault();
          onCommand("insertOrderedList");
        }}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Lista numerada"
      >
        <ListOrdered className="size-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
        <span className="font-medium">Tamaño:</span>
        <Select defaultValue="3" onValueChange={(selected_size) => onCommand("fontSize", selected_size)}>
          <SelectTrigger
            className="h-7 w-[64px] text-xs px-2 focus:ring-0"
            onMouseDown={(mouse_event) => mouse_event.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((font_option) => (
              <SelectItem
                key={font_option.value}
                value={font_option.value}
                className="text-xs cursor-pointer"
              >
                {font_option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
