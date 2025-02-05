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
} from "@/types/types";
import getLayoutedElements from "../utils/autoLayout";

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
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    set({ nodes: layoutedNodes, edges: layoutedEdges });
    get().addHistoryEntry("Auto Layout", "Applied auto layout to workflow");
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
}));

export default useEditorStore;
