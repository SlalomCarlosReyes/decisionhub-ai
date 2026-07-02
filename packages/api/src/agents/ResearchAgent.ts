/**
 * Research Agent
 * Uses AI to analyze user requests and suggest candidate vehicles
 */

import { BaseAgent } from './base/BaseAgent';
import { AIProviderFactory, AIMessage } from '../services/ai';
import { AgentTraceCollector } from '../services/agentTrace';
import { NaturalLanguageRequest, DetectedPreference, DecisionCriteria } from '@decisionhub/shared';

interface ResearchResult {
  insights: string;
  suggestedFilters: {
    bodyTypes?: string[];
    fuelTypes?: string[];
    priceRange?: { min: number; max: number };
  };
  preferences: DetectedPreference[];
  criteria: DecisionCriteria[];
}

export class ResearchAgent extends BaseAgent {
  name = 'ResearchAgent';
  description = 'Analyzes user requests using AI to identify preferences and suggest vehicles';

  async execute(input: NaturalLanguageRequest, trace?: AgentTraceCollector): Promise<ResearchResult> {
    this.log(`Researching query: "${input.query}"`);

    // Start agent trace if provided
    const executionId = trace?.startAgent('ResearchAgent', 'research', {
      query: input.query,
      currency: input.currency,
    });

    try {
      const provider = AIProviderFactory.getProvider();
      const isRealAI = AIProviderFactory.isRealAI();

      if (isRealAI) {
        this.log('Using real AI for research');
      } else {
        this.log('Using mock AI for research');
      }

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a Research Agent for DecisionHub AI, specialized in the Colombian automotive market.

Your task:
1. Analyze the user's vehicle request
2. Extract key preferences (safety, comfort, fuel efficiency, etc.)
3. Suggest vehicle types and filters
4. Generate decision criteria with weights

Respond ONLY with valid JSON in this format:
{
  "insights": "Brief analysis of what the user needs",
  "suggestedFilters": {
    "bodyTypes": ["suv", "sedan"],
    "fuelTypes": ["hybrid", "electric"],
    "priceRange": { "min": 100000000, "max": 250000000 }
  },
  "preferences": [
    { "label": "Seguridad", "value": "safety", "confidence": 0.95 }
  ],
  "criteria": [
    { "name": "Seguridad", "weight": 0.35, "description": "Safety features and ratings" }
  ]
}

Consider:
- Colombian market (COP prices in millions)
- Road conditions and service availability
- Family needs, safety priorities
- Budget constraints`,
        },
        {
          role: 'user',
          content: `Analyze this vehicle request for the Colombian market:\n\n"${input.query}"\n\nCurrency: ${input.currency || 'COP'}`,
        },
      ];

      const response = await provider.chat(messages, {
        temperature: 0.7,
        maxTokens: 1500,
      });

      // Try to parse JSON from response
      const result = this.parseAIResponse(response.content);

      this.log(`Research complete with ${result.preferences.length} preferences`);

      // End agent trace on success
      if (executionId && trace) {
        trace.endAgent(executionId, {
          insights: result.insights,
          preferencesCount: result.preferences.length,
          criteriaCount: result.criteria.length,
          suggestedFilters: result.suggestedFilters,
        }, {
          aiProvider: isRealAI ? 'github' : 'mock',
          modelId: response.model,
          tokensUsed: response.tokensUsed,
        });
      }

      return result;
    } catch (error) {
      this.logError('Research failed, using fallback', error as Error);
      
      // Log error to trace if available
      if (executionId && trace) {
        trace.logError(executionId, error as Error);
      }
      
      return this.getFallbackResult(input.query);
    }
  }

  private parseAIResponse(content: string): ResearchResult {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize the response
      return {
        insights: parsed.insights || 'Analysis completed',
        suggestedFilters: parsed.suggestedFilters || {},
        preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
        criteria: Array.isArray(parsed.criteria) ? parsed.criteria : [],
      };
    } catch (error) {
      this.logError('Failed to parse AI response', error as Error);
      throw error;
    }
  }

  private getFallbackResult(query: string): ResearchResult {
    // Simple keyword-based fallback
    const lowerQuery = query.toLowerCase();
    const preferences: DetectedPreference[] = [];
    const criteria: DecisionCriteria[] = [];

    if (lowerQuery.includes('segur') || lowerQuery.includes('safety')) {
      preferences.push({ label: 'Seguridad', value: 'safety', confidence: 0.9 });
      criteria.push({ name: 'Seguridad', weight: 0.30, description: 'Características de seguridad' });
    }

    if (lowerQuery.includes('confiable') || lowerQuery.includes('reliable')) {
      preferences.push({ label: 'Confiabilidad', value: 'reliability', confidence: 0.9 });
      criteria.push({ name: 'Confiabilidad', weight: 0.25, description: 'Historial de confiabilidad' });
    }

    if (lowerQuery.includes('cómodo') || lowerQuery.includes('comfort') || lowerQuery.includes('familiar')) {
      preferences.push({ label: 'Comodidad', value: 'comfort', confidence: 0.85 });
      criteria.push({ name: 'Comodidad', weight: 0.20, description: 'Espacio y confort' });
    }

    if (lowerQuery.includes('económic') || lowerQuery.includes('combustible') || lowerQuery.includes('eficien')) {
      preferences.push({ label: 'Eficiencia', value: 'efficiency', confidence: 0.85 });
      criteria.push({ name: 'Eficiencia', weight: 0.15, description: 'Consumo de combustible' });
    }

    // Normalize weights
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight > 0) {
      criteria.forEach(c => (c.weight = c.weight / totalWeight));
    }

    return {
      insights: 'Análisis basado en palabras clave detectadas en la consulta',
      suggestedFilters: {},
      preferences,
      criteria: criteria.length > 0 ? criteria : [
        { name: 'Valor General', weight: 1.0, description: 'Evaluación general del vehículo' },
      ],
    };
  }
}
