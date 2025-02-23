import { useState } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface DecisionNodeData {
  name: string;
  description: string;
}

export default function DecisionNode({ data }: { data: DecisionNodeData }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-500"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-yellow-500"
      />
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-yellow-100 text-yellow-500">
            🔀
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.name}</div>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-yellow-500 hover:text-yellow-700"
            >
              {isExpanded ? t('nodes.common.hide') : t('nodes.common.show')}
            </Button>
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
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-yellow-500"
      />
    </motion.div>
  );
}
