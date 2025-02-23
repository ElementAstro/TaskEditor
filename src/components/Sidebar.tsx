import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Flag,
  Trophy,
  GitFork,
  FileText,
  Globe,
  Database,
  Camera,
  Upload,
  Download,
  Image,
  Filter,
  Folders,
  PlayCircle,
  Pause,
  AlertTriangle,
  Mail,
  RefreshCw,
  GitBranch,
  Repeat,
  Thermometer,
  Search,
  Move,
  Focus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NodeItem {
  type: string;
  name: string;
  icon: typeof Flag;
}

const nodeCategories = {
  "Flow Control": [
    { type: "start", name: "Start", icon: Flag },
    { type: "end", name: "End", icon: Trophy },
    { type: "decision", name: "Decision", icon: GitFork },
    { type: "pause", name: "Pause", icon: Pause },
    { type: "retry", name: "Retry", icon: RefreshCw },
  ],
  "Imaging Tasks": [
    { type: "smartExposure", name: "Smart Exposure", icon: Camera },
    { type: "filterWheel", name: "Filter Change", icon: Filter },
    { type: "focus", name: "Auto Focus", icon: Image },
    { type: "dither", name: "Dither", icon: RefreshCw },
  ],
  "Imaging Control": [
    { type: "smartExposure", name: "Smart Exposure", icon: Camera },
    { type: "filterWheel", name: "Filter Wheel", icon: Filter },
    { type: "focus", name: "Auto Focus", icon: Focus },
    { type: "dither", name: "Dither Control", icon: Move },
    { type: "platesolving", name: "Plate Solving", icon: Search },
    { type: "cooling", name: "Camera Cooling", icon: Thermometer },
  ],
  "Data Management": [
    { type: "task", name: "Basic Task", icon: FileText },
    { type: "fileUpload", name: "File Upload", icon: Upload },
    { type: "fileDownload", name: "File Download", icon: Download },
    { type: "folderManage", name: "Folder Manager", icon: Folders },
  ],
  Integration: [
    { type: "task", name: "API Call", icon: Globe },
    { type: "task", name: "Data Processing", icon: Database },
    { type: "notification", name: "Notification", icon: Mail },
  ],
  Automation: [
    { type: "sequence", name: "Sequence", icon: PlayCircle },
    { type: "condition", name: "Condition Check", icon: AlertTriangle },
    { type: "loop", name: "Loop", icon: Repeat },
    { type: "branch", name: "Branch", icon: GitBranch },
  ],
};

const DraggableNode = ({ node, index }: { node: NodeItem; index: number }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("application/reactflow", node.type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      className="bg-white p-4 rounded shadow cursor-move hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        draggable
        onDragStart={onDragStart}
        className="flex items-center w-full group"
      >
        <node.icon className="mr-2 group-hover:text-blue-500" size={20} />
        <span className="group-hover:text-blue-500">{node.name}</span>
      </div>
    </motion.div>
  );
};

export default function Sidebar() {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = Object.entries(nodeCategories).reduce(
    (acc: { [key: string]: NodeItem[] }, [category, nodes]) => {
      const filteredNodes = nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!selectedCategory || category === selectedCategory)
      );
      if (filteredNodes.length > 0) {
        acc[category] = filteredNodes;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="w-64 flex flex-col h-full border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">
          {t("editor.sidebar.nodeTypes")}
        </h2>
        <Input
          type="text"
          placeholder={t("editor.sidebar.searchNodes")}
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-[40px] whitespace-nowrap">
          <div className="flex gap-2 px-1">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t("editor.sidebar.all")}
            </Button>
            {Object.keys(nodeCategories).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(filteredCategories).map(([category, nodes]) => (
            <div key={category} className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between font-medium"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category
                  )
                }
              >
                <span>{category}</span>
                <span>{expandedCategory === category ? "▼" : "▶"}</span>
              </Button>
              {expandedCategory === category && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-2"
                >
                  {nodes.map((node, index) => (
                    <DraggableNode
                      key={`${node.type}-${index}`}
                      node={node}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
