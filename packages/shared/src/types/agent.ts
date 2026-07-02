/**
 * Agent-related type definitions
 */

export interface AgentInput {
  [key: string]: unknown;
}

export interface AgentOutput {
  [key: string]: unknown;
}

export interface Agent {
  name: string;
  description: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}

export interface AgentExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  agentName: string;
}

export type AgentType = 'recommendation' | 'comparison' | 'search' | 'analysis';

export interface AgentConfig {
  name: string;
  type: AgentType;
  enabled: boolean;
  priority?: number;
}
