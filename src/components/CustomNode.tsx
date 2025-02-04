import { useState } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface NodeData {
  color: string;
  emoji: string;
  name: string;
  description: string;
}

export default function CustomNode({ data }: { data: NodeData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="group relative px-4 py-2 shadow-lg rounded-lg bg-white/90 backdrop-blur-sm border-2"
      style={{
        borderColor: data.color,
        boxShadow: `0 4px 6px -1px ${data.color}20`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05, boxShadow: `0 8px 12px -2px ${data.color}30` }}
      transition={{ duration: 0.2 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <div className="flex flex-col">
        <div className="flex items-center">
          <div
            className="rounded-full w-12 h-12 flex items-center justify-center"
            style={{ backgroundColor: data.color }}
          >
            {data.emoji}
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.name}</div>
            <button
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide details" : "Show details"}
            </button>
          </div>
        </div>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-gray-500"
          >
            {data.description}
          </motion.div>
        )}
      </div>
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 bg-white rounded-full shadow-md hover:shadow-lg"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </motion.div>
  );
}
