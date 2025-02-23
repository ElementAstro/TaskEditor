import type { BackgroundVariant } from "reactflow";
import {
  Sidebar,
  Settings,
  Save,
  Upload,
  Download,
  Import,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sun,
  Moon,
  Sunrise,
  Grid,
  AlignJustify,
  Hash,
  FileJson,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Thermometer,
  GitBranch,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type React from "react";
import WeatherMonitor from "./nodes/weather/WeatherMonitor";
import useEditorStore from "@/store/editorStore";
import { exportToYAML, generateWorkflowLogic } from "@/utils/workflowExporter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ToolbarProps {
  toggleSidebar: () => void;
  togglePropertyPanel: () => void;
  toggleMonitor: () => void;
  setBgColor: (color: string) => void;
  setBgVariant: (variant: BackgroundVariant) => void;
  saveWorkflow: () => void;
  loadWorkflow: () => void;
  exportWorkflow: () => void;
  importWorkflow: (event: React.ChangeEvent<HTMLInputElement>) => void;
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  isLandscape: boolean;
  exportToJson: () => void;
  onStartWorkflow?: () => void;
  onPauseWorkflow?: () => void;
  onStopWorkflow?: () => void;
  showWeatherMonitor?: boolean;
  onToggleWeatherMonitor?: () => void;
}

const handleExportLogic = () => {
  const { nodes, edges } = useEditorStore.getState();
  const workflow = generateWorkflowLogic(nodes, edges);

  // 提供多种导出格式选择
  const format = window.prompt("Select export format (json/yaml):", "json");

  let exportData: string;
  let filename: string;

  if (format?.toLowerCase() === "yaml") {
    exportData = exportToYAML(workflow);
    filename = "workflow.yaml";
  } else {
    exportData = JSON.stringify(workflow, null, 2);
    filename = "workflow.json";
  }

  const blob = new Blob([exportData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function Toolbar({
  toggleSidebar,
  togglePropertyPanel,
  toggleMonitor,
  setBgColor,
  setBgVariant,
  saveWorkflow,
  loadWorkflow,
  exportWorkflow,
  importWorkflow,
  undo,
  redo,
  zoomIn,
  zoomOut,
  resetView,
  isLandscape,
  exportToJson,
  onStartWorkflow,
  onPauseWorkflow,
  onStopWorkflow,
  showWeatherMonitor = false,
  onToggleWeatherMonitor,
}: ToolbarProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2">
      <ScrollArea
        className={`${isLandscape ? "h-screen w-12" : "h-12 w-full"}`}
      >
        <div
          className={`flex ${
            isLandscape ? "flex-col space-y-2" : "justify-between space-x-2"
          } items-center px-2`}
        >
          {/* 左侧工具组 */}
          <div
            className={`flex ${
              isLandscape ? "flex-col space-y-2" : "space-x-2"
            } items-center`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:text-blue-300"
            >
              <Sidebar size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePropertyPanel}
              className="hover:text-blue-300"
            >
              <Settings size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMonitor}
              className="hover:text-blue-300"
            >
              <GitBranch size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={saveWorkflow}
              className="hover:text-green-300"
            >
              <Save size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadWorkflow}
              className="hover:text-yellow-300"
            >
              <Upload size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportWorkflow}
              className="hover:text-purple-300"
            >
              <Download size={20} />
            </Button>
            <label className="cursor-pointer hover:text-orange-300">
              <Import size={20} />
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              className="hover:text-red-300"
            >
              <Undo size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              className="hover:text-green-300"
            >
              <Redo size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportToJson}
              className="hover:text-yellow-300 tooltip-right"
              data-tooltip="Export as JSON"
            >
              <FileJson size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportLogic}
              className="hover:text-purple-300"
              title="Export Workflow Logic"
            >
              <FileJson size={20} />
            </Button>
          </div>

          {/* 中间背景控制组 */}
          <div
            className={`flex ${
              isLandscape ? "flex-col space-y-2" : "space-x-2"
            } items-center min-w-[200px]`}
          >
            <Select onValueChange={setBgColor} defaultValue="#f1f5f9">
              <SelectTrigger className="w-[100px] bg-gray-700 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="#f1f5f9">
                  <div className="flex items-center gap-2">
                    <Sun size={16} /> Light
                  </div>
                </SelectItem>
                <SelectItem value="#1e293b">
                  <div className="flex items-center gap-2">
                    <Moon size={16} /> Dark
                  </div>
                </SelectItem>
                <SelectItem value="#fef3c7">
                  <div className="flex items-center gap-2">
                    <Sunrise size={16} /> Warm
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setBgVariant(value as BackgroundVariant)
              }
              defaultValue="dots"
            >
              <SelectTrigger className="w-[100px] bg-gray-700 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dots">
                  <div className="flex items-center gap-2">
                    <Grid size={16} /> Dots
                  </div>
                </SelectItem>
                <SelectItem value="lines">
                  <div className="flex items-center gap-2">
                    <AlignJustify size={16} /> Lines
                  </div>
                </SelectItem>
                <SelectItem value="cross">
                  <div className="flex items-center gap-2">
                    <Hash size={16} /> Cross
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 右侧视图控制组 */}
          <div
            className={`flex ${
              isLandscape ? "flex-col space-y-2" : "space-x-2"
            } items-center`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              className="hover:text-blue-300"
            >
              <ZoomIn size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              className="hover:text-blue-300"
            >
              <ZoomOut size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetView}
              className="hover:text-blue-300"
            >
              <Maximize size={20} />
            </Button>
          </div>

          {/* 工作流控制组 */}
          <div
            className={`flex ${
              isLandscape ? "flex-col space-y-2" : "space-x-2"
            } items-center`}
          >
            <Button variant="ghost" size="icon" onClick={onStartWorkflow}>
              <PlayCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onPauseWorkflow}>
              <PauseCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onStopWorkflow}>
              <StopCircle className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-200" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleWeatherMonitor}
              className={showWeatherMonitor ? "text-blue-500" : ""}
            >
              <Thermometer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* 天气监控面板 - 固定位置 */}
      {showWeatherMonitor && (
        <div className="absolute top-14 right-4 z-50">
          <WeatherMonitor />
        </div>
      )}
    </div>
  );
}
