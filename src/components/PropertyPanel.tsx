import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Calendar, Clock, User, Tag, Plus, X, Save } from "lucide-react";
import type { NodeData } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyPanelProps {
  selectedNode: NodeData | null;
  updateNodeData: (id: string, data: Partial<NodeData["data"]>) => void;
}

export default function PropertyPanel({
  selectedNode,
  updateNodeData,
}: PropertyPanelProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#60a5fa");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data.name || "");
      setDescription(selectedNode.data.description || "");
      setColor(selectedNode.data.color || "#60a5fa");
      setPriority(selectedNode.data.priority || "medium");
      setDueDate(selectedNode.data.dueDate || "");
      setAssignee(selectedNode.data.assignee || "");
      setEstimatedTime(selectedNode.data.estimatedTime || "");
      setTags(selectedNode.data.tags || []);
    }
  }, [selectedNode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNode) {
      updateNodeData(selectedNode.id, {
        name,
        description,
        color,
        priority,
        dueDate,
        assignee,
        estimatedTime,
        tags,
      });
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!selectedNode) return null;

  return (
    <div className="w-64 bg-background p-4 h-full overflow-y-auto border-l">
      <h2 className="text-lg font-semibold mb-4">节点属性</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名称</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">颜色</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-10 h-10 p-0"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <span className="text-sm">{color}</span>
          </div>
          {showColorPicker && (
            <div className="mt-2">
              <HexColorPicker color={color} onChange={setColor} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">优先级</Label>
          <Select
            value={priority}
            onValueChange={(value: "low" | "medium" | "high") =>
              setPriority(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="flex items-center gap-2">
            <Calendar size={16} />
            截止日期
          </Label>
          <Input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee" className="flex items-center gap-2">
            <User size={16} />
            负责人
          </Label>
          <Input
            type="text"
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedTime" className="flex items-center gap-2">
            <Clock size={16} />
            预计时间 (小时)
          </Label>
          <Input
            type="number"
            id="estimatedTime"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="flex items-center gap-2">
            <Tag size={16} />
            标签
          </Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-secondary rounded-md px-2 py-1 text-xs"
              >
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => removeTag(tag)}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="添加标签"
            />
            <Button type="button" onClick={addTag} size="icon">
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full">
          <Save size={16} className="mr-2" />
          更新
        </Button>
      </form>
    </div>
  );
}
