import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, ArrowRight, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NodeData } from '@/types/types';

const BranchNode = ({ data }: { data: NodeData['data'] }) => {
  const { t } = useTranslation();
  
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" isConnectable={true} />
      <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-500">
        <div className="flex items-center mb-3">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-yellow-100">
            <GitBranch className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-2">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center text-red-500">
            <X size={16} />
            <ArrowRight size={16} className="mx-1" />
            <span className="text-xs">{t('nodes.branch.false')}</span>
          </div>
          <div className="flex-1">
            {Array.isArray(data.conditions) && data.conditions.length > 0 ? (
              <div className="space-y-1">
                {data.conditions.map((condition, index) => (
                  <div key={`condition-${index}`} className="text-xs bg-yellow-50 p-1.5 rounded border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{condition.field}</span>
                      <span className="text-yellow-700">{condition.type}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-yellow-600">
                      {String(condition.value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-1">
                No conditions
              </div>
            )}
          </div>
          <div className="flex items-center text-green-500">
            <span className="text-xs">{t('nodes.branch.true')}</span>
            <ArrowRight size={16} className="mx-1" />
            <Check size={16} />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="true" className="!bg-green-500" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="false" className="!bg-red-500" isConnectable={true} />
    </>
  );
};

export default memo(BranchNode);
