import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, Square, Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEditorStore from "@/store/editorStore";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { NodeData } from "@/types/types";

const ExecutionControl: React.FC = () => {
  const [executionTime, setExecutionTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    nodes,
    executionState,
    startExecution,
    pauseExecution,
    stopExecution,
    setStepDelay,
    setCenterOnStep
  } = useEditorStore();

  const { isRunning, isPaused, currentNodeId, executionPath, error } = executionState;

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && !isPaused) {
      const timer = setInterval(() => {
        setExecutionTime((prev) => prev + 1);
      }, 1000);
      setTimerId(timer);
    } else if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
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
    if (currentNodeId) {
      // 移除之前的高亮
      nodes.forEach(node => {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          element.classList.remove('highlight-node');
        }
      });

      // 添加当前节点高亮
      const currentElement = document.querySelector(`[data-id="${currentNodeId}"]`);
      if (currentElement) {
        currentElement.classList.add('highlight-node');
      }
    }

    return () => {
      // 清理高亮效果
      nodes.forEach(node => {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          element.classList.remove('highlight-node');
        }
      });
    };
  }, [currentNodeId, nodes]);

  // 错误处理
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // 获取当前节点信息
  const getCurrentNodeInfo = useCallback(() => {
    if (!currentNodeId) return "";
    const node = nodes.find(n => n.id === currentNodeId) as NodeData;
    return node ? `${node.data.name} (${node.type})` : "";
  }, [currentNodeId, nodes]);

  // 处理开始执行
  const handleStart = useCallback(() => {
    setExecutionTime(0);
    setProgress(0);
    startExecution();
  }, [startExecution]);

  // 处理停止执行
  const handleStop = useCallback(() => {
    stopExecution();
    setExecutionTime(0);
    setProgress(0);
  }, [stopExecution]);

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
      <div className="flex flex-col space-y-3">
        {/* 状态和时间显示 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Timer className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">
              {isRunning ? (isPaused ? "已暂停" : "运行中") : "已停止"}
            </span>
          </div>
          <span className="text-sm">{formatTime(executionTime)}</span>
        </div>

        {/* 进度条 */}
        <Progress value={progress} className="h-2" />

        {/* 当前节点信息 */}
        {isRunning && currentNodeId && (
          <div className="text-sm text-gray-600 truncate">
            当前执行: {getCurrentNodeInfo()}
          </div>
        )}

        {/* 控制按钮组 */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={handleStart}
              disabled={isRunning}
              variant={isRunning ? "ghost" : "default"}
              size="icon"
              title="开始执行"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              onClick={pauseExecution}
              disabled={!isRunning}
              variant={!isRunning ? "ghost" : "secondary"}
              size="icon"
              title={isPaused ? "继续执行" : "暂停执行"}
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleStop}
              disabled={!isRunning}
              variant={!isRunning ? "ghost" : "destructive"}
              size="icon"
              title="停止执行"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          {/* 执行速度控制 */}
          <select
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => setStepDelay(Number(e.target.value))}
            value={executionState.stepDelay}
          >
            <option value={2000}>慢速</option>
            <option value={1000}>正常</option>
            <option value={500}>快速</option>
          </select>
        </div>

        {/* 其他选项 */}
        <div className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="centerOnStep"
            checked={executionState.centerOnStep}
            onChange={(e) => setCenterOnStep(e.target.checked)}
          />
          <label htmlFor="centerOnStep">执行时居中显示节点</label>
        </div>
      </div>
    </div>
  );
};

export default ExecutionControl;
