/**
 * Lead Decision Agent
 * Uses AI to explain the decision-making strategy and reasoning
 */

import { BaseAgent } from './base/BaseAgent';
import { AIProviderFactory, AIMessage } from '../services/ai';
import { AgentTraceCollector } from '../services/agentTrace';
import { CarRecommendation } from '@decisionhub/shared';

interface DecisionExplanation {
  strategy: string;
  reasoning: string;
  keyFactors: string[];
  confidence: number;
}

export class LeadDecisionAgent extends BaseAgent {
  name = 'LeadDecisionAgent';
  description = 'Explains decision-making strategy using AI';

  async execute(
    input: {
      query: string;
      topRecommendations: CarRecommendation[];
    },
    trace?: AgentTraceCollector
  ): Promise<DecisionExplanation> {
    this.log('Generating decision explanation');

    // Start agent trace if provided
    const executionId = trace?.startAgent('LeadDecisionAgent', 'decision', {
      query: input.query,
      recommendationsCount: input.topRecommendations.length,
    });

    try {
      const provider = AIProviderFactory.getProvider();
      const isRealAI = AIProviderFactory.isRealAI();

      if (isRealAI) {
        this.log('Using real AI for decision explanation');
      } else {
        this.log('Using mock AI for decision explanation');
      }

      const topCars = input.topRecommendations
        .slice(0, 3)
        .map((rec, idx) => `${idx + 1}. ${rec.car.make} ${rec.car.model} (Score: ${rec.score})`)
        .join('\n');

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are the Lead Decision Agent for DecisionHub AI.

Your task:
1. Explain the decision-making strategy used
2. Provide clear reasoning for the recommendations
3. Highlight key factors that influenced the decision
4. Give a confidence assessment

Respond ONLY with valid JSON in this format:
{
  "strategy": "Brief description of the decision strategy",
  "reasoning": "Detailed explanation of why these vehicles were recommended",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "confidence": 0.85
}

Be concise, informative, and focus on the Colombian market context.`,
        },
        {
          role: 'user',
          content: `User Query: "${input.query}"\n\nTop Recommendations:\n${topCars}\n\nExplain the decision strategy and reasoning behind these recommendations.`,
        },
      ];

      const response = await provider.chat(messages, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      const result = this.parseAIResponse(response.content);

      this.log('Decision explanation generated successfully');

      // End agent trace on success
      if (executionId && trace) {
        trace.endAgent(executionId, {
          strategy: result.strategy,
          confidence: result.confidence,
          keyFactorsCount: result.keyFactors.length,
        }, {
          aiProvider: isRealAI ? 'github' : 'mock',
          modelId: response.model,
          tokensUsed: response.usage?.totalTokens,
        });
      }

      return result;
    } catch (error) {
      this.logError('Decision explanation failed, using fallback', error as Error);
      
      // Log error to trace if available
      if (executionId && trace) {
        trace.logError(executionId, error as Error);
      }
      
      return this.getFallbackExplanation(input);
    }
  }

  private parseAIResponse(content: string): DecisionExplanation {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonStr);

      return {
        strategy: parsed.strategy || 'Weighted scoring strategy',
        reasoning: parsed.reasoning || 'Recommendations based on user preferences',
        keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.80,
      };
    } catch (error) {
      this.logError('Failed to parse decision explanation', error as Error);
      throw error;
    }
  }

  private getFallbackExplanation(input: {
    query: string;
    topRecommendations: CarRecommendation[];
  }): DecisionExplanation {
    return {
      strategy: 'Weighted Multi-Criteria Decision Analysis',
      reasoning: `These vehicles were selected based on a comprehensive analysis of your requirements. ` +
        `The system evaluated each vehicle against multiple criteria including safety, reliability, ` +
        `comfort, and fuel efficiency. Scores were calculated using weighted factors derived from ` +
        `your query, with priority given to your stated preferences. All recommendations fit within ` +
        `your budget constraints and are suitable for the Colombian market.`,
      keyFactors: [
        'User-stated preferences and requirements',
        'Vehicle availability in Colombian market',
        'Safety ratings and features',
        'Reliability and maintenance considerations',
        'Budget fit and value proposition',
      ],
      confidence: 0.82,
    };
  }
}
