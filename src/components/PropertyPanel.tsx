import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { 
  Plus, 
  X, 
  Save,
  Calendar,
  Clock,
  User,
  Tag,
  Flag,
  Settings,
  Filter
} from "lucide-react";
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
import { useTranslation } from "react-i18next";

interface PropertyPanelProps {
  selectedNode: NodeData | null;
  updateNodeData: (id: string, data: Partial<NodeData["data"]>) => void;
}

// 新增默认参数列表配置
const DEFAULT_PARAMS = {
  smartExposure: {
    inputs: [
      {
        name: "binning",
        type: "number" as const,
        description: "像素合并",
        required: true,
        defaultValue: 1,
        validation: { min: 1, max: 4 },
      },
      {
        name: "gain",
        type: "number" as const,
        description: "增益值",
        required: true,
        defaultValue: 0,
        validation: { min: 0, max: 100 },
      },
      {
        name: "targetADU",
        type: "number" as const,
        description: "目标ADU值",
        required: false,
        defaultValue: 30000,
        validation: { min: 1000, max: 65535 },
      },
    ],
    outputs: [
      {
        name: "exposureTime",
        type: "number",
        description: "实际曝光时间",
      },
      {
        name: "currentADU",
        type: "number",
        description: "当前ADU值",
      },
    ],
  },
  focus: {
    inputs: [
      {
        name: "method",
        type: "string" as const,
        description: "对焦方法",
        required: true,
        defaultValue: "HFD",
        options: ["HFD", "FWHM", "Contrast"],
      },
      {
        name: "steps",
        type: "number" as const,
        description: "步进数",
        required: true,
        defaultValue: 5,
        validation: { min: 3, max: 15 },
      },
    ],
    outputs: [
      {
        name: "position",
        type: "number",
        description: "最佳对焦位置",
      },
      {
        name: "hfdValue",
        type: "number",
        description: "HFD值",
      },
    ],
  },
  filterWheel: {
    inputs: [
      {
        name: "filterName",
        type: "string" as const,
        description: "滤镜名称",
        defaultValue: "L",
        required: true,
        options: ["L", "R", "G", "B", "Ha", "OIII", "SII"],
      },
      {
        name: "position",
        type: "number" as const,
        description: "滤镜位置",
        defaultValue: 1,
        required: true,
        validation: { min: 1, max: 8 },
      },
    ],
    outputs: [
      {
        name: "currentFilter",
        type: "string",
        description: "当前滤镜",
      },
    ],
  },

  dither: {
    inputs: [
      {
        name: "ditherAmount",
        type: "number" as const,
        description: "抖动量(像素)",
        required: true,
        defaultValue: 3,
        validation: { min: 1, max: 10 },
      },
      {
        name: "ditherScale",
        type: "number" as const,
        description: "抖动比例",
        required: true,
        defaultValue: 1,
        validation: { min: 0.1, max: 5 },
      },
      {
        name: "pattern",
        type: "string" as const,
        description: "抖动模式",
        required: false,
        options: ["Spiral", "Random", "Square"],
        defaultValue: "Spiral",
      },
    ],
    outputs: [
      {
        name: "offsetX",
        type: "number",
        description: "X轴偏移量",
      },
      {
        name: "offsetY",
        type: "number",
        description: "Y轴偏移量",
      },
    ],
  },

  platesolving: {
    inputs: [
      {
        name: "searchRadius",
        type: "number" as const,
        description: "搜索半径(度)",
        required: true,
        defaultValue: 5,
        validation: { min: 1, max: 180 },
      },
      {
        name: "accuracy",
        type: "number" as const,
        description: "精确度(角秒)",
        required: true,
        defaultValue: 1,
        validation: { min: 0.1, max: 10 },
      },
      {
        name: "timeout",
        type: "number" as const,
        description: "超时时间(秒)",
        required: true,
        defaultValue: 60,
        validation: { min: 10, max: 300 },
      },
    ],
    outputs: [
      {
        name: "ra",
        type: "number",
        description: "赤经",
      },
      {
        name: "dec",
        type: "number",
        description: "赤纬",
      },
      {
        name: "rotation",
        type: "number",
        description: "旋转角度",
      },
    ],
  },

  cooling: {
    inputs: [
      {
        name: "targetTemp",
        type: "number" as const,
        description: "目标温度(°C)",
        required: true,
        defaultValue: -10,
        validation: { min: -40, max: 20 },
      },
      {
        name: "coolingPower",
        type: "number" as const,
        description: "制冷功率(%)",
        required: true,
        defaultValue: 100,
        validation: { min: 0, max: 100 },
      },
      {
        name: "duration",
        type: "number" as const,
        description: "持续时间(分钟)",
        required: true,
        defaultValue: 10,
        validation: { min: 1, max: 120 },
      },
    ],
    outputs: [
      {
        name: "currentTemp",
        type: "number",
        description: "当前温度",
      },
      {
        name: "powerUsage",
        type: "number",
        description: "功率使用",
      },
    ],
  },
};

type ParameterValue = string | number | boolean;

