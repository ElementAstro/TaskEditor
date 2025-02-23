import { create } from "zustand";
import {
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import type {
  NodeData,
  EdgeData,
  HistoryEntry,
  HistoryGroup,
  TaskParameter,
  KeyboardShortcut,
  WeatherCondition,
  WorkflowExecutionState,
} from "@/types/types";
import getLayoutedElements from "../utils/autoLayout";
import { WorkflowExecutor } from "@/utils/workflowExecutor";

import type { ReactFlowInstance } from 'reactflow';

declare global {
  interface Window {
    reactFlowInstance: ReactFlowInstance;
  }
}

const initialNodes = [
  {
    id: "1",
    type: "start",
    data: { name: "Start", description: "Begin the workflow" },
    position: { x: 250, y: 5 },
  },
];

const generateUniqueId = (prefix: string, nodes: Node[]): string => {
  let counter = 1;
  let newId = `${prefix}-${counter}`;
  
  while (nodes.some(node => node.id === newId)) {
    counter++;
    newId = `${prefix}-${counter}`;
  }
  
  return newId;
};

const initialNodeData = {
  task: {
    name: "New Task",
    description: "This is a new task",
  },
  branch: {
    name: "New Branch",
    description: "Conditional branching",
    conditions: [],
    defaultPath: "false",
  },
  loop: {
    name: "New Loop",
    description: "Loop operation",
    loopConfig: {
      type: "count",
      count: 1,
      maxIterations: 100,
    },
  },
  group: {
    name: "New Group",
    description: "A group container for nodes",
  },
  smartExposure: {
    name: "Smart Exposure",
    description: "Auto exposure control",
    params: {
      inputs: [
        {
          name: "minExposure",
          type: "number",
          description: "Minimum exposure time (seconds)",
          required: true,
          defaultValue: 0.001,
          validation: { min: 0.001, max: 3600 }
        },
        {
          name: "maxExposure",
          type: "number",
          description: "Maximum exposure time (seconds)",
          required: true,
          defaultValue: 300,
          validation: { min: 0.001, max: 3600 }
        },
        {
          name: "targetADU",
          type: "number",
          description: "Target ADU value",
          required: false,
          defaultValue: 30000,
          validation: { min: 1000, max: 65535 }
        },
        {
          name: "binning",
          type: "number",
          description: "Pixel binning",
          required: false,
          defaultValue: 1,
          validation: { min: 1, max: 4 }
        }
      ],
      outputs: [
        {
          name: "exposureTime",
          type: "number",
          description: "Calculated exposure time"
        },
        {
          name: "measuredADU",
          type: "number",
          description: "Measured ADU value"
        },
        {
          name: "HFR",
          type: "number",
          description: "Half Flux Radius"
        },
        {
          name: "FWHM",
          type: "number",
          description: "Full Width at Half Maximum"
        }
      ]
    },
    exposureConfig: {
      exposureTime: 1,
      gain: 0,
      binning: 1,
      isAutoExposure: true,
      targetADU: 30000,
      maxExposureTime: 300,
      frame: 'Light'
    }
  },
  filterWheel: {
    name: "Filter Wheel",
    description: "Change filter position",
    params: {
      inputs: [
        {
          name: "position",
          type: "number",
          description: "Filter wheel position",
          required: true,
          validation: { min: 1, max: 8 }
        },
        {
          name: "filterName",
          type: "string",
          description: "Filter name",
          required: true,
          options: ["L", "R", "G", "B", "Ha", "OIII", "SII"]
        }
      ],
      outputs: [
        {
          name: "focusOffset",
          type: "number",
          description: "Focus offset for this filter"
        }
      ]
    }
  },
  focus: {
    name: "Auto Focus",
    description: "Auto focus control",
    params: {
      inputs: [
        {
          name: "method",
          type: "string",
          description: "Focus method",
          required: true,
          defaultValue: "HFD",
          options: ["HFD", "FWHM", "Contrast"]
        },
        {
          name: "steps",
          type: "number",
          description: "Number of steps",
          required: true,
          defaultValue: 7,
          validation: { min: 3, max: 15 }
        },
        {
          name: "stepSize",
          type: "number",
          description: "Step size (microns)",
          required: true,
          defaultValue: 100,
          validation: { min: 10, max: 1000 }
        },
        {
          name: "exposure",
          type: "number",
          description: "Focus exposure time",
          required: true,
          defaultValue: 3,
          validation: { min: 0.1, max: 10 }
        }
      ],
      outputs: [
        {
          name: "position",
          type: "number",
          description: "Best focus position"
        },
        {
          name: "hfdValue",
          type: "number",
          description: "HFD value"
        },
        {
          name: "temperature",
          type: "number",
          description: "Temperature at focus"
        }
      ]
    }
  },
  dither: {
    name: "Dither Control",
    description: "Dithering control",
    params: {
      inputs: [
        {
          name: "pixels",
          type: "number",
          description: "Dither size in pixels",
          required: true,
          defaultValue: 3,
          validation: { min: 1, max: 10 }
        },
        {
          name: "pattern",
          type: "string",
          description: "Dither pattern",
          required: true,
          defaultValue: "Spiral",
          options: ["Spiral", "Random", "Grid"]
        },
        {
          name: "settleTime",
          type: "number",
          description: "Settle time (seconds)",
          required: true,
          defaultValue: 5,
          validation: { min: 1, max: 30 }
        }
      ],
      outputs: [
        {
          name: "settleStatus",
          type: "boolean",
          description: "Settle status"
        },
        {
          name: "rmsError",
          type: "number",
          description: "RMS guiding error"
        }
      ]
    }
  },
  platesolving: {
    name: "Plate Solving",
    description: "Plate solving analysis",
    params: {
      inputs: [
        {
          name: "downsample",
          type: "number",
          description: "Downsample factor",
          required: false,
          defaultValue: 2,
          validation: { min: 1, max: 4 }
        },
        {
          name: "tolerance",
          type: "number",
          description: "Search radius (degrees)",
          required: false,
          defaultValue: 5,
          validation: { min: 1, max: 180 }
        }
      ],
      outputs: [
        {
          name: "ra",
          type: "number",
          description: "Right Ascension"
        },
        {
          name: "dec",
          type: "number",
          description: "Declination"
        },
        {
          name: "rotation",
          type: "number",
          description: "Field rotation"
        },
        {
          name: "scale",
          type: "number",
          description: "Image scale (arcsec/pixel)"
        }
      ]
    }
  },
  cooling: {
    name: "Camera Cooling",
    description: "Camera temperature control",
    params: {
      inputs: [
        {
          name: "temperature",
          type: "number",
          description: "Target temperature (°C)",
          required: true,
          defaultValue: -20,
          validation: { min: -40, max: 20 }
        },
        {
          name: "duration",
          type: "number",
          description: "Cool down duration (minutes)",
          required: false,
          defaultValue: 10,
          validation: { min: 1, max: 60 }
        }
      ],
      outputs: [
        {
          name: "currentTemp",
          type: "number",
          description: "Current temperature"
        },
        {
          name: "power",
          type: "number",
          description: "Cooler power %"
        }
      ]
    }
  }
};

interface EditorStore {
  // 状态
  nodes: Node[];
  edges: Edge[];
  selectedNode: NodeData | null;
  selectedEdge: EdgeData | null;
  bgColor: string;
  bgVariant: BackgroundVariant;
  isSidebarOpen: boolean;
  isPropertyPanelOpen: boolean;
  searchTerm: string;
  contextMenu: {
    x: number;
    y: number;
    type: "node" | "edge" | "pane";
  } | null;
  historyGroups: HistoryGroup[];
  
  // 添加 takeSnapshot 方法定义
  takeSnapshot: () => void;

  // 新增状态
  shortcuts: KeyboardShortcut[];
  weatherData: WeatherCondition | null;
  selectedNodes: Node[];
  isMultiSelectMode: boolean;
  autoSaveInterval: NodeJS.Timeout | null;
  versions: {
    id: string;
    timestamp: number;
    description: string;
    state: {
      nodes: Node[];
      edges: Edge[];
    };
  }[];

  // 新增执行相关状态
  executionState: WorkflowExecutionState;
  
  // 操作方法
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setSelectedNode: (node: NodeData | null) => void;
  setSelectedEdge: (edge: EdgeData | null) => void;
  setBgColor: (color: string) => void;
  setBgVariant: (variant: BackgroundVariant) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsPropertyPanelOpen: (isOpen: boolean) => void;
  setSearchTerm: (term: string) => void;
  setContextMenu: (
    menu: { x: number; y: number; type: "node" | "edge" | "pane" } | null
  ) => void;

  // 新增方法
  setShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  updateWeatherData: (data: WeatherCondition) => void;
  setSelectedNodes: (nodes: Node[]) => void;
  toggleMultiSelectMode: () => void;
  batchUpdateNodes: (updates: Partial<NodeData['data']>) => void;
  startAutoSave: (interval: number) => void;
  stopAutoSave: () => void;
  createVersion: (description: string) => void;
  compareVersions: (versionId1: string, versionId2: string) => {
    added: Node[];
    removed: Node[];
    modified: Node[];
  };
  restoreVersion: (versionId: string) => void;
  generateChangelog: () => string;

  // 新增执行相关方法
  startExecution: () => void;
  pauseExecution: () => void;
  stopExecution: () => void;
  stepExecution: () => void;
  setStepDelay: (delay: number) => void;
  setCenterOnStep: (center: boolean) => void;

  // 业务操作
  onConnect: (params: Edge | Connection) => void;
  updateNodeData: (id: string, newData: Partial<NodeData["data"]>) => void;
  updateEdgeData: (id: string, newData: Partial<EdgeData>) => void;
  addHistoryEntry: (action: string, details: string) => void;
  saveWorkflow: () => void;
  loadWorkflow: () => void;
  exportWorkflow: () => void;
  importWorkflow: (content: string) => void;
  handleAutoLayout: () => void;
  handleAddGroup: () => void;
  undo: () => void;
  redo: () => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  restoreState: (groupId: string, entryId: string) => void;
  addNode: (nodeData: Partial<Node>) => void;
  updateNodeParams: (
    nodeId: string,
    params: { inputs?: TaskParameter[]; outputs?: TaskParameter[] }
  ) => void;
  validateNodeParams: (nodeId: string) => boolean;

  // 天文观测相关方法
  updateTelescopeStatus: (status: Partial<NodeData['data']['telescope']>) => void;
  updateCameraStatus: (status: Partial<NodeData['data']['camera']>) => void;
  updateGuidingStatus: (status: Partial<NodeData['data']['guiding']>) => void;
  calculateOptimalExposure: (targetADU: number, currentADU: number) => number;
  calculateFocusStep: (currentHFD: number, targetHFD: number) => number;
  validateWeatherConditions: () => boolean;
}

const useEditorStore = create<EditorStore>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  bgColor: "#f1f5f9",
  bgVariant: BackgroundVariant.Lines,
  isSidebarOpen: true,
  isPropertyPanelOpen: true,
  searchTerm: "",
  contextMenu: null,
  historyGroups: [],

  // 实现新增的状态和方法
  shortcuts: [],
  weatherData: null,
  selectedNodes: [],
  isMultiSelectMode: false,
  autoSaveInterval: null,
  versions: [],

  executionState: {
    isRunning: false,
    isPaused: false,
    currentNodeId: null,
    executionPath: [],
    variables: {},
    stepDelay: 1000,
    centerOnStep: true,
    error: null
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes);

      // 记录重要变化到历史记录
      changes.forEach((change) => {
        switch (change.type) {
          case "position":
            if (change.dragging === false) {
              // 拖拽结束时
              get().addHistoryEntry(
                "Move Node",
                `Moved node ${change.id} to (${change.position?.x}, ${change.position?.y})`
              );
            }
            break;
          case "remove":
            get().addHistoryEntry("Remove Node", `Removed node ${change.id}`);
            break;
          case "select":
            if (change.selected) {
              const node = state.nodes.find((n) => n.id === change.id);
              if (node && node.type) {
                get().setSelectedNode(node as NodeData);
              }
            }
            break;
        }
      });

      return { nodes: newNodes };
    });
  },
  onEdgesChange: (changes) => {
    set((state) => {
      const newEdges = applyEdgeChanges(changes, state.edges);

      // 记录重要变化到历史记录
      changes.forEach((change) => {
        switch (change.type) {
          case "remove":
            get().addHistoryEntry("Remove Edge", `Removed edge ${change.id}`);
            break;
          case "select":
            if (change.selected) {
              const edge = state.edges.find((e) => e.id === change.id);
              if (edge) {
                get().setSelectedEdge(edge);
              }
            }
            break;
        }
      });

      return { edges: newEdges };
    });
  },
  setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),
  setBgColor: (color) => set({ bgColor: color }),
  setBgVariant: (variant) => set({ bgVariant: variant }),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setIsPropertyPanelOpen: (isOpen) => set({ isPropertyPanelOpen: isOpen }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setContextMenu: (menu) => set({ contextMenu: menu }),

  onConnect: (params) => {
    const newEdge = {
      ...params,
      animated: true,
      style: { stroke: "#000" },
      type: "custom",
    };
    set((state) => ({
      edges: addEdge(newEdge, state.edges),
    }));
    get().addHistoryEntry(
      "Connect",
      `Connected ${params.source} to ${params.target}`
    );
  },

  updateNodeData: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    }));
    get().addHistoryEntry("Update Node", `Updated node ${id}`);
  },

  updateEdgeData: (id, newData) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, ...newData } : edge
      ),
    }));
    get().addHistoryEntry("Update Edge", `Updated edge ${id}`);
  },

  addHistoryEntry: (action, details) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: Date.now(),
      state: {
        nodes: get().nodes,
        edges: get().edges,
      },
    };

    set((state) => {
      const lastGroup = state.historyGroups[state.historyGroups.length - 1];
      if (lastGroup && Date.now() - lastGroup.timestamp < 5000) {
        return {
          historyGroups: [
            ...state.historyGroups.slice(0, -1),
            {
              ...lastGroup,
              entries: [...lastGroup.entries, newEntry],
            },
          ],
        };
      } else {
        return {
          historyGroups: [
            ...state.historyGroups,
            {
              id: Date.now().toString(),
              entries: [newEntry],
              timestamp: Date.now(),
            },
          ],
        };
      }
    });
  },

  saveWorkflow: () => {
    const { nodes, edges } = get();
    localStorage.setItem("workflow", JSON.stringify({ nodes, edges }));
    get().addHistoryEntry("Save Workflow", "Saved workflow to local storage");
  },

  loadWorkflow: () => {
    const savedWorkflow = localStorage.getItem("workflow");
    if (savedWorkflow) {
      const { nodes, edges } = JSON.parse(savedWorkflow);
      set({ nodes, edges });
      get().addHistoryEntry(
        "Load Workflow",
        "Loaded workflow from local storage"
      );
    }
  },

  exportWorkflow: () => {
    const { nodes, edges } = get();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ nodes, edges }));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    get().addHistoryEntry("Export Workflow", "Exported workflow to JSON file");
  },

  importWorkflow: (content) => {
    const { nodes, edges } = JSON.parse(content);
    set({ nodes, edges });
    get().addHistoryEntry(
      "Import Workflow",
      "Imported workflow from JSON file"
    );
  },

  handleAutoLayout: () => {
    const { nodes, edges } = get();
    const { nodes: layoutedNodes } = getLayoutedElements(
      nodes,
      edges,
      {
        direction: 'TB',
        nodeSpacing: 50,
        rankSpacing: 100,
        alignGroups: true,
        compactLayout: true,
        optimizeGroups: true
      }
    );
    
    // 使用onNodesChange更新节点位置
    get().onNodesChange(
      layoutedNodes.map(node => ({
        id: node.id,
        type: 'position',
        position: node.position,
      }))
    );

    // 添加到历史记录
    get().addHistoryEntry('Auto Layout', 'Applied automatic layout to workflow');
  },

  handleAddGroup: () => {
    const newGroup: NodeData = {
      id: `group-${Date.now()}`,
      type: "group",
      position: { x: 100, y: 100 },
      style: { width: 200, height: 200 },
      data: {
        name: "New Group",
        description: "A group container for nodes",
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newGroup],
    }));
    get().addHistoryEntry("Add Group", "Added new group node");
  },

  undo: () => {
    const { historyGroups } = get();
    if (historyGroups.length > 1) {
      const previousGroup = historyGroups[historyGroups.length - 2];
      const lastEntry = previousGroup.entries[previousGroup.entries.length - 1];
      set({
        nodes: lastEntry.state.nodes,
        edges: lastEntry.state.edges,
        historyGroups: historyGroups.slice(0, -1),
      });
    }
  },

  redo: () => {
    // 实现重做逻辑
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
    }));
    get().addHistoryEntry("Delete Node", `Deleted node ${nodeId}`);
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
    get().addHistoryEntry("Delete Edge", `Deleted edge ${edgeId}`);
  },

  restoreState: (groupId, entryId) => {
    const group = get().historyGroups.find((g) => g.id === groupId);
    if (group) {
      const entry = group.entries.find((e) => e.id === entryId);
      if (entry) {
        set({
          nodes: entry.state.nodes,
          edges: entry.state.edges,
        });
        get().addHistoryEntry(
          "Restore State",
          `Restored state from ${entry.action}`
        );
      }
    }
  },

  addNode: (nodeData: Partial<Node>) => {
    const nodes = get().nodes;
    const type = nodeData.type || "task";
    const newId = generateUniqueId(type, nodes);

    const newNode: Node = {
      id: newId,
      type,
      position: nodeData.position || { x: 0, y: 0 },
      data: {
        ...(initialNodeData[type as keyof typeof initialNodeData] || initialNodeData.task),
        ...nodeData.data,
      },
      ...nodeData,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().addHistoryEntry("Add Node", `Added new ${newNode.type} node`);
    return newNode;
  },

  updateNodeParams: (nodeId, params) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                params,
              },
            }
          : node
      ),
    }));
    get().addHistoryEntry(
      "Update Parameters",
      `Updated parameters for node ${nodeId}`
    );
  },

  validateNodeParams: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node || !node.data.params) return true;

    const { inputs = [], outputs = [] } = node.data.params;
    
    // 验证所有必填参数
    const validateParams = (params: TaskParameter[]) => {
      return params.every((param) => {
        if (param.required && !param.defaultValue) {
          return false;
        }
        return true;
      });
    };

    return validateParams(inputs) && validateParams(outputs);
  },

  setShortcuts: (shortcuts) => set({ shortcuts }),
  
  updateWeatherData: (data) => set({ weatherData: data }),
  
  setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),
  
  toggleMultiSelectMode: () => set((state) => ({ 
    isMultiSelectMode: !state.isMultiSelectMode 
  })),
  
  batchUpdateNodes: (updates) => {
    const { selectedNodes } = get();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        selectedNodes.find((n) => n.id === node.id)
          ? {
              ...node,
              data: { ...node.data, ...updates },
            }
          : node
      ),
    }));
  },

  startAutoSave: (interval) => {
    const timerId = setInterval(() => {
      get().saveWorkflow();
    }, interval);
    set({ autoSaveInterval: timerId });
  },

  stopAutoSave: () => {
    const { autoSaveInterval } = get();
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      set({ autoSaveInterval: null });
    }
  },

  createVersion: (description) => {
    const { nodes, edges } = get();
    set((state) => ({
      versions: [
        ...state.versions,
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          description,
          state: { nodes, edges },
        },
      ],
    }));
  },

  compareVersions: (versionId1, versionId2) => {
    const { versions } = get();
    const version1 = versions.find((v) => v.id === versionId1);
    const version2 = versions.find((v) => v.id === versionId2);

    if (!version1 || !version2) {
      throw new Error("Version not found");
    }

    const added = version2.state.nodes.filter(
      (node) => !version1.state.nodes.find((n) => n.id === node.id)
    );
    const removed = version1.state.nodes.filter(
      (node) => !version2.state.nodes.find((n) => n.id === node.id)
    );
    const modified = version2.state.nodes.filter((node) => {
      const oldNode = version1.state.nodes.find((n) => n.id === node.id);
      return oldNode && JSON.stringify(oldNode.data) !== JSON.stringify(node.data);
    });

    return { added, removed, modified };
  },

  restoreVersion: (versionId) => {
    const { versions } = get();
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      set({
        nodes: version.state.nodes,
        edges: version.state.edges,
      });
    }
  },

  generateChangelog: () => {
    const { versions } = get();
    return versions
      .map((version) => {
        return `Version ${version.id} - ${version.description}`;
      })
      .join("\n");
  },

  // 天文观测相关方法实现
  updateTelescopeStatus: (status) => {
    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.type === 'telescope') {
          return {
            ...node,
            data: {
              ...node.data,
              telescope: {
                ...node.data.telescope,
                ...status
              }
            }
          };
        }
        return node;
      })
    }));
  },

  updateCameraStatus: (status) => {
    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.type === 'camera') {
          return {
            ...node,
            data: {
              ...node.data,
              camera: {
                ...node.data.camera,
                ...status
              }
            }
          };
        }
        return node;
      })
    }));
  },

  updateGuidingStatus: (status) => {
    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.type === 'guiding') {
          return {
            ...node,
            data: {
              ...node.data,
              guiding: {
                ...node.data.guiding,
                ...status
              }
            }
          };
        }
        return node;
      })
    }));
  },

  calculateOptimalExposure: (targetADU, currentADU) => {
    if (currentADU <= 0) return 1; // 默认曝光时间
    const ratio = targetADU / currentADU;
    const newExposure = Math.sqrt(ratio); // 使用平方根关系调整曝光时间
    return Math.min(Math.max(newExposure, 0.001), 3600); // 限制在合理范围内
  },

  calculateFocusStep: (currentHFD, targetHFD) => {
    const difference = currentHFD - targetHFD;
    const stepSize = Math.abs(difference) * 5; // 根据 HFD 差异计算步进大小
    return Math.min(Math.max(stepSize, 1), 100); // 限制步进范围
  },

  validateWeatherConditions: () => {
    const { weatherData } = get();
    if (!weatherData) return false;

    // 实现天气条件验证逻辑
    const isTemperatureOk = weatherData.temperature > -10 && weatherData.temperature < 35;
    const isHumidityOk = weatherData.humidity < 85;
    const isCloudCoverOk = weatherData.cloudCover < 50;
    const isSeeingOk = weatherData.seeing < 3;

    return isTemperatureOk && isHumidityOk && isCloudCoverOk && isSeeingOk;
  },

  startExecution: () => {
    set((state) => ({
      executionState: {
        ...state.executionState,
        isRunning: true,
        isPaused: false,
        currentNodeId: null,
        executionPath: [],
        error: null
      }
    }));
    
    const executor = new WorkflowExecutor(get().nodes, get().edges);
    const runStep = async () => {
      const state = get().executionState;
      if (!state.isRunning || state.isPaused) return;

      const nextNodeId = executor.getNextNode(state.currentNodeId);
      if (!nextNodeId) {
        // 工作流结束
        get().stopExecution();
        return;
      }

      // 执行节点操作
      executor.executeNodeAction(nextNodeId);

      // 更新状态
      set((state) => ({
        executionState: {
          ...state.executionState,
          currentNodeId: nextNodeId,
          executionPath: [...state.executionState.executionPath, nextNodeId]
        }
      }));

      // 居中显示当前节点
      if (state.centerOnStep) {
        const node = get().nodes.find(n => n.id === nextNodeId);
        if (node && window.reactFlowInstance) {
          window.reactFlowInstance.setCenter(node.position.x, node.position.y, { duration: 800 });
        }
      }

      // 延迟执行下一步
      await new Promise(resolve => setTimeout(resolve, state.stepDelay));
      runStep();
    };

    runStep();
  },

  pauseExecution: () => {
    set((state) => ({
      executionState: {
        ...state.executionState,
        isPaused: !state.executionState.isPaused
      }
    }));
  },

  stopExecution: () => {
    set((state) => ({
      executionState: {
        ...state.executionState,
        isRunning: false,
        isPaused: false,
        currentNodeId: null
      }
    }));
  },

  stepExecution: () => {
    const executor = new WorkflowExecutor(get().nodes, get().edges);
    const state = get().executionState;
    
    const nextNodeId = executor.getNextNode(state.currentNodeId);
    if (nextNodeId) {
      executor.executeNodeAction(nextNodeId);
      set((state) => ({
        executionState: {
          ...state.executionState,
          currentNodeId: nextNodeId,
          executionPath: [...state.executionState.executionPath, nextNodeId]
        }
      }));

      if (state.centerOnStep) {
        const node = get().nodes.find(n => n.id === nextNodeId);
        if (node && window.reactFlowInstance) {
          window.reactFlowInstance.setCenter(node.position.x, node.position.y, { duration: 800 });
        }
      }
    }
  },

  setStepDelay: (delay) => set((state) => ({
    executionState: {
      ...state.executionState,
      stepDelay: delay
    }
  })),

  setCenterOnStep: (center) => set((state) => ({
    executionState: {
      ...state.executionState,
      centerOnStep: center
    }
  })),

  // 实现 takeSnapshot 方法
  takeSnapshot: () => {
    const { nodes, edges } = get();
    const snapshot = {
      nodes: [...nodes],
      edges: [...edges],
      timestamp: Date.now()
    };
    
    // 添加到历史记录
    get().addHistoryEntry(
      "Take Snapshot",
      `Created snapshot at ${new Date().toLocaleTimeString()}`
    );
    
    return snapshot;
  },
}));

export default useEditorStore;
