/**
 * Agent Trace Collector
 * 
 * Collects and manages execution traces for multi-agent workflows.
 * Provides methods to track agent starts, completions, and failures.
 * 
 * Feature: FR-1.6.3 - Agent Trace System
 * Task: TASK-FEAT-AW005
 */

import { randomUUID } from 'crypto';
import {
  AgentTrace,
  AgentExecution,
  AgentExecutionMetadata,
  AgentTraceStatus,
} from '@decisionhub/shared';

/**
 * AgentTraceCollector manages the collection of agent execution data
 * throughout a multi-agent workflow.
 * 
 * Thread-safe for async agents through immutable operations.
 * 
 * Usage:
 * ```typescript
 * const trace = new AgentTraceCollector();
 * const execId = trace.startAgent('IntentAgent', 'intent', { query: '...' });
 * // ... agent execution ...
 * trace.endAgent(execId, { category: 'SUV', confidence: 0.92 });
 * const finalTrace = trace.toJSON();
 * ```
 */
export class AgentTraceCollector {
  private trace: AgentTrace;
  private executionMap: Map<string, AgentExecution>;

  constructor(aiProvider?: string) {
    this.trace = {
      workflowId: randomUUID(),
      startTime: new Date().toISOString(),
      status: 'in-progress',
      executions: [],
      aiProvider,
    };
    this.executionMap = new Map();
  }

  /**
   * Start tracking an agent execution
   * 
   * @param agentName - Name of the agent (e.g., 'IntentAgent')
   * @param agentType - Type/role of agent (e.g., 'intent', 'research')
   * @param input - Input data for the agent (will be sanitized)
   * @returns Execution ID for tracking this specific execution
   */
  startAgent(
    agentName: string,
    agentType: string,
    input: Record<string, unknown>
  ): string {
    const executionId = randomUUID();
    const startTime = new Date().toISOString();

    const execution: AgentExecution = {
      id: executionId,
      agentName,
      agentType,
      startTime,
      status: 'processing',
      input: this.sanitizeData(input),
    };

    this.executionMap.set(executionId, execution);
    this.trace.executions.push(execution);

    return executionId;
  }

  /**
   * Complete tracking for an agent execution
   * 
   * @param executionId - ID returned from startAgent()
   * @param output - Output data from the agent
   * @param metadata - Optional metadata (AI provider, tokens, etc.)
   */
  endAgent(
    executionId: string,
    output: Record<string, unknown>,
    metadata?: AgentExecutionMetadata
  ): void {
    const execution = this.executionMap.get(executionId);

    if (!execution) {
      console.warn(`No execution found for ID: ${executionId}`);
      return;
    }

    const endTime = new Date().toISOString();
    const durationMs = this.calculateDuration(execution.startTime, endTime);

    execution.endTime = endTime;
    execution.durationMs = durationMs;
    execution.status = 'completed';
    execution.output = this.sanitizeData(output);
    execution.metadata = metadata;
  }

  /**
   * Record an agent failure
   * 
   * @param executionId - ID returned from startAgent()
   * @param error - Error object from the failure
   */
  logError(executionId: string, error: Error): void {
    const execution = this.executionMap.get(executionId);

    if (!execution) {
      console.warn(`No execution found for ID: ${executionId}`);
      return;
    }

    const endTime = new Date().toISOString();
    const durationMs = this.calculateDuration(execution.startTime, endTime);

    execution.endTime = endTime;
    execution.durationMs = durationMs;
    execution.status = 'failed';
    execution.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  /**
   * Mark an agent execution as skipped
   * 
   * @param agentName - Name of the agent
   * @param agentType - Type/role of agent
   * @param reason - Reason for skipping
   */
  skipAgent(agentName: string, agentType: string, reason: string): void {
    const executionId = randomUUID();
    const timestamp = new Date().toISOString();

    const execution: AgentExecution = {
      id: executionId,
      agentName,
      agentType,
      startTime: timestamp,
      endTime: timestamp,
      durationMs: 0,
      status: 'skipped',
      input: { reason },
    };

    this.executionMap.set(executionId, execution);
    this.trace.executions.push(execution);
  }

  /**
   * Finalize the trace when workflow completes
   * 
   * @param status - Final status of the workflow
   */
  finalize(status: AgentTraceStatus = 'completed'): void {
    const endTime = new Date().toISOString();
    const totalDurationMs = this.calculateDuration(this.trace.startTime, endTime);

    this.trace.endTime = endTime;
    this.trace.totalDurationMs = totalDurationMs;
    this.trace.status = status;

    // Calculate success and error count
    const errorCount = this.trace.executions.filter(e => e.status === 'failed').length;
    this.trace.errorCount = errorCount;
    this.trace.success = errorCount === 0 && status === 'completed';
  }

  /**
   * Get the current trace state
   * 
   * @returns Current AgentTrace object
   */
  getTrace(): AgentTrace {
    return { ...this.trace, executions: [...this.trace.executions] };
  }

  /**
   * Serialize trace for JSON response
   * 
   * @param includeStacks - Whether to include error stack traces (default: false)
   * @returns Serialized AgentTrace object
   */
  toJSON(includeStacks = false): AgentTrace {
    const trace = this.getTrace();

    // Remove stack traces in production if requested
    if (!includeStacks) {
      trace.executions = trace.executions.map(exec => {
        if (exec.error?.stack) {
          const { stack, ...errorWithoutStack } = exec.error;
          return { ...exec, error: errorWithoutStack };
        }
        return exec;
      });
    }

    return trace;
  }

  /**
   * Get workflow ID
   */
  getWorkflowId(): string {
    return this.trace.workflowId;
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): AgentExecution | undefined {
    return this.executionMap.get(executionId);
  }

  /**
   * Get all executions
   */
  getExecutions(): AgentExecution[] {
    return [...this.trace.executions];
  }

  // Private helper methods

  /**
   * Calculate duration between two ISO timestamps
   */
  private calculateDuration(startTime: string, endTime: string): number {
    return new Date(endTime).getTime() - new Date(startTime).getTime();
  }

  /**
   * Sanitize data for storage (remove sensitive info, limit size)
   * 
   * In production, this could:
   * - Remove API keys, tokens
   * - Truncate large objects
   * - Redact PII
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    // For MVP, just clone the data
    // Future: Add actual sanitization logic
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      // If data is not serializable, return a safe representation
      return { _error: 'Data not serializable', _type: typeof data };
    }
  }
}
