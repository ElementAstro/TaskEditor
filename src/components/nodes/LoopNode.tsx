import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Repeat, ArrowRight, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NodeData } from '@/types/types';

const LoopNode = ({ data }: { data: NodeData['data'] }) => {
  const { t } = useTranslation();

  const getLoopIcon = () => {
    if (!data.loopConfig) return <Repeat />;
    switch (data.loopConfig.type) {
      case 'count':
        return <span className="font-mono">×{data.loopConfig.count || 1}</span>;
      case 'while':
        return <RotateCw />;
      case 'forEach':
        return <span className="font-mono">[∀]</span>;
      default:
        return <Repeat />;
    }
  };

  const getLoopDescription = () => {
    if (!data.loopConfig) return 'Default count: 1';
    switch (data.loopConfig.type) {
      case 'count':
        return `${data.loopConfig.count || 1} iterations`;
      case 'while':
        return data.loopConfig.condition
          ? `While: ${data.loopConfig.condition.field} ${data.loopConfig.condition.type} ${data.loopConfig.condition.value}`
          : 'While condition is true';
      case 'forEach':
        return `ForEach in: ${data.loopConfig.collection || 'collection'}`;
      default:
        return 'Loop configuration';
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" isConnectable={true} />
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-100">
            {getLoopIcon()}
          </div>
          <div className="ml-2">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-purple-50 p-2 rounded">
          <div className="flex items-center text-xs text-purple-700">
            <span>{t('nodes.loop.loopBody')}</span>
            <ArrowRight size={14} className="mx-1" />
          </div>
          <div className="text-xs font-medium text-purple-800">
            {getLoopDescription()}
          </div>
          <div className="flex items-center text-xs text-purple-700">
            <ArrowRight size={14} className="mx-1" />
            <span>{t('nodes.loop.next')}</span>
          </div>
        </div>

        {data.loopConfig?.maxIterations && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            {t('nodes.loop.maxIterations')}: {data.loopConfig.maxIterations}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="next" 
        className="!bg-gray-500"
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="body" 
        className="!bg-purple-500"
        isConnectable={true}
      />
    </>
  );
};

export default memo(LoopNode);
