/**
 * @fileoverview Custom React Flow node representing an editable KPI/PI card inside the KPI Tree.
 */

import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/class_names";
import { KPI_NODE_COLOR_OPTIONS, type KpiNodeData } from "./kpi_tree_helpers";

interface CustomNodeProps {
  id: string;
  data: KpiNodeData;
  selected: boolean;
}

/** Editable KPI node supporting inline label/value updates, color coding, and deletion. */
export function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { setNodes } = useReactFlow();

  const update_node_data = (field_name: string, field_value: string) => {
    setNodes((previous_nodes) =>
      previous_nodes.map((flow_node) =>
        flow_node.id === id
          ? { ...flow_node, data: { ...flow_node.data, [field_name]: field_value } }
          : flow_node,
      ),
    );
  };

  const delete_node = () => {
    setNodes((previous_nodes) => previous_nodes.filter((flow_node) => flow_node.id !== id));
  };

  const active_color =
    KPI_NODE_COLOR_OPTIONS.find((option) => option.key === (data.color || "default")) ||
    KPI_NODE_COLOR_OPTIONS[0];

  return (
    <div
      className={cn(
        "relative rounded-md border p-3 shadow-sm min-w-[160px] group transition-colors",
        active_color?.card_class,
        selected ? "ring-2 ring-primary border-transparent" : "",
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border shadow-sm rounded-md p-1 transition-opacity z-10",
          selected
            ? "opacity-100"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
        )}
      >
        {KPI_NODE_COLOR_OPTIONS.map((color_option) => (
          <button
            key={color_option.key}
            type="button"
            onClick={() => update_node_data("color", color_option.key)}
            className={cn(
              "w-4 h-4 rounded-full hover:scale-110 transition-transform",
              color_option.swatch_class,
            )}
            title={color_option.title}
          />
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={delete_node}
          className="text-muted-foreground hover:text-destructive p-0.5"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 nodrag">
        <Input
          value={data.label}
          onChange={(change_event) => update_node_data("label", change_event.target.value)}
          className="h-7 text-sm font-semibold text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1"
          placeholder="Nombre del KPI"
        />
        <Input
          value={data.value}
          onChange={(change_event) => update_node_data("value", change_event.target.value)}
          className="h-6 text-xs text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1 font-mono"
          placeholder="Valor (ej. 2.8%)"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary" />
    </div>
  );
}
