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

interface ToolbarProps {
  toggleSidebar: () => void;
  togglePropertyPanel: () => void;
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
}

export default function Toolbar({
  toggleSidebar,
  togglePropertyPanel,
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
}: ToolbarProps) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex ${
        isLandscape ? "flex-col" : "justify-between"
      } items-center shadow-lg`}
    >
      {/* 第一组工具 */}
      <div className={`flex ${isLandscape ? "flex-col" : "space-x-4"} items-center`}>
        {!isLandscape && (
          <>
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
          </>
        )}
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
      </div>

      {/* 第二组工具 - 背景控制 */}
      <div className={`flex ${isLandscape ? "flex-col mt-2" : "space-x-4"} items-center`}>
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
          onValueChange={(value) => setBgVariant(value as BackgroundVariant)}
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

      {/* 新增的第三组工具 - 视图控制 */}
      <div className={`flex ${isLandscape ? "flex-col mt-2" : "space-x-4"} items-center`}>
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
    </div>
  );
}
