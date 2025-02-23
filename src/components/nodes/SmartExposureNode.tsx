import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Camera, Settings, Sliders } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NodeData } from '@/types/types';

const SmartExposureNode = ({ data }: { data: NodeData['data'] }) => {
  const { t } = useTranslation();
  const hasInputs = data?.params?.inputs && data.params.inputs.length > 0;
  const hasOutputs = data?.params?.outputs && data.params.outputs.length > 0;

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" isConnectable={true} />
      <div className="min-w-[300px] px-4 py-3 shadow-md rounded-md bg-white border-2 border-blue-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-100">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-2 flex-1">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
          {data.exposureConfig?.isAutoExposure && (
            <Settings className="w-4 h-4 text-blue-500" />
          )}
        </div>

        {/* 曝光配置显示 */}
        {data.exposureConfig && (
          <div className="grid grid-cols-2 gap-2 bg-blue-50 p-2 rounded mb-2">
            <div className="text-xs flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              <span>{t('nodes.exposure.exposure')}: </span>
              <span className="font-mono">{data.exposureConfig.exposureTime}s</span>
            </div>
            <div className="text-xs">
              <span>{t('nodes.exposure.gain')}: </span>
              <span className="font-mono">{data.exposureConfig.gain}</span>
            </div>
            <div className="text-xs">
              <span>Binning: </span>
              <span className="font-mono">{data.exposureConfig.binning}x{data.exposureConfig.binning}</span>
            </div>
            <div className="text-xs">
              <span>Frame: </span>
              <span className="font-semibold text-blue-700">{data.exposureConfig.frame}</span>
            </div>
          </div>
        )}

        {/* 参数列表渲染 */}
        <div className="text-xs space-y-1">
          {hasInputs && (
            <div className="border-l-2 border-blue-300 pl-2">
              <div className="font-medium text-blue-800 mb-1">{t('nodes.common.inputs')}:</div>
              <div className="grid grid-cols-2 gap-1">
                {data.params?.inputs?.map((param, index) => (
                  <div
                    key={`input-${param.name}-${index}`}
                    className="flex items-center gap-1 bg-blue-50/50 px-1.5 py-0.5 rounded"
                  >
                    <span className="text-gray-600">{param.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {param.defaultValue ? `(${param.defaultValue})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {hasOutputs && (
            <div className="border-l-2 border-green-300 pl-2">
              <div className="font-medium text-green-800 mb-1">{t('nodes.common.outputs')}:</div>
              <div className="grid grid-cols-2 gap-1">
                {data.params?.outputs?.map((param, index) => (
                  <div
                    key={`output-${param.name}-${index}`}
                    className="flex items-center gap-1 bg-green-50/50 px-1.5 py-0.5 rounded"
                  >
                    <span className="text-gray-600">{param.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" isConnectable={true} />
    </>
  );
};

export default memo(SmartExposureNode);
