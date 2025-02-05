import { useRef, useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  useKeyPress,
  ConnectionMode,
  useReactFlow,
} from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "react-responsive";
import "reactflow/dist/style.css";

import useEditorStore from "../store/editorStore";
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
import BranchNode from './nodes/BranchNode';
import LoopNode from './nodes/LoopNode';

const nodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
  group: GroupNode,
  branch: BranchNode,
  loop: LoopNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function EnhancedLowCodeEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, setViewport, zoomIn, zoomOut } = useReactFlow();
  const isLandscape = useMediaQuery({
    query: "(min-width: 1024px)",
  }) as boolean;

  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const dragTimeThreshold = 200; // 200ms长按阈值

  // 从 store 获取状态和方法
  const {
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    bgColor,
    bgVariant,
    isSidebarOpen,
    isPropertyPanelOpen,
    searchTerm,
    contextMenu,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setSelectedEdge,
    setContextMenu,
    setIsSidebarOpen,
    setIsPropertyPanelOpen,
    updateNodeData,
    updateEdgeData,
    handleAutoLayout,
    handleAddGroup,
    undo,
    redo,
    deleteNode,
    deleteEdge,
    setBgColor,
    setBgVariant,
    saveWorkflow,
    loadWorkflow,
    exportWorkflow,
    importWorkflow,
    historyGroups,
    setSearchTerm,
    restoreState,
    addNode,
  } = useEditorStore();

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

      // 添加不同类型节点的默认数据
      const defaultData = {
        branch: {
          conditions: [],
          defaultPath: "false",
        },
        loop: {
          loopConfig: {
            type: "count",
            count: 1,
            maxIterations: 100,
          },
        },
      };

      addNode({
        type,
        position,
        data: {
          name: `New ${type}`,
          description: `This is a new ${type} node`,
          ...defaultData[type as keyof typeof defaultData],
        },
      });
    },
    [project, addNode]
  );

  const handleImportWorkflow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importWorkflow(content);
        };
        reader.readAsText(file);
      }
    },
    [importWorkflow]
  );

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

  const filteredNodes = nodes.filter(
    (node) =>
      node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.data.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        togglePropertyPanel={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
        setBgColor={setBgColor}
        setBgVariant={setBgVariant}
        saveWorkflow={saveWorkflow}
        loadWorkflow={loadWorkflow}
        exportWorkflow={exportWorkflow}
        importWorkflow={handleImportWorkflow}
        undo={undo}
        redo={redo}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetView={() => setViewport({ x: 0, y: 0, zoom: 1 })}
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
            onNodeClick={(_event, node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onEdgeClick={(_event, edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              const bounds = reactFlowWrapper.current?.getBoundingClientRect();
              setContextMenu({
                x: event.clientX - (bounds?.left || 0),
                y: event.clientY - (bounds?.top || 0),
                type: "node",
              });
              setSelectedNode(node);
            }}
            onEdgeContextMenu={(event, edge) => {
              event.preventDefault();
              const bounds = reactFlowWrapper.current?.getBoundingClientRect();
              setContextMenu({
                x: event.clientX - (bounds?.left || 0),
                y: event.clientY - (bounds?.top || 0),
                type: "edge",
              });
              setSelectedEdge(edge);
            }}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              const bounds = reactFlowWrapper.current?.getBoundingClientRect();
              setContextMenu({
                x: event.clientX - (bounds?.left || 0),
                y: event.clientY - (bounds?.top || 0),
                type: "pane",
              });
            }}
            onNodeDragStart={() => {
              setDragStartTime(Date.now());
            }}
            onNodeDrag={(_, node) => {
              if (dragStartTime && Date.now() - dragStartTime < dragTimeThreshold) {
                // 如果拖动时间小于阈值，恢复到原始位置
                node.position = node.position;
              }
            }}
            defaultEdgeOptions={{
              type: 'custom',
              animated: true,
            }}
            connectOnClick={false}
            onConnectStart={(event, params) => {
              // 记录连线起点
              console.log('Connection started:', params);
            }}
            onConnectEnd={() => {
              console.log('Connection ended');
            }}
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
                setSearchTerm={(term) => setSearchTerm(term)}
              />
            </Panel>
            <Panel position="top-right">
              <button
                onClick={() => handleAutoLayout()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Auto Layout
              </button>
            </Panel>
            {!isLandscape && (
              <Panel position="bottom-left">
                <HistoryPanel
                  historyGroups={historyGroups}
                  onRestoreState={(groupId, entryId) =>
                    restoreState(groupId, entryId)
                  }
                />
              </Panel>
            )}
          </ReactFlow>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              options={
                contextMenu.type === "pane"
                  ? [{ label: "Add Group", action: () => handleAddGroup() }]
                  : contextMenu.type === "node"
                  ? [
                      {
                        label: "Delete Node",
                        action: () => {
                          if (selectedNode) {
                            deleteNode(selectedNode.id);
                            setSelectedNode(null);
                          }
                        },
                      },
                    ]
                  : [
                      {
                        label: "Delete Edge",
                        action: () => {
                          if (selectedEdge) {
                            deleteEdge(selectedEdge.id);
                            setSelectedEdge(null);
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
                  updateNodeData={(id, newData) => updateNodeData(id, newData)}
                />
              )}
              {selectedEdge && (
                <EdgeOptions
                  selectedEdge={selectedEdge}
                  updateEdgeData={(id, newData) => updateEdgeData(id, newData)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isLandscape && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Toggle Sidebar
          </button>
          <button
            onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Toggle Property Panel
          </button>
        </div>
      )}
    </div>
  );
}
