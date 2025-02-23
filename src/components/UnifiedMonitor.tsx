import { useEffect, useCallback } from 'react';
import { Camera, Telescope, Crosshair, Activity, MessageSquare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import useMonitorStore from '@/store/monitorStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

const UnifiedMonitor = () => {
  const {
    isMonitorOpen,
    activeTab,
    telescopeStatus,
    cameraStatus,
    guidingStatus,
    performanceMetrics,
    logs,
    setIsMonitorOpen,
    setActiveTab,
    updateTelescopeStatus,
    updateCameraStatus,
    updateGuidingStatus,
    updatePerformanceMetrics,
    addLog,
  } = useMonitorStore();

  // 模拟设备状态更新
  useEffect(() => {
    const interval = setInterval(() => {
      const newTelescopeStatus = {
        ra: Math.random() * 24,
        dec: Math.random() * 180 - 90,
        pier: Math.random() > 0.5 ? 'east' as const : 'west' as const,
        tracking: true,
        connected: true,
      };

      const newCameraStatus = {
        temperature: -20 + Math.random() * 5,
        cooling: true,
        connected: true,
        gain: 100,
        offset: 10,
      };

      const newGuidingStatus = {
        enabled: true,
        rmsRA: Math.random() * 0.5,
        rmsDEC: Math.random() * 0.5,
        exposure: 2,
        connected: true,
      };

      updateTelescopeStatus(newTelescopeStatus);
      updateCameraStatus(newCameraStatus);
      updateGuidingStatus(newGuidingStatus);

      // 添加状态更新日志
      addLog({
        type: 'info',
        message: `设备状态已更新 - RA: ${newTelescopeStatus.ra.toFixed(2)}h, DEC: ${newTelescopeStatus.dec.toFixed(2)}°`,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [updateTelescopeStatus, updateCameraStatus, updateGuidingStatus, addLog]);

  // 性能监控
  useEffect(() => {
    const updatePerformanceData = () => {
      const perf = window.performance as ExtendedPerformance;
      const metrics = {
        timestamp: Date.now(),
        cpu: Math.random() * 100,
        fps: 60 * Math.random(),
        memory: {
          used: perf.memory?.usedJSHeapSize || 0,
          total: perf.memory?.totalJSHeapSize || 0,
        },
      };
      updatePerformanceMetrics(metrics);

      // 添加性能警告日志
      if (metrics.cpu > 80) {
        addLog({
          type: 'warning',
          message: `CPU 使用率过高: ${metrics.cpu.toFixed(1)}%`,
        });
      }
    };

    const interval = setInterval(updatePerformanceData, 1000);
    return () => clearInterval(interval);
  }, [updatePerformanceMetrics, addLog]);

  const getStatusColor = useCallback((connected: boolean) => {
    return connected ? 'bg-green-500' : 'bg-red-500';
  }, []);

  return (
    <Sheet open={isMonitorOpen} onOpenChange={setIsMonitorOpen}>
      <SheetContent side="right" className="w-[400px] bg-black/90 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">设备监控</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-transparent border-b border-gray-800">
            <TabsTrigger 
              value="devices" 
              className="text-gray-400 data-[state=active]:text-white"
            >
              <Telescope className="w-4 h-4 mr-2" />
              设备状态
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="text-gray-400 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              性能指标
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="text-gray-400 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              日志
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="mt-4 space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Telescope className="text-blue-400" />
                <h3 className="font-medium">望远镜</h3>
                <span className={`w-2 h-2 rounded-full ml-auto ${
                  getStatusColor(telescopeStatus?.connected || false)
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>赤经</span>
                  <span>{telescopeStatus?.ra?.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>赤纬</span>
                  <span>{telescopeStatus?.dec?.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>子午面</span>
                  <span>{telescopeStatus?.pier === 'east' ? '东' : '西'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="text-green-400" />
                <h3 className="font-medium">相机</h3>
                <span className={`w-2 h-2 rounded-full ml-auto ${
                  getStatusColor(cameraStatus?.connected || false)
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>温度</span>
                  <span>{cameraStatus?.temperature?.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>增益</span>
                  <span>{cameraStatus?.gain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>偏移量</span>
                  <span>{cameraStatus?.offset}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crosshair className="text-purple-400" />
                <h3 className="font-medium">导星</h3>
                <span className={`w-2 h-2 rounded-full ml-auto ${
                  getStatusColor(guidingStatus?.connected || false)
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>RMS RA</span>
                  <span>{guidingStatus?.rmsRA?.toFixed(2)}&quot;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>RMS DEC</span>
                  <span>{guidingStatus?.rmsDEC?.toFixed(2)}&quot;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>曝光时间</span>
                  <span>{guidingStatus?.exposure}s</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <div className="space-y-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      stroke="#666"
                    />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid #666",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      name="CPU使用率" 
                      stroke="#8884d8" 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fps" 
                      name="FPS" 
                      stroke="#82ca9d" 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">CPU使用率</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(performanceMetrics[performanceMetrics.length - 1].cpu)
                      : 0}%
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">FPS</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(performanceMetrics[performanceMetrics.length - 1].fps)
                      : 0}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">内存使用</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(
                          performanceMetrics[performanceMetrics.length - 1].memory.used /
                            (1024 * 1024)
                        )
                      : 0}
                    MB
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {logs.map((log, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        log.type === 'error' ? 'destructive' :
                        log.type === 'warning' ? 'secondary' :
                        log.type === 'success' ? 'default' : 'outline'
                      }
                    >
                      {log.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{log.message}</p>
                  {log.nodeId && (
                    <p className="text-xs text-gray-500 mt-1">Node: {log.nodeId}</p>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default UnifiedMonitor;