/**
 * @fileoverview Interactive React Flow canvas for designing and persisting KPI -> Process Indicator trees.
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize2, Minimize2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ErrorBoundary } from "@/shared/ui/error_boundary";
import { StepCard } from "@/shared/ui/step_card";
import { cn } from "@/shared/utils/class_names";
import {
  cycle_edge_dash_style,
  DEFAULT_KPI_EDGES,
  DEFAULT_KPI_NODES,
  serialize_kpi_edges,
  serialize_kpi_nodes,
} from "./kpi_tree_helpers";
import { CustomNode } from "./kpi_tree_node";

const NODE_TYPES = {
  custom: CustomNode,
};

interface KpiTreeProps {
  initialNodes?: Record<string, unknown>[];
  initialEdges?: Record<string, unknown>[];
  onChange?: (nodes: Record<string, unknown>[], edges: Record<string, unknown>[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

/** Error-boundary-wrapped interactive KPI Tree canvas. */
export function KpiTreeInteractive(props: KpiTreeProps) {
  return (
    <ErrorBoundary>
      <KpiTreeInteractiveInner {...props} />
    </ErrorBoundary>
  );
}

function KpiTreeInteractiveInner({
  initialNodes,
  initialEdges,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: KpiTreeProps) {
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const start_nodes =
    initialNodes && initialNodes.length > 0
      ? (initialNodes as unknown as Node[])
      : DEFAULT_KPI_NODES;
  const start_edges =
    initialEdges && initialEdges.length > 0
      ? (initialEdges as unknown as Edge[])
      : DEFAULT_KPI_EDGES;
  const [nodes, setNodes, onNodesChange] = useNodesState(start_nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(start_edges);
  const debounce_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const is_initial_mount = useRef(true);

  useEffect(() => {
    if (!onChange) return;
    if (is_initial_mount.current) {
      is_initial_mount.current = false;
      return;
    }
    if (debounce_ref.current) clearTimeout(debounce_ref.current);
    debounce_ref.current = setTimeout(() => {
      onChange(serialize_kpi_nodes(nodes), serialize_kpi_edges(edges));
    }, 500);
    return () => {
      if (debounce_ref.current) clearTimeout(debounce_ref.current);
    };
  }, [nodes, edges, onChange]);

  const on_connect = useCallback(
    (connection_params: Connection) =>
      setEdges((previous_edges) => addEdge(connection_params, previous_edges)),
    [setEdges],
  );

  const on_edge_click = useCallback(
    (_click_event: React.MouseEvent, clicked_edge: Edge) => {
      setEdges((previous_edges) =>
        previous_edges.map((flow_edge) =>
          flow_edge.id === clicked_edge.id ? cycle_edge_dash_style(flow_edge) : flow_edge,
        ),
      );
    },
    [setEdges],
  );

  const add_node = () => {
    const new_node: Node = {
      id: `${Date.now()}`,
      type: "custom",
      data: { label: "Nuevo KPI", value: "0.0", color: "default" },
      position: { x: 250, y: 250 },
    };
    setNodes((previous_nodes) => [...previous_nodes, new_node]);
  };

  return (
    <StepCard
      className={cn(
        "transition-all duration-300",
        is_fullscreen && "fixed inset-0 z-50 rounded-none border-none bg-background shadow-none p-4",
      )}
      title="PASO 4: KPI TREE (IP)"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(click_event) => {
              click_event.stopPropagation();
              add_node();
            }}
          >
            <Plus className="mr-2 size-4" /> Agregar Nodo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(click_event) => {
              click_event.stopPropagation();
              set_is_fullscreen(!is_fullscreen);
            }}
          >
            {is_fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-xs text-muted-foreground ml-[36px]">
          Desglosa el KPI en Indicadores de Proceso (IP). Haz doble clic en un nodo o enlace para
          eliminarlo. Haz clic normal en el enlace para cambiar su estilo.
        </p>
      </div>

      <div
        className={cn(
          "border border-border rounded-lg bg-secondary/20 overflow-hidden relative transition-all duration-300",
          is_fullscreen ? "h-[calc(100vh-80px)]" : "h-[450px]",
        )}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={on_connect}
          onEdgeClick={on_edge_click}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Background color="var(--color-muted-foreground)" gap={16} />
        </ReactFlow>
      </div>
    </StepCard>
  );
}
