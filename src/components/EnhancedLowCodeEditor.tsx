import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  type NodeTypes,
  useReactFlow,
  Panel,
  useKeyPress,
  type Node,
  type EdgeTypes,
  ConnectionMode,
} from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import "reactflow/dist/style.css";

import Sidebar from "./Sidebar";
import TaskNode from "./nodes/TaskNode";
import DecisionNode from "./nodes/DecisionNode";
import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";
import PropertyPanel from "./PropertyPanel";
import Toolbar from "./Toolbar";
import MiniMap from "./MiniMap";
import EdgeOptions from "./EdgeOptions";
import SearchFilter from "./SearchFilter";
import GroupNode from "./GroupNode";
import CustomEdge from "./CustomEdge";
import ContextMenu from "./ContextMenu";
import HistoryPanel from "./HistoryPanel";
import getLayoutedElements from "../utils/autoLayout";
import type {
  NodeData,
  EdgeData,
  HistoryEntry,
  HistoryGroup,
} from "@/types/types";
import useMediaQuery from "react-responsive";

const nodeTypes: NodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
  group: GroupNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes = [
  {
    id: "1",
    type: "start",
    data: { name: "Start", description: "Begin the workflow" },
    position: { x: 250, y: 5 },
  },
];

export default function EnhancedLowCodeEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);
  const [bgColor, setBgColor] = useState("#f1f5f9");
  const [bgVariant, setBgVariant] = useState<BackgroundVariant>(
    BackgroundVariant.Lines
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "node" | "edge" | "pane";
  } | null>(null);
  const [historyGroups, setHistoryGroups] = useState<HistoryGroup[]>([]);
  const { project, getNodes, getEdges, setViewport, zoomIn, zoomOut } =
    useReactFlow();

  const isLandscape = !!useMediaQuery({ query: "(min-width: 1024px)" });

  const addHistoryEntry = useCallback(
    (action: string, details: string) => {
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        action,
        details,
        timestamp: Date.now(),
        state: {
          nodes: getNodes(),
          edges: getEdges(),
        },
      };

      setHistoryGroups((prevGroups) => {
        const lastGroup = prevGroups[prevGroups.length - 1];
        if (lastGroup && Date.now() - lastGroup.timestamp < 5000) {
          // If the last group is less than 5 seconds old, add to it
          return [
            ...prevGroups.slice(0, -1),
            {
              ...lastGroup,
              entries: [...lastGroup.entries, newEntry],
            },
          ];
        } else {
          // Otherwise, create a new group
          return [
            ...prevGroups,
            {
              id: Date.now().toString(),
              entries: [newEntry],
              timestamp: Date.now(),
            },
          ];
        }
      });
    },
    [getNodes, getEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: "#000" },
        type: "custom",
      };
      setEdges((eds) => addEdge(newEdge, eds));
      addHistoryEntry(
        "Connect",
        `Connected ${params.source} to ${params.target}`
      );
    },
    [setEdges, addHistoryEntry]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowBounds
        ? project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })
        : { x: 0, y: 0 };

      const newNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: {
          name: `New ${type}`,
          description: `This is a new ${type} node`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      addHistoryEntry("Add Node", `Added new ${type} node`);
    },
    [project, setNodes, addHistoryEntry]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: NodeData) => {
      setSelectedNode(node);
      setSelectedEdge(null);
    },
    [setSelectedNode, setSelectedEdge]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: EdgeData) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    [setSelectedEdge, setSelectedNode]
  );

  const updateNodeData = useCallback(
    (id: string, newData: Partial<NodeData["data"]>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
      addHistoryEntry("Update Node", `Updated node ${id}`);
    },
    [setNodes, addHistoryEntry]
  );

  const updateEdgeData = useCallback(
    (id: string, newData: Partial<EdgeData>) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            return { ...edge, ...newData };
          }
          return edge;
        })
      );
      addHistoryEntry("Update Edge", `Updated edge ${id}`);
    },
    [setEdges, addHistoryEntry]
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const togglePropertyPanel = () =>
    setIsPropertyPanelOpen(!isPropertyPanelOpen);

  const saveWorkflow = () => {
    const workflow = { nodes, edges };
    localStorage.setItem("workflow", JSON.stringify(workflow));
    alert("Workflow saved successfully!");
    addHistoryEntry("Save Workflow", "Saved workflow to local storage");
  };

  const loadWorkflow = () => {
    const savedWorkflow = localStorage.getItem("workflow");
    if (savedWorkflow) {
      const { nodes: savedNodes, edges: savedEdges } =
        JSON.parse(savedWorkflow);
      setNodes(savedNodes);
      setEdges(savedEdges);
      alert("Workflow loaded successfully!");
      addHistoryEntry("Load Workflow", "Loaded workflow from local storage");
    } else {
      alert("No saved workflow found!");
    }
  };

  const exportWorkflow = () => {
    const workflow = { nodes, edges };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(workflow));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addHistoryEntry("Export Workflow", "Exported workflow to JSON file");
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          const { nodes: importedNodes, edges: importedEdges } =
            JSON.parse(content);
          setNodes(importedNodes);
          setEdges(importedEdges);
          alert("Workflow imported successfully!");
          addHistoryEntry(
            "Import Workflow",
            "Imported workflow from JSON file"
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const undo = useCallback(() => {
    if (historyGroups.length > 1) {
      const currentGroup = historyGroups[historyGroups.length - 1];
      const previousGroup = historyGroups[historyGroups.length - 2];
      setNodes(
        previousGroup.entries[previousGroup.entries.length - 1].state.nodes
      );
      setEdges(
        previousGroup.entries[previousGroup.entries.length - 1].state.edges
      );
      setHistoryGroups(historyGroups.slice(0, -1));
      addHistoryEntry(
        "Undo",
        `Undid ${currentGroup.entries.map((entry) => entry.action).join(", ")}`
      );
    }
  }, [historyGroups, setNodes, setEdges, addHistoryEntry]);

  const redo = useCallback(() => {
    // Redo functionality would need to be implemented
  }, []);

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const isCtrlPressed = useKeyPress("Control");
  const isShiftPressed = useKeyPress("Shift");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCtrlPressed && event.key === "z") {
        if (isShiftPressed) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCtrlPressed, isShiftPressed, undo, redo]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - (bounds?.left || 0),
        y: event.clientY - (bounds?.top || 0),
        type: "node",
      });
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - (bounds?.left || 0),
        y: event.clientY - (bounds?.top || 0),
        type: "edge",
      });
      setSelectedEdge(edge);
    },
    [setSelectedEdge]
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    setContextMenu({
      x: event.clientX - (bounds?.left || 0),
      y: event.clientY - (bounds?.top || 0),
      type: "pane",
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      getNodes(),
      getEdges()
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    addHistoryEntry("Auto Layout", "Applied auto layout to workflow");
  }, [getNodes, getEdges, setNodes, setEdges, addHistoryEntry]);

  const handleAddGroup = useCallback(() => {
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
    setNodes((nodes) => [...nodes, newGroup]);
    addHistoryEntry("Add Group", "Added new group node");
  }, [setNodes, addHistoryEntry]);

  const restoreState = useCallback(
    (groupId: string, entryId: string) => {
      const group = historyGroups.find((g) => g.id === groupId);
      if (group) {
        const entry = group.entries.find((e) => e.id === entryId);
        if (entry) {
          setNodes(entry.state.nodes);
          setEdges(entry.state.edges);
          addHistoryEntry(
            "Restore State",
            `Restored state from ${entry.action}`
          );
        }
      }
    },
    [historyGroups, setNodes, setEdges, addHistoryEntry]
  );

  const filteredNodes = nodes.filter(
    (node) =>
      node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.data.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        toggleSidebar={toggleSidebar}
        togglePropertyPanel={togglePropertyPanel}
        setBgColor={setBgColor}
        setBgVariant={setBgVariant}
        saveWorkflow={saveWorkflow}
        loadWorkflow={loadWorkflow}
        exportWorkflow={exportWorkflow}
        importWorkflow={importWorkflow}
        undo={undo}
        redo={redo}
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetView={handleResetView}
        isLandscape={isLandscape}
        exportToJson={handleAutoLayout}
      />
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && !isLandscape && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-grow relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            snapToGrid={true}
            snapGrid={[15, 15]}
            fitView
          >
            <Controls />
            <Background variant={bgVariant} color={bgColor} />
            <MiniMap />
            <Panel position="top-left">
              <SearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </Panel>
            <Panel position="top-right">
              <button
                onClick={handleAutoLayout}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Auto Layout
              </button>
            </Panel>
            {!isLandscape && (
              <Panel position="bottom-left">
                <HistoryPanel
                  historyGroups={historyGroups}
                  onRestoreState={restoreState}
                />
              </Panel>
            )}
          </ReactFlow>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={closeContextMenu}
              options={
                contextMenu.type === "pane"
                  ? [{ label: "Add Group", action: handleAddGroup }]
                  : contextMenu.type === "node"
                  ? [
                      {
                        label: "Delete Node",
                        action: () => {
                          if (selectedNode) {
                            setNodes((nodes) =>
                              nodes.filter((n) => n.id !== selectedNode.id)
                            );
                            setSelectedNode(null);
                            addHistoryEntry(
                              "Delete Node",
                              `Deleted node ${selectedNode.id}`
                            );
                          }
                        },
                      },
                    ]
                  : [
                      {
                        label: "Delete Edge",
                        action: () => {
                          if (selectedEdge) {
                            setEdges((edges) =>
                              edges.filter((e) => e.id !== selectedEdge.id)
                            );
                            setSelectedEdge(null);
                            addHistoryEntry(
                              "Delete Edge",
                              `Deleted edge ${selectedEdge.id}`
                            );
                          }
                        },
                      },
                    ]
              }
            />
          )}
        </div>
        <AnimatePresence>
          {isPropertyPanelOpen && !isLandscape && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100"
            >
              {selectedNode && (
                <PropertyPanel
                  selectedNode={selectedNode}
                  updateNodeData={updateNodeData}
                />
              )}
              {selectedEdge && (
                <EdgeOptions
                  selectedEdge={selectedEdge}
                  updateEdgeData={updateEdgeData}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isLandscape && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
          <button
            onClick={toggleSidebar}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Toggle Sidebar
          </button>
          <button
            onClick={togglePropertyPanel}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Toggle Property Panel
          </button>
        </div>
      )}
    </div>
  );
}
