import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Filter, Settings } from "lucide-react";
import { TaskParameter } from "@/types/types";

interface FilterWheelData {
  name: string;
  description: string;
  filterName: string;
  position: number;
  isAutoFilter?: boolean;
  params?: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
  currentFilter?: string;
}

const FilterWheelNode = memo(({ data }: { data: FilterWheelData }) => {
  const inputs = data.params?.inputs ?? [];
  const outputs = data.params?.outputs ?? [];
  const position = typeof data.position === "number" ? data.position : 1;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-gray-500"
      />
      <div className="min-w-[280px] px-4 py-3 shadow-md rounded-md bg-white border-2 border-purple-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-100">
            <Filter className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-2 flex-1">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
          {data.isAutoFilter && (
            <Settings className="w-4 h-4 text-purple-500" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 bg-purple-50 p-2 rounded">
          <div className="text-xs flex items-center gap-1">
            <span>Filter Name: </span>
            <span className="font-mono font-semibold text-purple-700">
              {data.filterName || "L"}
            </span>
          </div>
          <div className="text-xs flex items-center gap-1">
            <span>Position: </span>
            <span className="font-mono">{String(position)}</span>
          </div>
        </div>

        {(inputs.length > 0 || outputs.length > 0) && (
          <div className="mt-2 border-t border-purple-200 pt-2">
            {inputs.length > 0 && (
              <div className="text-xs mb-1">
                <span className="text-purple-600 font-semibold">Inputs: </span>
                {inputs.map((param, i) => (
                  <span
                    key={i}
                    className="bg-purple-100 px-1 py-0.5 rounded mr-1"
                  >
                    {param.name}
                  </span>
                ))}
              </div>
            )}
            {outputs.length > 0 && (
              <div className="text-xs">
                <span className="text-purple-600 font-semibold">Outputs: </span>
                {outputs.map((param, i) => (
                  <span
                    key={i}
                    className="bg-purple-100 px-1 py-0.5 rounded mr-1"
                  >
                    {param.name}
                  </span>
                ))}
              </div>
            )}
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
});

FilterWheelNode.displayName = "FilterWheelNode";

export default FilterWheelNode;
