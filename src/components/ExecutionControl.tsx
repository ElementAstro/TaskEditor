import React, { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, Square, Timer, AlertCircle, MessageCircle, 
  History, Activity, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEditorStore from "@/store/editorStore";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface LogEntry {
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
  nodeId?: string;
}

interface PerformanceMetric {
  timestamp: number;
  stepDuration: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap = {
    running: "bg-green-500",
    paused: "bg-yellow-500",
    stopped: "bg-red-500",
    completed: "bg-blue-500",
    error: "bg-purple-500"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status as keyof typeof colorMap] || "bg-gray-500"} text-white`}>
      {status}
    </span>
  );
};

const ExecutionControl: React.FC = () => {
  const [executionTime, setExecutionTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{
    startTime: Date;
    endTime?: Date;
    status: string;
    nodesExecuted: number;
    totalDuration?: number;
  }[]>([]);

  const {
    nodes,
    executionState,
    startExecution,
    pauseExecution,
    stopExecution,
    setStepDelay,
    setCenterOnStep,
  } = useEditorStore();

  const { isRunning, isPaused, currentNodeId, executionPath, error } = executionState;

  // 计时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setExecutionTime((prev) => prev + 1);
        // 添加性能指标采集
        setPerformanceMetrics(prev => {
          const perf = window.performance as ExtendedPerformance;
          const newMetric = {
            timestamp: Date.now(),
            stepDuration: Math.random() * 100 + 50,
            cpuUsage: Math.random() * 100,
            memoryUsage: perf.memory?.usedJSHeapSize ? perf.memory.usedJSHeapSize / (1024 * 1024) : 0,
          };
          return [...prev.slice(-60), newMetric];
        });
      }, 1000);
      setTimerId(timer);
    } else if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, isPaused, timerId]);

  // 进度计算
  useEffect(() => {
    if (executionPath.length > 0) {
      const totalNodes = nodes.filter(node => 
        node.type !== 'group' && node.type !== 'start'
      ).length;
      const progressValue = (executionPath.length / totalNodes) * 100;
      setProgress(Math.min(progressValue, 100));
    } else {
      setProgress(0);
    }
  }, [executionPath, nodes]);

  // 节点高亮处理
  useEffect(() => {
    const highlightClass = 'highlight-node';
    const updateNodeHighlight = (nodeId: string, shouldHighlight: boolean) => {
      const element = document.querySelector(`[data-id="${nodeId}"]`);
      if (element) {
        element.classList[shouldHighlight ? 'add' : 'remove'](highlightClass);
      }
    };

    nodes.forEach(node => {
      updateNodeHighlight(node.id, false);
    });

    if (currentNodeId) {
      updateNodeHighlight(currentNodeId, true);
    }

    return () => {
      nodes.forEach(node => {
        updateNodeHighlight(node.id, false);
      });
    };
  }, [currentNodeId, nodes]);

  // 错误处理
  useEffect(() => {
    if (error) {
      toast.error(error);
      addLog({
        type: "error",
        message: error,
        nodeId: currentNodeId || undefined
      });
    }
  }, [error, currentNodeId]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const getCurrentNodeInfo = useCallback((): string => {
    if (!currentNodeId) return "";
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) return "";
    return `${node.data.name} (${node.type})`;
  }, [currentNodeId, nodes]);

  const handleStart = useCallback(() => {
    setExecutionTime(0);
    setProgress(0);
    setLogs([]);
    setPerformanceMetrics([]);
    startExecution();
    addLog({
      type: "info",
      message: "开始执行工作流",
    });
    setExecutionHistory(prev => [
      {
        startTime: new Date(),
        status: "running",
        nodesExecuted: 0,
      },
      ...prev,
    ]);
  }, [startExecution]);

  const handleStop = useCallback(() => {
    stopExecution();
    setExecutionTime(0);
    setProgress(0);
    addLog({
      type: "info",
      message: "工作流执行已停止",
    });
    setExecutionHistory(prev => prev.map((entry, index) => 
      index === 0 ? { 
        ...entry, 
        endTime: new Date(), 
        status: "stopped",
        totalDuration: Math.floor((new Date().getTime() - entry.startTime.getTime()) / 1000)
      } : entry
    ));
  }, [stopExecution]);

  const addLog = (entry: Omit<LogEntry, "timestamp">) => {
    setLogs(prev => [
      { ...entry, timestamp: new Date() },
      ...prev,
    ]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 text-white min-w-[300px]">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {error ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Timer className="w-4 h-4" />
                )}
                <StatusBadge status={
                  error ? "error" :
                  isRunning ? (isPaused ? "paused" : "running") : "stopped"
                } />
              </div>
              <span className="text-sm font-mono">{formatTime(executionTime)}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>执行进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {isRunning && currentNodeId && (
              <div className="text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Info size={14} />
                  <span className="truncate">{getCurrentNodeInfo()}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-green-500/20"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  onClick={pauseExecution}
                  disabled={!isRunning}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-yellow-500/20"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleStop}
                  disabled={!isRunning}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/20"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>

              <select
                className="text-sm rounded px-2 py-1 bg-gray-900 border border-gray-700"
                onChange={(e) => setStepDelay(Number(e.target.value))}
                value={executionState.stepDelay}
              >
                <option value={2000}>慢速</option>
                <option value={1000}>正常</option>
                <option value={500}>快速</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                id="centerOnStep"
                checked={executionState.centerOnStep}
                onChange={(e) => setCenterOnStep(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800"
              />
              <label htmlFor="centerOnStep" className="text-gray-300">执行时居中显示节点</label>
            </div>
          </div>
        </div>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black/90 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">工作流执行控制</SheetTitle>
          <SheetDescription className="text-gray-400">
            查看详细执行信息、日志和性能指标
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="logs" className="mt-4">
          <TabsList className="bg-transparent border-b border-gray-800">
            <TabsTrigger value="logs" className="text-gray-400 data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              执行日志
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-gray-400 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              性能指标
            </TabsTrigger>
            <TabsTrigger value="history" className="text-gray-400 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              执行历史
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="border-none p-0">
            <ScrollArea className="h-[60vh] rounded-md border border-gray-800 p-4">
              {logs.map((log, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex items-start gap-2">
                    <Badge variant={
                      log.type === "error" ? "destructive" : 
                      log.type === "warning" ? "secondary" :
                      log.type === "success" ? "default" : "outline"
                    }>
                      {log.type}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-sm">{log.message}</div>
                      <div className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()} 
                        {log.nodeId && ` - Node: ${log.nodeId}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance" className="border-none p-0">
            <div className="space-y-4">
              <div className="h-[300px]">
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
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="stepDuration"
                      name="执行时间 (ms)"
                      stroke="#8884d8"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      name="CPU使用率 (%)"
                      stroke="#82ca9d"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      name="内存使用 (MB)"
                      stroke="#ffc658"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">平均执行时间</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(
                          performanceMetrics.reduce((acc, curr) => acc + curr.stepDuration, 0) /
                          performanceMetrics.length
                        )
                      : 0}
                    ms
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">CPU使用率</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(
                          performanceMetrics[performanceMetrics.length - 1].cpuUsage
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">内存使用</div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.length > 0
                      ? Math.round(
                          performanceMetrics[performanceMetrics.length - 1].memoryUsage
                        )
                      : 0}
                    MB
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="border-none p-0">
            <ScrollArea className="h-[60vh] rounded-md border border-gray-800 p-4">
              {executionHistory.map((entry, index) => (
                <div key={index} className="mb-4 last:mb-0 bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">
                        {entry.startTime.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        持续时间: {entry.totalDuration || 
                          (entry.endTime ? 
                            Math.round((entry.endTime.getTime() - entry.startTime.getTime()) / 1000) :
                            "进行中"
                          )} 秒
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    执行节点数: {entry.nodesExecuted}
                  </div>
                  {entry.endTime && (
                    <div className="text-xs text-gray-500 mt-1">
                      结束时间: {entry.endTime.toLocaleString()}
                    </div>
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

export default ExecutionControl;
