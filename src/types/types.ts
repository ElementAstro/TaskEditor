import type { Node, Edge } from "reactflow";

export interface NodeData extends Node {
  data: {
    name: string;
    description: string;
    color?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    assignee?: string;
    estimatedTime?: string;
    tags?: string[];
    params?: {
      [key: string]: {
        [key: string]: string | number | boolean;
      };
    };
  };
}

export type EdgeData = Edge & {
  animated?: boolean;
  style?: {
    stroke?: string;
  };
};

export interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: number;
  state: {
    nodes: Node[];
    edges: Edge[];
  };
}

export interface HistoryGroup {
  id: string;
  entries: HistoryEntry[];
  timestamp: number;
}
