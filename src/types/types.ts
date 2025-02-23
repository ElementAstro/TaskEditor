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
    exposureConfig?: ExposureConfig;
    filterConfig?: FilterConfig;
    focusConfig?: FocusConfig;
    ditherConfig?: DitherConfig;
    transform?: {
      scale: number;
      rotation: number;
    };
    gridAlignment?: {
      enabled: boolean;
      size: number;
    };
    autoSave?: {
      enabled: boolean;
      interval: number;
    };
    version?: string;
    changelog?: string[];
    weather?: {
      temperature: number;
      humidity: number;
      cloudCover: number;
      seeing: number;
    };
    telescope?: {
      ra: number;
      dec: number;
      pier: 'east' | 'west';
      tracking: boolean;
      connected: boolean;
    };
    camera?: {
      temperature: number;
      cooling: boolean;
      connected: boolean;
      gain: number;
      offset: number;
    };
    guiding?: {
      enabled: boolean;
      rmsRA: number;
      rmsDEC: number;
      exposure: number;
      connected: boolean;
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
  | "group"
  | "smartExposure" 
  | "filterWheel"
  | "focus"
  | "dither"
  | "cooling"
  | "platesolving";

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

export interface ExposureConfig {
  exposureTime: number;    // 曝光时间(秒)
  gain: number;           // 增益
  binning: 1 | 2 | 3 | 4; // 像素合并
  isAutoExposure: boolean; // 是否自动曝光
  targetADU?: number;     // 目标ADU值
  maxExposureTime?: number; // 最大曝光时间
  frame: 'Light' | 'Dark' | 'Flat' | 'Bias'; // 拍摄类型
}

export interface FilterConfig {
  position: number;        // 滤镜轮位置
  filterName: string;     // 滤镜名称
  offsets?: {
    focus: number;       // 对焦补偿值
    guiding: number;    // 导星补偿值
  };
}

export interface FocusConfig {
  method: 'HFD' | 'FWHM' | 'Contrast';  // 对焦方法
  steps: number;         // 步进数
  stepSize: number;     // 步进大小
  samples: number;      // 采样次数
  exposure: number;     // 对焦曝光时间
}

export interface DitherConfig {
  pixelSize: number;    // 抖动像素大小
  pattern: 'Spiral' | 'Random' | 'Grid';  // 抖动模式
  minMove: number;      // 最小移动距离
  settle: {
    time: number;      // 稳定时间
    accuracy: number;  // 稳定精度
  };
}

export interface KeyboardShortcut {
  id: string;
  name: string;
  keys: string[];
  action: () => void;
}

export interface WeatherCondition {
  timestamp: number;
  temperature: number;
  humidity: number;
  cloudCover: number;
  seeing: number;
  forecast?: {
    next24Hours: {
      temperature: number[];
      cloudCover: number[];
      seeing: number[];
    };
  };
}

export interface TaskLogic {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  params: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
  next: string[];
  conditions?: BranchCondition[];
  loopConfig?: LoopConfig;
  nodeConfig?: {
    exposureConfig?: ExposureConfig;
    filterConfig?: FilterConfig;
    focusConfig?: FocusConfig;
    ditherConfig?: DitherConfig;
  };
}

export type VariableValue = string | number | boolean | Array<unknown> | Record<string, unknown>;

export interface WorkflowExport {
  metadata: {
    name: string;
    description: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
  tasks: TaskLogic[];
  connections: {
    source: string;
    target: string;
    condition?: string;
  }[];
  variables: Record<string, VariableValue>;
}

export interface WorkflowExecutionState {
  isRunning: boolean;
  isPaused: boolean;
  currentNodeId: string | null;
  executionPath: string[];
  variables: Record<string, VariableValue>;
  stepDelay: number;
  centerOnStep: boolean;
  error: string | null;
}

export interface FileUploadData {
  name: string;
  description: string;
  path: string;
  fileType: string;
  params?: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
}

export interface FileDownloadData {
  name: string;
  description: string;
  url: string;
  savePath: string;
  params?: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
}

export interface FolderManagerData {
  name: string;
  description: string;
  operation: 'create' | 'delete' | 'move' | 'rename';
  folderPath: string;
  params?: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
}
