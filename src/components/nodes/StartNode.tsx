import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";

interface StartNodeData {
  name: string;
  description: string;
}

export default function StartNode({ data }: { data: StartNodeData }) {
  return (
    <motion.div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100 text-green-500">
          🏁
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-sm text-gray-500">{data.description}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-green-500"
      />
    </motion.div>
  );
}
