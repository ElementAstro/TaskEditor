import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Calendar, Clock, User, Tag, Plus, X, Save } from "lucide-react";
import type { LoopConfig, NodeData } from "@/types/types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskParameter } from "@/types/types";

interface PropertyPanelProps {
  selectedNode: NodeData | null;
  updateNodeData: (id: string, data: Partial<NodeData["data"]>) => void;
}

const ParameterEditor = ({
  type,
  parameters,
  onUpdate,
}: {
  type: "inputs" | "outputs";
  parameters: TaskParameter[];
  onUpdate: (params: TaskParameter[]) => void;
}) => {
  const [newParam, setNewParam] = useState<TaskParameter>({
    name: "",
    type: "string",
    description: "",
    required: false,
  });

  const handleAddParam = () => {
    if (newParam.name) {
      onUpdate([...parameters, newParam]);
      setNewParam({
        name: "",
        type: "string",
        description: "",
        required: false,
      });
    }
  };

  const handleRemoveParam = (index: number) => {
    const newParams = [...parameters];
    newParams.splice(index, 1);
    onUpdate(newParams);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{type === "inputs" ? "输入参数" : "输出参数"}</h3>
      <div className="space-y-2">
        {parameters.map((param, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
            <span className="flex-1">{param.name}</span>
            <span className="text-sm text-muted-foreground">{param.type}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveParam(index)}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="参数名"
            value={newParam.name}
            onChange={(e) =>
              setNewParam({ ...newParam, name: e.target.value })
            }
          />
          <Select
            value={newParam.type}
            onValueChange={(value: "string" | "number" | "boolean" | "array" | "object") =>
              setNewParam({ ...newParam, type: value })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="array">Array</SelectItem>
              <SelectItem value="object">Object</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddParam}>
            <Plus size={16} />
          </Button>
        </div>
        <Input
          placeholder="描述"
          value={newParam.description}
          onChange={(e) =>
            setNewParam({ ...newParam, description: e.target.value })
          }
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={newParam.required}
            onChange={(e) =>
              setNewParam({ ...newParam, required: e.target.checked })
            }
          />
          <Label htmlFor="required">必填</Label>
        </div>
      </div>
    </div>
  );
};

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
  const [params, setParams] = useState<{
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  }>({
    inputs: [],
    outputs: [],
  });

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
      setParams(selectedNode.data.params || { inputs: [], outputs: [] });
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
        params,
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

  const renderBranchConditions = () => {
    if (selectedNode?.type !== 'branch') return null;
    
    return (
      <div className="space-y-2">
        <Label>分支条件</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              编辑条件
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>条件配置</DialogTitle>
            </DialogHeader>
            {/* 条件编辑器组件 */}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderLoopConfig = () => {
    if (selectedNode?.type !== 'loop') return null;

    return (
      <div className="space-y-2">
        <Label>循环配置</Label>
        <Select
          value={selectedNode.data.loopConfig?.type || 'count'}
          onValueChange={(value: LoopConfig['type']) =>
            updateNodeData(selectedNode.id, {
              loopConfig: { ...selectedNode.data.loopConfig, type: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count">次数循环</SelectItem>
            <SelectItem value="while">条件循环</SelectItem>
            <SelectItem value="forEach">遍历循环</SelectItem>
          </SelectContent>
        </Select>
        {/* 根据循环类型渲染不同的配置选项 */}
      </div>
    );
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

        <div className="space-y-2">
          <Label>参数设置</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                编辑参数
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>参数配置</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <ParameterEditor
                  type="inputs"
                  parameters={params.inputs || []}
                  onUpdate={(newParams) =>
                    setParams({ ...params, inputs: newParams })
                  }
                />
                <ParameterEditor
                  type="outputs"
                  parameters={params.outputs || []}
                  onUpdate={(newParams) =>
                    setParams({ ...params, outputs: newParams })
                  }
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {renderBranchConditions()}
        {renderLoopConfig()}

        <Button type="submit" className="w-full">
          <Save size={16} className="mr-2" />
          更新
        </Button>
      </form>
    </div>
  );
}
