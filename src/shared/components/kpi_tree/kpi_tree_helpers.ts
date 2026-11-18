/**
 * @fileoverview Graph defaults, node color options, and Firestore-safe serialization for KPI Trees.
 */

import type { Edge, Node } from "@xyflow/react";

export interface KpiNodeData extends Record<string, unknown> {
  label: string;
  value: string;
  color?: string;
}

export interface KpiNodeColorOption {
  key: string;
  title: string;
  swatch_class: string;
  card_class: string;
}

export const KPI_NODE_COLOR_OPTIONS: KpiNodeColorOption[] = [
  {
    key: "default",
    title: "Normal",
    swatch_class: "bg-secondary border",
    card_class: "bg-card border-border",
  },
  {
    key: "white",
    title: "Blanco",
    swatch_class: "bg-white border border-gray-300",
    card_class: "bg-white border-gray-300 text-gray-800 dark:bg-white dark:text-gray-800",
  },
  {
    key: "blue",
    title: "Azul",
    swatch_class: "bg-blue-500",
    card_class:
      "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200",
  },
  {
    key: "red",
    title: "Rojo",
    swatch_class: "bg-red-500",
    card_class:
      "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200",
  },
  {
    key: "yellow",
    title: "Amarillo",
    swatch_class: "bg-amber-400",
    card_class:
      "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-200",
  },
  {
    key: "green",
    title: "Verde",
    swatch_class: "bg-emerald-500",
    card_class:
      "bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200",
  },
];

export const DEFAULT_KPI_NODES: Node[] = [
  {
    id: "1",
    type: "custom",
    data: { label: "KPI Principal", value: "0.0%", color: "default" },
    position: { x: 250, y: 5 },
  },
];

export const DEFAULT_KPI_EDGES: Edge[] = [];

/** Serializes React Flow nodes into plain Firestore-compatible objects. */
export function serialize_kpi_nodes(nodes: Node[]): Record<string, unknown>[] {
  return nodes.map((flow_node) => ({
    id: flow_node.id,
    type: flow_node.type,
    position: { x: flow_node.position.x, y: flow_node.position.y },
    data: { ...flow_node.data },
  }));
}

/** Serializes React Flow edges into plain Firestore-compatible objects. */
export function serialize_kpi_edges(edges: Edge[]): Record<string, unknown>[] {
  return edges.map((flow_edge) => ({
    id: flow_edge.id,
    source: flow_edge.source,
    target: flow_edge.target,
    animated: flow_edge.animated || false,
    style: flow_edge.style || {},
  }));
}

/** Cycles an edge style between solid, static dashed, and animated line states. */
export function cycle_edge_dash_style(flow_edge: Edge): Edge {
  const current_style = flow_edge.style || {};
  const is_dashed = current_style.strokeDasharray === "6 4";
  const is_animated = flow_edge.animated === true;

  if (!is_dashed && !is_animated) {
    return {
      ...flow_edge,
      animated: false,
      style: { ...current_style, strokeDasharray: "6 4" },
    };
  }

  const { strokeDasharray: _removed_dash, ...rest_style } = current_style;
  return {
    ...flow_edge,
    animated: is_dashed && !is_animated,
    style: rest_style,
  };
}
