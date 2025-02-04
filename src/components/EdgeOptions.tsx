import type React from "react";
import type { EdgeData } from "@/types/types";
import { Paintbrush, Zap, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EdgeOptionsProps {
  selectedEdge: EdgeData;
  updateEdgeData: (id: string, newData: Partial<EdgeData>) => void;
}

export default function EdgeOptions({
  selectedEdge,
  updateEdgeData,
}: EdgeOptionsProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeData(selectedEdge.id, {
      style: { ...selectedEdge.style, stroke: e.target.value },
    });
  };

  const handleAnimatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeData(selectedEdge.id, { animated: e.target.checked });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeData(selectedEdge.id, { label: e.target.value });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Edge Options</h2>

      <div className="space-y-2">
        <Label className="flex items-center">
          <Paintbrush size={16} className="mr-2" /> Color
        </Label>
        <Input
          type="color"
          value={selectedEdge.style?.stroke || "#000000"}
          onChange={handleColorChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Input
          type="checkbox"
          checked={selectedEdge.animated || false}
          onChange={handleAnimatedChange}
          className="h-4 w-4"
        />
        <Label className="flex items-center">
          <Zap size={16} className="mr-2" />
          Animated
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center">
          <Type size={16} className="mr-2" /> Label
        </Label>
        <Input
          type="text"
          value={String(selectedEdge.label || "")}
          onChange={handleLabelChange}
        />
      </div>
    </div>
  );
}
