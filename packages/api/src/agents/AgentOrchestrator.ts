import { AgentInput, AgentOutput } from '@decisionhub/shared';
import { BaseAgent } from './base/BaseAgent';
import { CarRecommendationAgent } from './CarRecommendationAgent';
import { CarComparisonAgent } from './CarComparisonAgent';

type AgentType = 'recommendation' | 'comparison';

/**
 * Agent Orchestrator (MVP)
 * Coordinates multiple agents based on request type
 * Future: Add more sophisticated orchestration logic
 */
export class AgentOrchestrator extends BaseAgent {
  name = 'AgentOrchestrator';
  description = 'Coordinates and routes requests to appropriate agents';

  private recommendationAgent = new CarRecommendationAgent();
  private comparisonAgent = new CarComparisonAgent();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const agentType = input.agentType as AgentType;

    this.log(`Routing to ${agentType} agent...`);

    switch (agentType) {
      case 'recommendation':
        return this.recommendationAgent.execute(input);
      case 'comparison':
        return this.comparisonAgent.execute(input);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  // Future: Add multi-agent workflows
  async executeWorkflow(steps: { agentType: AgentType; input: AgentInput }[]): Promise<AgentOutput[]> {
    this.log(`Executing workflow with ${steps.length} steps...`);
    
    const results: AgentOutput[] = [];
    
    for (const step of steps) {
      const result = await this.execute({ ...step.input, agentType: step.agentType });
      results.push(result);
    }
    
    return results;
  }
}
