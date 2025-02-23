import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer 
} from "recharts";

interface PerformanceData {
  timestamp: number;
  cpu: number;
  fps: number;
  usedHeap: number;
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// 性能监控组件
export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentCPU, setCurrentCPU] = useState(0);
  const [currentFPS, setCurrentFPS] = useState(0);
  const [currentMemory, setCurrentMemory] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    // 计算 FPS
    const measureFPS = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        setCurrentFPS(Math.round(frameCount * 1000 / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    // 更新性能数据
    const updatePerformanceData = () => {
      // 使用 performance.now() 作为 CPU 使用率的估算
      // 实际生产环境中应该使用更准确的系统 API
      const cpuUsage = Math.min(100, Math.random() * 30 + 20); // 模拟数据
      setCurrentCPU(cpuUsage);

      // 获取内存使用情况
      // 注意：实际生产环境中应该使用系统 API 获取真实数据
      const perf = window.performance as ExtendedPerformance;
      const usedHeap = Math.round(
        (perf.memory?.usedJSHeapSize || 0) / (1024 * 1024)
      );
      setCurrentMemory(usedHeap);

      setPerformanceData(prev => {
        const newData = {
          timestamp: Date.now(),
          cpu: cpuUsage,
          fps: currentFPS,
          usedHeap: usedHeap
        };

        // 保持最近 60 个数据点
        const updatedData = [...prev, newData].slice(-60);
        return updatedData;
      });
    };

    // 启动性能监控
    measureFPS();
    const intervalId = setInterval(updatePerformanceData, 1000);

    // 清理函数
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [currentFPS]);

  return (
    <div className="w-full p-4 bg-black/20 text-white backdrop-blur-sm border border-gray-800 rounded-lg">
      <div className="space-y-0 pb-2">
        <h3 className="text-sm font-medium">性能监控</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">CPU 使用率</span>
            <span className="text-xs text-muted-foreground">{currentCPU}%</span>
          </div>
          <Progress value={currentCPU} className="h-1" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">FPS</span>
            <span className="text-xs text-muted-foreground">{currentFPS}</span>
          </div>
          <Progress value={currentFPS} max={60} className="h-1" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">内存使用</span>
            <span className="text-xs text-muted-foreground">{currentMemory} MB</span>
          </div>
          <Progress 
            value={Math.min(100, (currentMemory / 1024) * 100)} 
            className="h-1" 
          />
        </div>

        <div className="h-[100px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={false}
                stroke="#666"
              />
              <YAxis 
                stroke="#666"
                tickFormatter={(value) => `${Math.round(value)}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid #666",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#8884d8" 
                dot={false}
                strokeWidth={1.5}
              />
              <Line 
                type="monotone" 
                dataKey="fps" 
                stroke="#82ca9d" 
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
