import { memo } from "react";
import { Handle, Position, type NodeProps, NodeResizer } from "reactflow";

const GroupNode = ({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={30} isVisible={selected} />
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-gray-500"
      />
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-400">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-500">
            📁
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.label}</div>
            <div className="text-gray-500">{data.description}</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-gray-500"
      />
    </>
  );
};

export default memo(GroupNode);
