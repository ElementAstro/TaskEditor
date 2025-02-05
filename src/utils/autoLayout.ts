import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "reactflow";
import { Position } from "reactflow";

interface LayoutOptions {
  direction?: "TB" | "LR" | "BT" | "RL";
  nodeSpacing?: number;
  rankSpacing?: number;
  groupPadding?: number;
  alignGroups?: boolean;
  compactLayout?: boolean;
  alignment?: "UL" | "UR" | "DL" | "DR" | "C";
  optimizeGroups?: boolean;
}

const defaultOptions: LayoutOptions = {
  direction: "TB",
  nodeSpacing: 50,
  rankSpacing: 100,
  groupPadding: 20,
  alignGroups: true,
  compactLayout: false,
  alignment: "C",
  optimizeGroups: true,
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = opts.direction === "LR" || opts.direction === "RL";
  dagreGraph.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    align: opts.alignment,
  });

  // 分组节点预处理
  const groups = nodes.filter((node) => node.type === "group");
  const nonGroupNodes = nodes.filter((node) => node.type !== "group");

  // 创建节点映射关系
  const nodeGroups = new Map<string, string>();
  if (opts.optimizeGroups) {
    nonGroupNodes.forEach((node) => {
      groups.forEach((group) => {
        if (isNodeInGroup(node, group)) {
          nodeGroups.set(node.id, group.id);
        }
      });
    });
  }

  // 添加非分组节点
  nonGroupNodes.forEach((node) => {
    const width = node.width || 172;
    const height = node.height || 36;
    dagreGraph.setNode(node.id, { width, height });
  });

  // 添加边
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 执行布局
  dagre.layout(dagreGraph);

  // 应用布局结果
  const layoutedNodes = nonGroupNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const groupId = nodeGroups.get(node.id);

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - (node.width || 172) / 2,
        y: nodeWithPosition.y - (node.height || 36) / 2,
      },
      // 添加分组信息用于后续优化
      data: {
        ...node.data,
        groupId,
      },
    };
  });

  // 优化分组布局
  if (opts.optimizeGroups) {
    groups.forEach((group) => {
      const groupNodes = layoutedNodes.filter(
        (node) => node.data.groupId === group.id
      );

      if (groupNodes.length > 0) {
        // 计算分组边界
        const bounds = getGroupBounds(groupNodes);
        const padding = opts.groupPadding ?? defaultOptions.groupPadding ?? 20;

        // 应用分组padding
        bounds.x -= padding;
        bounds.y -= padding;
        bounds.width += padding * 2;
        bounds.height += padding * 2;

        group.position = { x: bounds.x, y: bounds.y };
        group.style = {
          ...group.style,
          width: bounds.width,
          height: bounds.height,
        };
      }
    });
  }

  // 根据布局选项进行额外优化
  if (opts.compactLayout) {
    compactLayout(layoutedNodes);
  }

  if (opts.alignGroups) {
    alignGroups(groups);
  }

  return {
    nodes: [...layoutedNodes, ...groups],
    edges,
  };
};

// 检查节点是否在分组内
const isNodeInGroup = (node: Node, group: Node): boolean => {
  if (!group.position || !group.style?.width || !group.style?.height)
    return false;

  const nodeCenter = {
    x: node.position.x + (node.width || 172) / 2,
    y: node.position.y + (node.height || 36) / 2,
  };

  const groupWidth = Number(group.style.width);
  const groupHeight = Number(group.style.height);

  return (
    nodeCenter.x >= group.position.x &&
    nodeCenter.x <= group.position.x + groupWidth &&
    nodeCenter.y >= group.position.y &&
    nodeCenter.y <= group.position.y + groupHeight
  );
};

// 获取分组边界
const getGroupBounds = (nodes: Node[]) => {
  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);
  const rights = nodes.map((n) => n.position.x + (n.width || 172));
  const bottoms = nodes.map((n) => n.position.y + (n.height || 36));

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...rights) - Math.min(...xs),
    height: Math.max(...bottoms) - Math.min(...ys),
  };
};

// 紧凑布局优化
const compactLayout = (nodes: Node[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const otherNodes = nodes.filter((n, index) => index !== i);

    // 尝试向上移动节点
    let canMoveUp = true;
    while (canMoveUp) {
      const nextY = node.position.y - 1;
      if (nextY < 0) break;

      // 检查是否会与其他节点重叠
      const wouldOverlap = otherNodes.some((other) =>
        checkOverlap(
          { ...node, position: { ...node.position, y: nextY } },
          other
        )
      );

      if (wouldOverlap) {
        canMoveUp = false;
      } else {
        node.position.y = nextY;
      }
    }
  }
};

// 分组对齐
const alignGroups = (groups: Node[]) => {
  groups.forEach((group, i) => {
    if (i === 0) return;

    const prevGroup = groups[i - 1];
    const spacing = defaultOptions.rankSpacing ?? 100;

    // 水平对齐
    if (Math.abs(group.position.y - prevGroup.position.y) < spacing) {
      group.position.y = prevGroup.position.y;
    }

    // 垂直间距
    if (
      group.position.x <
      prevGroup.position.x + Number(prevGroup.style?.width || 0) + spacing
    ) {
      group.position.x =
        prevGroup.position.x + Number(prevGroup.style?.width || 0) + spacing;
    }
  });
};

// 辅助函数：检查两个节点是否重叠
const checkOverlap = (node1: Node, node2: Node): boolean => {
  const n1Right = node1.position.x + (node1.width || 172);
  const n1Bottom = node1.position.y + (node1.height || 36);
  const n2Right = node2.position.x + (node2.width || 172);
  const n2Bottom = node2.position.y + (node2.height || 36);

  return !(
    n1Right < node2.position.x ||
    node1.position.x > n2Right ||
    n1Bottom < node2.position.y ||
    node1.position.y > n2Bottom
  );
};

export default getLayoutedElements;
