import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Move, RotateCw } from 'lucide-react';
import { TaskParameter } from '@/types/types';

interface DitherData {
  name: string;
  description: string;
  ditherAmount: number;
  ditherScale: number;
  isDithering?: boolean;
  params?: {
    inputs?: TaskParameter[];
    outputs?: TaskParameter[];
  };
}

const DitherNode = memo(({ data }: { data: DitherData }) => {
  const inputs = data.params?.inputs ?? [];
  const outputs = data.params?.outputs ?? [];
  
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
      <div className="min-w-[280px] px-4 py-3 shadow-md rounded-md bg-white border-2 border-yellow-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-yellow-100">
            <Move className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-2 flex-1">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
          {data.isDithering && (
            <RotateCw className="w-4 h-4 text-yellow-500 animate-spin" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 bg-yellow-50 p-2 rounded">
          <div className="text-xs flex items-center gap-1">
            <span>Amount: </span>
            <span className="font-mono font-semibold text-yellow-700">{data.ditherAmount}px</span>
          </div>
          <div className="text-xs flex items-center gap-1">
            <span>Scale: </span>
            <span className="font-mono">{data.ditherScale}x</span>
          </div>
        </div>
        
        {(inputs.length > 0 || outputs.length > 0) && (
          <div className="mt-2 border-t border-yellow-200 pt-2">
            {inputs.length > 0 && (
              <div className="text-xs mb-1">
                <span className="text-yellow-600 font-semibold">Inputs: </span>
                {inputs.map((param, i) => (
                  <span key={i} className="bg-yellow-100 px-1 py-0.5 rounded mr-1">
                    {param.name}
                  </span>
                ))}
              </div>
            )}
            {outputs.length > 0 && (
              <div className="text-xs">
                <span className="text-yellow-600 font-semibold">Outputs: </span>
                {outputs.map((param, i) => (
                  <span key={i} className="bg-yellow-100 px-1 py-0.5 rounded mr-1">
                    {param.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" />
    </>
  );
});

DitherNode.displayName = 'DitherNode';

export default DitherNode;