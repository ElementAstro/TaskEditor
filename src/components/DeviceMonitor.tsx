import { useEffect, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import useEditorStore from "@/store/editorStore";
import { Camera, Telescope, Crosshair } from "lucide-react";

export default function DeviceMonitor() {
  const { t } = useTranslation();
  const { 
    updateTelescopeStatus, 
    updateCameraStatus, 
    updateGuidingStatus,
    nodes 
  } = useEditorStore();

  const [expandedView, setExpandedView] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // 从节点中获取设备状态
  const telescopeNode = nodes.find(node => node.type === 'telescope')?.data.telescope;
  const cameraNode = nodes.find(node => node.type === 'camera')?.data.camera;
  const guidingNode = nodes.find(node => node.type === 'guiding')?.data.guiding;

  useEffect(() => {
    // 模拟设备状态更新
    const interval = setInterval(() => {
      updateTelescopeStatus({
        ra: Math.random() * 24,
        dec: Math.random() * 180 - 90,
        pier: Math.random() > 0.5 ? 'east' : 'west',
        tracking: true,
        connected: true,
      });

      updateCameraStatus({
        temperature: -20 + Math.random() * 5,
        cooling: true,
        connected: true,
        gain: 100,
        offset: 10,
      });

      updateGuidingStatus({
        enabled: true,
        rmsRA: Math.random() * 0.5,
        rmsDEC: Math.random() * 0.5,
        exposure: 2,
        connected: true,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [updateTelescopeStatus, updateCameraStatus, updateGuidingStatus]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg 
      ${expandedView ? 'w-96' : 'w-64'}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Telescope className="text-blue-500" />
          <div>
            <div className="text-sm font-medium">{t('editor.deviceMonitor.telescope')}</div>
            <div className="text-xs text-gray-500">
              RA: {telescopeNode?.ra?.toFixed(2)}h
              DEC: {telescopeNode?.dec?.toFixed(2)}°
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Camera className="text-green-500" />
          <div>
            <div className="text-sm font-medium">{t('editor.deviceMonitor.camera')}</div>
            <div className="text-xs text-gray-500">
              {t('editor.deviceMonitor.temperature')}: {cameraNode?.temperature?.toFixed(1)}°C
              {t('editor.deviceMonitor.gain')}: {cameraNode?.gain}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Crosshair className="text-purple-500" />
          <div>
            <div className="text-sm font-medium">导星</div>
            <div className="text-xs text-gray-500">
              RMS RA: {guidingNode?.rmsRA?.toFixed(2)}&quot;
              DEC: {guidingNode?.rmsDEC?.toFixed(2)}&quot;
            </div>
          </div>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => setExpandedView(!expandedView)}
        >
          {expandedView ? t('editor.deviceMonitor.collapse') : t('editor.deviceMonitor.expand')}
        </button>

        {expandedView && (
          <>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">{t('editor.deviceMonitor.deviceLogs')}</h3>
              <div className="h-40 overflow-y-auto text-xs space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-gray-600">{log}</div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">{t('editor.deviceMonitor.deviceControl')}</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-2 py-1 bg-blue-100 rounded text-sm"
                  onClick={() => addLog(t('editor.deviceMonitor.reconnect'))}>
                  {t('editor.deviceMonitor.reconnect')}
                </button>
                <button className="px-2 py-1 bg-red-100 rounded text-sm"
                  onClick={() => addLog(t('editor.deviceMonitor.disconnect'))}>
                  {t('editor.deviceMonitor.disconnect')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}