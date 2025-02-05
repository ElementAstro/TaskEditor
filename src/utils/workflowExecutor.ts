import { Node, Edge } from 'reactflow';
import { NodeData, BranchCondition, LoopConfig, VariableValue } from '@/types/types';

export class WorkflowExecutor {
  private nodes: Node[];
  private edges: Edge[];
  private variables: Record<string, VariableValue>;
  private visited: Set<string>;
  private loopCounters: Map<string, number>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.variables = {};
    this.visited = new Set();
    this.loopCounters = new Map();
  }

  private isArrayLike(value: VariableValue): value is unknown[] {
    return Array.isArray(value);
  }

  private isNumber(value: VariableValue): value is number {
    return typeof value === 'number';
  }

  private isValidVariableValue(value: unknown): value is VariableValue {
    if (value === null) return false;
    const type = typeof value;
    return type === 'string' || type === 'number' || type === 'boolean' || Array.isArray(value);
  }

  getNextNode(currentNodeId: string | null): string | null {
    if (!currentNodeId) {
      // 找到开始节点
      const startNode = this.nodes.find(node => node.type === 'start');
      return startNode?.id || null;
    }

    const currentNode = this.nodes.find(node => node.id === currentNodeId) as NodeData;
    if (!currentNode) return null;

    // 根据节点类型处理不同的逻辑
    switch (currentNode.type) {
      case 'branch':
        return this.handleBranchNode(currentNode);
      case 'loop':
        return this.handleLoopNode(currentNode);
      default:
        // 普通节点，获取下一个连接的节点
        const outgoingEdges = this.edges.filter(edge => edge.source === currentNodeId);
        if (outgoingEdges.length > 0) {
          return outgoingEdges[0].target;
        }
        return null;
    }
  }

  private handleBranchNode(node: NodeData): string | null {
    const conditions = node.data.conditions || [];
    // 评估条件
    const matchedCondition = conditions.find(condition => this.evaluateCondition(condition));
    
    // 获取对应的边
    const edges = this.edges.filter(edge => edge.source === node.id);
    if (matchedCondition) {
      const trueEdge = edges.find(edge => edge.sourceHandle === 'true');
      return trueEdge?.target || null;
    } else {
      const falseEdge = edges.find(edge => edge.sourceHandle === 'false');
      return falseEdge?.target || null;
    }
  }

  private handleLoopNode(node: NodeData): string | null {
    const loopConfig = node.data.loopConfig as LoopConfig;
    const counter = this.loopCounters.get(node.id) || 0;

    if (!loopConfig) return this.getNextNonLoopNode(node.id);

    switch (loopConfig.type) {
      case 'count':
        if (counter < (loopConfig.count || 1)) {
          this.loopCounters.set(node.id, counter + 1);
          return this.getLoopBodyNode(node.id);
        }
        break;
      case 'while':
        if (loopConfig.condition && this.evaluateCondition(loopConfig.condition)) {
          return this.getLoopBodyNode(node.id);
        }
        break;
      case 'forEach': {
        const collection = this.variables[loopConfig.collection || ''];
        if (this.isArrayLike(collection)) {
          if (counter < collection.length) {
            this.loopCounters.set(node.id, counter + 1);
            // 确保类型安全的赋值
            const currentValue = collection[counter];
            if (this.isValidVariableValue(currentValue)) {
              this.variables['current'] = currentValue;
            }
            return this.getLoopBodyNode(node.id);
          }
        }
        break;
      }
    }

    return this.getNextNonLoopNode(node.id);
  }

  private getLoopBodyNode(nodeId: string): string | null {
    const bodyEdge = this.edges.find(edge => 
      edge.source === nodeId && edge.sourceHandle === 'body'
    );
    return bodyEdge?.target || null;
  }

  private getNextNonLoopNode(nodeId: string): string | null {
    const nextEdge = this.edges.find(edge => 
      edge.source === nodeId && edge.sourceHandle === 'next'
    );
    return nextEdge?.target || null;
  }

  private evaluateCondition(condition: BranchCondition): boolean {
    const value = this.variables[condition.field];
    const conditionValue = condition.value;

    switch (condition.type) {
      case 'eq': return value === conditionValue;
      case 'neq': return value !== conditionValue;
      case 'gt': 
        return this.isNumber(value) && this.isNumber(conditionValue) && value > conditionValue;
      case 'lt':
        return this.isNumber(value) && this.isNumber(conditionValue) && value < conditionValue;
      case 'gte':
        return this.isNumber(value) && this.isNumber(conditionValue) && value >= conditionValue;
      case 'lte':
        return this.isNumber(value) && this.isNumber(conditionValue) && value <= conditionValue;
      case 'contains': {
        if (typeof value === 'string') {
          return value.includes(String(conditionValue));
        }
        if (this.isArrayLike(value)) {
          return value.includes(conditionValue);
        }
        return false;
      }
      case 'matches': {
        if (typeof value === 'string') {
          return new RegExp(String(conditionValue)).test(value);
        }
        return false;
      }
      default: return false;
    }
  }
  executeNodeAction(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId) as NodeData;
    if (!node) return;

    // 执行节点特定的操作
    switch (node.type) {
      case 'smartExposure':
        // 模拟曝光操作
        this.variables.exposureTime = node.data.exposureConfig?.exposureTime || 1;
        this.variables.currentADU = Math.random() * 65535;
        break;
      case 'focus':
        // 模拟对焦操作
        this.variables.focusPosition = Math.random() * 1000;
        this.variables.hfdValue = Math.random() * 10;
        break;
      // ... 其他节点类型的处理
    }
  }

  reset(): void {
    this.variables = {};
    this.visited.clear();
    this.loopCounters.clear();
  }
}
