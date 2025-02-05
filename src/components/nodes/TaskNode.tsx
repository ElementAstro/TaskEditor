import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Layers, Clock, AlertCircle } from "lucide-react";
import type { NodeData } from "@/types/types";

export interface TaskNodeData {
  name: string;
  description: string;
  params?: {
    inputs?: Array<{
      name: string;
      type: string;
      required?: boolean;
    }>;
    outputs?: Array<{
      name: string;
      type: string;
    }>;
    errorBehavior?: string;
    attempts?: number;
    [key: string]: unknown;
  };
  onParamsChange?: (params: Record<string, unknown>) => void;
}

type ParamValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null
  | undefined;

const ParamDisplay = ({
  param,
  value,
}: {
  param: string;
  value: ParamValue;
}) => {
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{param}:</span>
        <span
          className={`px-2 py-0.5 rounded ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{param}:</span>
        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
          {value}
        </span>
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="text-sm">
        <span className="text-gray-600">{param}:</span>
        <div className="ml-2 mt-1">
          {Object.entries(value).map(([key, val]) => (
            <ParamDisplay key={key} param={key} value={val as ParamValue} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{param}:</span>
      <span>{String(value)}</span>
    </div>
  );
};

const TaskNode = ({ data }: { data: NodeData["data"] }) => {
  const getBorderColor = () => {
    switch (data.priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-green-500";
      default:
        return "border-blue-500";
    }
  };

  const hasInputs = data?.params?.inputs && data.params.inputs.length > 0;
  const hasOutputs = data?.params?.outputs && data.params.outputs.length > 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-gray-500"
      />
      <div
        className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${getBorderColor()}`}
      >
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100">
            <Layers className="w-6 h-6 text-gray-500" />
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.name}</div>
            <div className="text-gray-500">{data.description}</div>
          </div>
          {data.priority && (
            <div
              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                data.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : data.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {data.priority}
            </div>
          )}
        </div>

        {/* 参数列表渲染 */}
        {(hasInputs || hasOutputs) && (
          <div className="mt-4 text-sm">
            {hasInputs && (
              <div className="mb-2">
                <div className="font-semibold text-gray-700 mb-1">输入参数:</div>
                <div className="grid grid-cols-2 gap-2">
                  {data.params?.inputs?.map((param, index) => (
                    <div
                      key={`input-${param.name}-${index}`}
                      className="flex items-center gap-1 bg-gray-50 p-1 rounded"
                    >
                      <span className="text-gray-600">{param.name}</span>
                      <span className="text-xs text-gray-400">({param.type})</span>
                      {param.required && (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {hasOutputs && (
              <div>
                <div className="font-semibold text-gray-700 mb-1">输出参数:</div>
                <div className="grid grid-cols-2 gap-2">
                  {data.params?.outputs?.map((param, index) => (
                    <div
                      key={`output-${param.name}-${index}`}
                      className="flex items-center gap-1 bg-gray-50 p-1 rounded"
                    >
                      <span className="text-gray-600">{param.name}</span>
                      <span className="text-xs text-gray-400">({param.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {data.estimatedTime || "未设置"}
          </div>
          {data.assignee && (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {data.assignee}
            </div>
          )}
        </div>

        {/* 标签渲染 */}
        {data.tags && data.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((tag, index) => (
              <span
                key={`tag-${tag}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-gray-500"
      />
    </>
  );
};

export default memo(TaskNode);
