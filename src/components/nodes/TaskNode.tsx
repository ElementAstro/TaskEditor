import { useState } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TaskNodeData {
  name: string;
  description: string;
  params: {
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

export default function TaskNode({ data }: { data: TaskNodeData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-blue-500"
      />
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-500">
            📝
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.name}</div>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-700"
            >
              {isExpanded ? "Hide details" : "Show details"}
            </Button>
          </div>
        </div>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2"
          >
            <div className="text-gray-500 mb-2">{data.description}</div>
            {data.params && (
              <div className="bg-gray-50 p-2 rounded space-y-1">
                <div className="font-bold text-sm mb-2">Parameters:</div>
                {Object.entries(data.params).map(([key, value]) => (
                  <ParamDisplay
                    key={key}
                    param={key}
                    value={value as ParamValue}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-blue-500"
      />
    </motion.div>
  );
}
