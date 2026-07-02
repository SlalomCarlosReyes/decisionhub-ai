/**
 * Agent Trace Types
 * 
 * Defines types for comprehensive agent execution tracking.
 * Used for transparency, debugging, and performance monitoring.
 * 
 * Feature: FR-1.6.3 - Agent Trace System
 */

/**
 * Status of an agent execution
 */
export type AgentExecutionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

/**
 * Status of the overall workflow
 */
export type AgentTraceStatus = 'in-progress' | 'completed' | 'failed';

/**
 * Metadata for AI-powered agent executions
 */
export interface AgentExecutionMetadata {
  aiProvider?: 'github' | 'mock' | 'none';
  modelId?: string;
  tokensUsed?: number;
  confidenceScore?: number;
  itemsProcessed?: number;
}

/**
 * Error information for failed executions
 */
export interface AgentExecutionError {
  message: string;
  stack?: string;
}

/**
 * Represents a single agent's execution within a workflow
 */
export interface AgentExecution {
  id: string;                                    // Unique execution ID
  agentName: string;                             // Name of the agent
  agentType: string;                             // Type/role of agent
  startTime: string;                             // ISO timestamp
  endTime?: string;                              // ISO timestamp
  durationMs?: number;                           // Execution duration in milliseconds
  status: AgentExecutionStatus;                  // Current status
  input: Record<string, unknown>;                // Input data (sanitized)
  output?: Record<string, unknown>;              // Output data (sanitized)
  error?: AgentExecutionError;                   // Error details if failed
  metadata?: AgentExecutionMetadata;             // Additional metadata
}

/**
 * Represents the complete trace of a multi-agent workflow
 */
export interface AgentTrace {
  workflowId: string;                            // Unique workflow ID
  startTime: string;                             // ISO timestamp
  endTime?: string;                              // ISO timestamp
  totalDurationMs?: number;                      // Total workflow duration
  status: AgentTraceStatus;                      // Overall workflow status
  executions: AgentExecution[];                  // Array of agent executions
  aiProvider?: string;                           // Primary AI provider used
  success?: boolean;                             // Whether workflow completed successfully
  errorCount?: number;                           // Number of failed agent executions
}
