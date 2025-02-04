import { MiniMap as ReactFlowMiniMap } from "reactflow";

export default function MiniMap() {
  return (
    <ReactFlowMiniMap
      nodeStrokeColor={(n) => {
        if (n.style?.background) return n.style.background as string;
        if (n.type === "input") return "#0041d0";
        if (n.type === "output") return "#ff0072";
        if (n.type === "default") return "#1a192b";
        return "#eee";
      }}
      nodeColor={(n) => {
        if (n.style?.background) return n.style.background as string;
        return "#fff";
      }}
      nodeBorderRadius={2}
    />
  );
}
