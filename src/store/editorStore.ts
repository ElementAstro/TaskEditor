import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Edge, Connection } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import type { NodeData, EdgeData } from "@/types/types";

interface EditorState {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  searchTerm: string;
  history: {
    past: { nodes: NodeData[]; edges: EdgeData[] }[];
    future: { nodes: NodeData[]; edges: EdgeData[] }[];
  };

  // Actions
  setNodes: (nodes: NodeData[]) => void;
  setEdges: (edges: EdgeData[]) => void;
  updateNode: (id: string, data: Partial<NodeData["data"]>) => void;
  updateEdge: (id: string, data: Partial<EdgeData>) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  setSearchTerm: (term: string) => void;
  addConnection: (connection: Connection) => void;
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      searchTerm: "",
      history: {
        past: [],
        future: [],
      },

      setNodes: (nodes) => {
        set({ nodes });
        get().addToHistory();
      },

      setEdges: (edges) => {
        set({ edges });
        get().addToHistory();
      },

      updateNode: (id, data) => {
        const nodes = get().nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        });
        set({ nodes });
        get().addToHistory();
      },

      updateEdge: (id, data) => {
        const edges = get().edges.map((edge) =>
          edge.id === id ? { ...edge, ...data } : edge
        );
        set({ edges });
        get().addToHistory();
      },

      setSelectedNodeId: (nodeId) =>
        set({ selectedNodeId: nodeId, selectedEdgeId: null }),

      setSelectedEdgeId: (edgeId) =>
        set({ selectedEdgeId: edgeId, selectedNodeId: null }),

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      addConnection: (connection) => {
        const newEdge = {
          ...connection,
          id: `edge-${uuidv4()}`,
          type: "custom",
          animated: true,
        };
        set((state) => ({ edges: [...state.edges, newEdge as Edge] }));
        get().addToHistory();
      },

      undo: () => {
        const { past, future } = get().history;
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        set((state) => ({
          nodes: previous.nodes,
          edges: previous.edges,
          history: {
            past: newPast,
            future: [{ nodes: state.nodes, edges: state.edges }, ...future],
          },
        }));
      },

      redo: () => {
        const { past, future } = get().history;
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        set((state) => ({
          nodes: next.nodes,
          edges: next.edges,
          history: {
            past: [...past, { nodes: state.nodes, edges: state.edges }],
            future: newFuture,
          },
        }));
      },

      addToHistory: () => {
        set((state) => ({
          history: {
            past: [
              ...state.history.past,
              { nodes: state.nodes, edges: state.edges },
            ],
            future: [],
          },
        }));
      },
    }),
    {
      name: "editor-storage",
    }
  )
);
