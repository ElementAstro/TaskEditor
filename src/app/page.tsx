"use client";

import { ReactFlowProvider } from "reactflow";
import EnhancedLowCodeEditor from "@/components/EnhancedLowCodeEditor";

export default function Home() {
  return (
    <ReactFlowProvider>
      <EnhancedLowCodeEditor />
    </ReactFlowProvider>
  );
}
