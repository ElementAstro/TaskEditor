import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NodeData } from '@/types/types';

const SmartExposureNode = ({ data }: { data: NodeData['data'] }) => {
  const { t } = useTranslation();
  const { exposureConfig } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500">
        <div className="flex items-center gap-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-100">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium">{data.name}</div>
            <div className="text-xs text-gray-500">{data.description}</div>
          </div>
        </div>

        {exposureConfig && (
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>{t('nodes.imaging.exposureTime')}:</span>
              <span>{exposureConfig.exposureTime}s</span>
            </div>
            <div className="flex justify-between">
              <span>{t('nodes.imaging.gain')}:</span>
              <span>{exposureConfig.gain}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('nodes.imaging.binning')}:</span>
              <span>{exposureConfig.binning}x{exposureConfig.binning}</span>
            </div>
            {exposureConfig.isAutoExposure && (
              <div className="flex justify-between">
                <span>{t('nodes.imaging.targetADU')}:</span>
                <span>{exposureConfig.targetADU}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" />
    </>
  );
};

export default memo(SmartExposureNode);