// 新增参数值状态管理组件
// 修改 ParameterValueEditor 组件
const ParameterValueEditor = ({
  parameter,
  value,
  onChange,
}: {
  parameter: TaskParameter;
  value: ParameterValue;
  onChange: (value: ParameterValue) => void;
}) => {
  switch (parameter.type) {
    case "number":
      return (
        <Input
          type="number"
          value={
            typeof value === "number"
              ? value
              : typeof parameter.defaultValue === "number"
              ? parameter.defaultValue
              : ""
          }
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={parameter.validation?.min}
          max={parameter.validation?.max}
          step={0.1}
        />
      );
    case "boolean":
      return (
        <input
          type="checkbox"
          checked={
            typeof value === "boolean"
              ? value
              : typeof parameter.defaultValue === "boolean"
              ? parameter.defaultValue
              : false
          }
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "string":
      if (parameter.options) {
        return (
          <Select
            value={String(
              typeof value === "string" ? value : parameter.defaultValue ?? ""
            )}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {parameter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Input
          type="text"
          value={
            typeof value === "string"
              ? value
              : String(parameter.defaultValue ?? "")
          }
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
};

export const ParameterEditor = ({
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
      <h3 className="text-sm font-semibold">
        {type === "inputs" ? "输入参数" : "输出参数"}
      </h3>
      <div className="space-y-2">
        {parameters.map((param, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-secondary rounded-md"
          >
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
            onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
          />
          <Select
            value={newParam.type}
            onValueChange={(
              value: "string" | "number" | "boolean" | "array" | "object"
            ) => setNewParam({ ...newParam, type: value })}
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
  const { t } = useTranslation();

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

  // 添加参数值状态管理
  const [paramValues, setParamValues] = useState<
    Record<string, ParameterValue>
  >({});

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

      // 初始化参数值
      const defaultParams =
        DEFAULT_PARAMS[selectedNode.type as keyof typeof DEFAULT_PARAMS];
      if (defaultParams) {
        const initialValues: Record<string, ParameterValue> = {};
        defaultParams.inputs?.forEach((param) => {
          const paramName = param.name as keyof typeof selectedNode.data;
          initialValues[param.name] =
            (selectedNode.data[paramName] as ParameterValue) ??
            param.defaultValue;
        });
        setParamValues(initialValues);
      }
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
    if (selectedNode?.type !== "branch") return null;

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
    if (selectedNode?.type !== "loop") return null;

    return (
      <div className="space-y-2">
        <Label>循环配置</Label>
        <Select
          value={selectedNode.data.loopConfig?.type || "count"}
          onValueChange={(value: LoopConfig["type"]) =>
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

  const renderDefaultParams = () => {
    const defaultParams =
      selectedNode &&
      DEFAULT_PARAMS[selectedNode.type as keyof typeof DEFAULT_PARAMS];
    if (!defaultParams) return null;

    return (
      <div className="space-y-4">
        <div className="border-l-2 border-blue-500 pl-2">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            {t("propertyPanel.builtInParams")}
          </h3>
          {defaultParams.inputs?.map((param) => (
            <div key={param.name} className="mb-2">
              <Label
                htmlFor={param.name}
                className="flex items-center gap-1 text-sm"
              >
                {param.name}
                {param.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex gap-2 items-center">
                <ParameterValueEditor
                  parameter={param}
                  value={paramValues[param.name]}
                  onChange={(value) => {
                    setParamValues((prev) => ({
                      ...prev,
                      [param.name]: value,
                    }));
                    updateNodeData(selectedNode.id, { [param.name]: value });
                  }}
                />
                <span className="text-xs text-gray-500">
                  {param.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!selectedNode) return null;

  return (
    <div className="w-64 bg-background p-4 h-full overflow-y-auto border-l">
      <h2 className="text-lg font-semibold mb-4">{t("propertyPanel.title")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本字段 */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("propertyPanel.name")}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Label htmlFor="description">{t("propertyPanel.description")}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 颜色选择器 */}
        <div className="space-y-2">
          <Label>{t("propertyPanel.color")}</Label>
          <div className="relative">
            <button
              type="button"
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <div
                  className="fixed inset-0"
                  onClick={() => setShowColorPicker(false)}
                />
                <HexColorPicker
                  color={color}
                  onChange={setColor}
                  className="relative z-20"
                />
              </div>
            )}
          </div>
        </div>

        {/* 优先级选择 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Flag size={16} className="text-muted-foreground" />
            {t("propertyPanel.priority")}
          </Label>
          <Select
            value={priority}
            onValueChange={(value: typeof priority) => setPriority(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                {t("propertyPanel.priorityLow")}
              </SelectItem>
              <SelectItem value="medium">
                {t("propertyPanel.priorityMedium")}
              </SelectItem>
              <SelectItem value="high">
                {t("propertyPanel.priorityHigh")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 标签管理 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            {t("propertyPanel.tags")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center bg-secondary rounded-md px-2 py-1"
              >
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)}>
                  <X size={14} className="ml-2" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t("propertyPanel.newTag")}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
            />
            <Button type="button" onClick={addTag}>
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* 日期和时间选择 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            {t("propertyPanel.dueDate")}
          </Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            {t("propertyPanel.estimatedTime")}
          </Label>
          <Input
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="预计用时(分钟)"
          />
        </div>

        {/* 负责人选择 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            {t("propertyPanel.assignee")}
          </Label>
          <Input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="负责人"
          />
        </div>

        {/* 参数编辑器 */}
        {selectedNode?.type !== "start" && selectedNode?.type !== "end" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings size={16} className="text-muted-foreground" />
              {t("propertyPanel.parameters")}
            </h3>
            <ParameterEditor
              type="inputs"
              parameters={params.inputs || []}
              onUpdate={(inputs) => setParams({ ...params, inputs })}
            />
            <ParameterEditor
              type="outputs"
              parameters={params.outputs || []}
              onUpdate={(outputs) => setParams({ ...params, outputs })}
            />
          </div>
        )}

        {/* 条件分支、循环和参数配置 */}
        {renderBranchConditions()}
        {renderLoopConfig()}
        {renderDefaultParams()}

        {/* 提交按钮 */}
        <Button type="submit" className="w-full">
          <Save size={16} className="mr-2" />
          {t("propertyPanel.update")}
        </Button>
      </form>
    </div>
  );
}
