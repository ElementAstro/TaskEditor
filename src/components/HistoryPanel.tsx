import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, GripHorizontal } from "lucide-react";
import type { HistoryGroup } from "@/types/types";

interface HistoryPanelProps {
  historyGroups: HistoryGroup[];
  onRestoreState: (groupId: string, entryId: string) => void;
}

export default function HistoryPanel({
  historyGroups,
  onRestoreState,
}: HistoryPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: 20,
    y: 20, // 提供一个默认值
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 添加useEffect来在客户端设置初始位置
  useEffect(() => {
    setPosition({
      x: 20,
      y: window.innerHeight - 340,
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest(".drag-handle")) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.pageX - position.x,
        startY: e.pageY - position.y,
      };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const newX = e.pageX - dragRef.current.startX;
        const newY = e.pageY - dragRef.current.startY;
        setPosition({ x: newX, y: newY });
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={panelRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? "none" : "transform 0.3s",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-64 overflow-hidden"
        style={{
          height: isMinimized ? "40px" : "300px",
          transition: "height 0.3s",
        }}
      >
        <div className="bg-gray-100 p-2 flex items-center justify-between drag-handle cursor-move">
          <div className="flex items-center">
            <GripHorizontal size={16} className="mr-2 text-gray-500" />
            <span className="font-medium">History</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {!isMinimized && (
          <div className="overflow-y-auto h-[calc(300px-40px)]">
            <div className="p-2">
              {historyGroups.map((group) => (
                <div key={group.id} className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {new Date(group.timestamp).toLocaleTimeString()}
                  </div>
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-50 p-2 rounded mb-1 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => onRestoreState(group.id, entry.id)}
                    >
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-gray-500 text-xs">
                        {entry.details}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
