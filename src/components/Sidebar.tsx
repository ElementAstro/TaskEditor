import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
  "Data Management": [
    { type: "task", name: "Basic Task", icon: FileText },
    { type: "fileUpload", name: "File Upload", icon: Upload },
    { type: "fileDownload", name: "File Download", icon: Download },
    { type: "folderManage", name: "Folder Manager", icon: Folders },
  ],
  "Integration": [
    { type: "task", name: "API Call", icon: Globe },
    { type: "task", name: "Data Processing", icon: Database },
    { type: "notification", name: "Notification", icon: Mail },
  ],
  "Automation": [
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
    <aside className="w-64 bg-gray-100 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Node Types</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full px-3 py-2 rounded border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-2 py-1 rounded text-sm ${
            selectedCategory === null
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {Object.keys(nodeCategories).map((category) => (
          <button
            key={category}
            className={`px-2 py-1 rounded text-sm ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {Object.entries(filteredCategories).map(([category, nodes]) => (
        <div key={category} className="mb-4">
          <button
            className="w-full text-left font-medium text-gray-700 hover:text-gray-900 flex items-center justify-between"
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
          >
            <span>{category}</span>
            <span>{expandedCategory === category ? "▼" : "▶"}</span>
          </button>
          {expandedCategory === category && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 grid gap-2"
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
    </aside>
  );
}
