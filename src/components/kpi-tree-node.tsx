import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CustomNodeProps {
  id: string;
  data: any;
  selected: boolean;
}

export function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { setNodes } = useReactFlow();

  const update_data = (field: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)),
    );
  };

  const delete_node = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  // Define colors (fully opaque)
  const color_map: Record<string, string> = {
    default: "bg-card border-border",
    white: "bg-white border-gray-300 text-gray-800 dark:bg-white dark:text-gray-800",
    blue: "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200",
    red: "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200",
    green:
      "bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200",
    yellow:
      "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-200",
  };
  const bg_color_class = color_map[data.color || "default"] || color_map["default"];

  return (
    <div
      className={cn(
        "relative rounded-md border p-3 shadow-sm min-w-[160px] group transition-colors",
        bg_color_class,
        selected ? "ring-2 ring-primary border-transparent" : "",
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      {/* Edit Controls (visible on hover/select) */}
      <div
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border shadow-sm rounded-md p-1 transition-opacity z-10",
          selected
            ? "opacity-100"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
        )}
      >
        <button
          onClick={() => update_data("color", "default")}
          className="w-4 h-4 rounded-full bg-secondary border hover:scale-110 transition-transform"
          title="Normal"
        />
        <button
          onClick={() => update_data("color", "white")}
          className="w-4 h-4 rounded-full bg-white border border-gray-300 hover:scale-110 transition-transform"
          title="Blanco"
        />
        <button
          onClick={() => update_data("color", "blue")}
          className="w-4 h-4 rounded-full bg-blue-500 hover:scale-110 transition-transform"
          title="Azul"
        />
        <button
          onClick={() => update_data("color", "red")}
          className="w-4 h-4 rounded-full bg-red-500 hover:scale-110 transition-transform"
          title="Rojo"
        />
        <button
          onClick={() => update_data("color", "yellow")}
          className="w-4 h-4 rounded-full bg-amber-400 hover:scale-110 transition-transform"
          title="Amarillo"
        />
        <button
          onClick={() => update_data("color", "green")}
          className="w-4 h-4 rounded-full bg-emerald-500 hover:scale-110 transition-transform"
          title="Verde"
        />
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={delete_node}
          className="text-muted-foreground hover:text-destructive p-0.5"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 nodrag">
        <Input
          value={data.label}
          onChange={(e) => update_data("label", e.target.value)}
          className="h-7 text-sm font-semibold text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1"
          placeholder="Nombre del KPI"
        />
        <Input
          value={data.value}
          onChange={(e) => update_data("value", e.target.value)}
          className="h-6 text-xs text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1 font-mono"
          placeholder="Valor (ej. 2.8%)"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary" />
    </div>
  );
}
