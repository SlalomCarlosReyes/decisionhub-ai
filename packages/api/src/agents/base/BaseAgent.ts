import { Agent, AgentInput, AgentOutput } from '@decisionhub/shared';

/**
 * Base Agent class providing common functionality for all agents
 * MVP: Provides structure for future AI integration
 */
export abstract class BaseAgent implements Agent {
  abstract name: string;
  abstract description: string;

  abstract execute(input: AgentInput): Promise<AgentOutput>;

  protected log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] ${message}`);
  }

  protected logError(message: string, error: Error): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.name}] ERROR: ${message}`, error);
  }

  protected async measureExecutionTime<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();
    const result = await operation();
    const executionTime = Date.now() - startTime;
    return { result, executionTime };
  }
}
