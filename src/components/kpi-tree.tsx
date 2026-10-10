import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepCard } from "@/components/ui/step-card";
import { CustomNode } from "@/components/kpi-tree-node";

const nodeTypes = {
  custom: CustomNode,
};

const defaultNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: { label: "KPI Principal", value: "0.0%", color: "default" },
    position: { x: 250, y: 5 },
  },
];

const defaultEdges: Edge[] = [];

// Serialize nodes/edges to plain objects safe for Firestore
function serialize_nodes(nodes: Node[]): any[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.position.x, y: n.position.y },
    data: { ...n.data },
  }));
}

function serialize_edges(edges: Edge[]): any[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated || false,
    style: e.style || {},
  }));
}

interface KpiTreeProps {
  initialNodes?: any[];
  initialEdges?: any[];
  onChange?: (nodes: any[], edges: any[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

import { ErrorBoundary } from "@/components/ui/error-boundary";

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
    initialNodes && initialNodes.length > 0 ? (initialNodes as Node[]) : defaultNodes;
  const start_edges =
    initialEdges && initialEdges.length > 0 ? (initialEdges as Edge[]) : defaultEdges;
  const [nodes, setNodes, onNodesChange] = useNodesState(start_nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(start_edges);
  const debounce_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const is_initial_mount = useRef(true);

  // Emit changes to parent with debounce (skip initial mount)
  useEffect(() => {
    if (!onChange) return;
    if (is_initial_mount.current) {
      is_initial_mount.current = false;
      return;
    }
    if (debounce_ref.current) clearTimeout(debounce_ref.current);
    debounce_ref.current = setTimeout(() => {
      onChange(serialize_nodes(nodes), serialize_edges(edges));
    }, 500);
    return () => {
      if (debounce_ref.current) clearTimeout(debounce_ref.current);
    };
  }, [nodes, edges, onChange]);

  const on_connect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Click on an edge to cycle: solid → dashed → animated dashed → solid
  const on_edge_click = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edge.id) return e;

          const current_style = e.style || {};
          const is_dashed = current_style.strokeDasharray === "6 4";
          const is_animated = e.animated === true;

          if (!is_dashed && !is_animated) {
            return { ...e, animated: false, style: { ...current_style, strokeDasharray: "6 4" } };
          } else if (is_dashed && !is_animated) {
            const { strokeDasharray, ...rest_style } = current_style as any;
            return { ...e, animated: true, style: rest_style };
          } else {
            const { strokeDasharray, ...rest_style } = current_style as any;
            return { ...e, animated: false, style: rest_style };
          }
        }),
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
    setNodes((nds) => [...nds, new_node]);
  };

  return (
    <StepCard
      className={cn(
        "transition-all duration-300",
        is_fullscreen &&
          "fixed inset-0 z-50 rounded-none border-none bg-background shadow-none p-4",
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
            onClick={(e) => {
              e.stopPropagation();
              add_node();
            }}
          >
            <Plus className="mr-2 size-4" /> Agregar Nodo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
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
          nodeTypes={nodeTypes}
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
