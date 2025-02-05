import { Node, Edge } from 'reactflow';
import { TaskLogic, WorkflowExport, NodeType, VariableValue } from '@/types/types';



export function generateWorkflowLogic(nodes: Node[], edges: Edge[]): WorkflowExport {
    const tasks: TaskLogic[] = nodes.map(node => {
      const baseTask: TaskLogic = {
        id: node.id,
        // Use proper NodeType type instead of any
        type: node.type as NodeType, 
        name: node.data.name,
        description: node.data.description,
        params: node.data.params || { inputs: [], outputs: [] },
        next: edges
          .filter(edge => edge.source === node.id)
          .map(edge => edge.target),
      };
  
      // 处理分支节点
      if (node.type === 'branch' && node.data.conditions) {
        baseTask.conditions = node.data.conditions;
      }
  
      // 处理循环节点
      if (node.type === 'loop' && node.data.loopConfig) {
        baseTask.loopConfig = node.data.loopConfig;
      }
  
      // 处理特定节点配置
      if (node.type && ['smartExposure', 'filterWheel', 'focus', 'dither'].includes(node.type)) {
        baseTask.nodeConfig = {};
        if (node.data.exposureConfig) baseTask.nodeConfig.exposureConfig = node.data.exposureConfig;
        if (node.data.filterConfig) baseTask.nodeConfig.filterConfig = node.data.filterConfig;
        if (node.data.focusConfig) baseTask.nodeConfig.focusConfig = node.data.focusConfig;
        if (node.data.ditherConfig) baseTask.nodeConfig.ditherConfig = node.data.ditherConfig;
      }
  
      return baseTask;
    });
  
    // 构建连接关系
    const connections = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      condition: edge.sourceHandle === 'true' ? 'true' : 
                 edge.sourceHandle === 'false' ? 'false' : undefined
    }));
  
    // 提取工作流中使用的变量
    // Use proper type for variables
    const variables: Record<string, VariableValue> = {};
    tasks.forEach(task => {
      if (task.params?.inputs) {
        task.params.inputs.forEach(input => {
          if (input.defaultValue !== undefined) {
            variables[`${task.id}.${input.name}`] = input.defaultValue;
          }
        });
      }
    });
  
    return {
      metadata: {
        name: "Workflow Export",
        description: "Exported workflow logic",
        version: "1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tasks,
      connections,
      variables
    };
  }

// 导出为 YAML 格式
export function exportToYAML(workflow: WorkflowExport): string {
  return `# Workflow: ${workflow.metadata.name}
version: ${workflow.metadata.version}
description: ${workflow.metadata.description}
createdAt: ${workflow.metadata.createdAt}
updatedAt: ${workflow.metadata.updatedAt}

tasks:
${workflow.tasks.map(task => `
  - id: ${task.id}
    type: ${task.type}
    name: ${task.name}
    description: ${task.description}
    ${task.conditions ? `conditions:
${task.conditions.map(c => `      - field: ${c.field}
        type: ${c.type}
        value: ${c.value}`).join('\n')}` : ''}
    ${task.loopConfig ? `loopConfig:
      type: ${task.loopConfig.type}
      ${task.loopConfig.count ? `count: ${task.loopConfig.count}` : ''}
      ${task.loopConfig.maxIterations ? `maxIterations: ${task.loopConfig.maxIterations}` : ''}` : ''}
    ${task.nodeConfig ? `nodeConfig:
${Object.entries(task.nodeConfig).map(([key, value]) => `      ${key}: ${JSON.stringify(value, null, 6)}`).join('\n')}` : ''}
    params:
      inputs:
${task.params.inputs?.map(input => `        - name: ${input.name}
          type: ${input.type}
          description: ${input.description}
          required: ${input.required}
          defaultValue: ${input.defaultValue}`).join('\n') || '        []'}
      outputs:
${task.params.outputs?.map(output => `        - name: ${output.name}
          type: ${output.type}
          description: ${output.description}`).join('\n') || '        []'}
`).join('\n')}

connections:
${workflow.connections.map(conn => `  - source: ${conn.source}
    target: ${conn.target}
    ${conn.condition ? `condition: ${conn.condition}` : ''}`).join('\n')}

variables:
${Object.entries(workflow.variables).map(([key, value]) => `  ${key}: ${value}`).join('\n')}
`;
}
