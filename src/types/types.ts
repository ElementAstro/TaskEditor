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
      inputs?: TaskParameter[];
      outputs?: TaskParameter[];
    };
    conditions?: BranchCondition[];
    loopConfig?: LoopConfig;
    defaultPath?: string;
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

export interface TaskParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  defaultValue?: string | number | boolean | Array<unknown> | Record<string, unknown>;
  required?: boolean;
  options?: string[]; // 用于枚举类型
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export type NodeType = 
  | "task" 
  | "start" 
  | "end" 
  | "decision" 
  | "branch" 
  | "loop" 
  | "group";

export interface BranchCondition {
  type: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "matches";
  field: string;
  value: string | number | boolean;
}

export interface LoopConfig {
  type: "count" | "while" | "forEach";
  count?: number;
  condition?: BranchCondition;
  collection?: string;
  maxIterations?: number;
}
