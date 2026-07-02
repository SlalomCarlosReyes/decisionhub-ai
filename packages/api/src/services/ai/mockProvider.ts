/**
 * Mock AI Provider
 * Provides rule-based responses when real AI is not available
 */

import { AIProvider, AIMessage, AIResponse } from './types';

export class MockAIProvider implements AIProvider {
  name = 'Mock AI';

  async isAvailable(): Promise<boolean> {
    return true; // Always available as fallback
  }

  async chat(
    messages: AIMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    // Extract the last user message
    const userMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    const systemMessage = messages
      .filter(m => m.role === 'system')
      .pop()?.content || '';

    // Generate mock response based on context
    let content = '';

    if (systemMessage.includes('Research Agent') || systemMessage.includes('candidate vehicles')) {
      content = this.generateResearchResponse(userMessage);
    } else if (systemMessage.includes('Decision Agent') || systemMessage.includes('decision strategy')) {
      content = this.generateDecisionResponse(userMessage);
    } else {
      content = this.generateGenericResponse(userMessage);
    }

    return {
      content,
      model: 'mock-ai-v1',
    };
  }

  private generateResearchResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Detect key preferences
    const preferences = [];
    if (lowerQuery.includes('suv')) preferences.push('SUV body type');
    if (lowerQuery.includes('eléctrico') || lowerQuery.includes('electric')) preferences.push('Electric powertrain');
    if (lowerQuery.includes('híbrido') || lowerQuery.includes('hybrid')) preferences.push('Hybrid powertrain');
    if (lowerQuery.includes('familiar') || lowerQuery.includes('family')) preferences.push('Family-friendly');
    if (lowerQuery.includes('segur') || lowerQuery.includes('safety')) preferences.push('High safety');
    if (lowerQuery.includes('económic') || lowerQuery.includes('fuel')) preferences.push('Fuel efficiency');

    // Extract budget if mentioned
    const budgetMatch = lowerQuery.match(/(\d+)\s*(?:millones?|million)/i);
    const budget = budgetMatch ? `${budgetMatch[1]} million COP` : 'Not specified';

    return JSON.stringify({
      analysis: {
        preferences: preferences.length > 0 ? preferences : ['General purpose vehicle'],
        budget: budget,
        market: 'Colombia',
        confidence: 0.85,
      },
      recommendations: [
        'Based on Colombian market availability and your requirements, I recommend focusing on:',
        '1. Toyota and Honda models for reliability and service network',
        '2. Mazda CX-5 or Subaru Outback for safety-conscious families',
        '3. Tesla Model 3 or Hyundai Ioniq 6 for electric options',
        '4. Kia Sportage Hybrid for fuel efficiency and value',
      ].join('\n'),
      reasoning: 'These recommendations consider Colombia\'s road conditions, service availability, and resale value.',
    }, null, 2);
  }

  private generateDecisionResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    let strategy = '';
    let reasoning = '';
    let keyFactors = [];

    if (lowerQuery.includes('top') && lowerQuery.includes('match')) {
      strategy = 'Weighted Multi-Criteria Scoring';
      reasoning = 'Based on your specific requirements, these vehicles offer the best combination of features, safety, and value. ' +
        'The recommendations were generated using a weighted scoring system that prioritizes your stated preferences. ' +
        'Safety and reliability had the highest weights based on your query, followed by comfort and fuel efficiency. ' +
        'Vehicles were filtered by budget constraints and ranked by their composite scores.';
      keyFactors = [
        'Excelente calificación de seguridad (5 estrellas)',
        'Amplio espacio interior para familias',
        'Precio dentro del presupuesto establecido',
        'Alta confiabilidad según valoraciones',
        'Disponibilidad de repuestos en Colombia'
      ];
    } else if (lowerQuery.includes('compare')) {
      strategy = 'Side-by-side Feature Comparison';
      reasoning = 'These vehicles represent different approaches to meeting your needs. ' +
        'Each offers unique strengths that should be considered based on your priorities. ' +
        'Vehicles are compared across key attributes including price, safety features, fuel economy, ' +
        'cargo space, and technology.';
      keyFactors = [
        'Comparación de características clave',
        'Balance entre precio y prestaciones',
        'Adaptación al mercado colombiano',
        'Costos de propiedad a largo plazo'
      ];
    } else {
      strategy = 'Recommendation-based Decision Support';
      reasoning = 'These recommendations are based on a comprehensive analysis of your requirements, ' +
        'market availability, and practical considerations for ownership in Colombia. ' +
        'The system analyzed your requirements and matched them against available inventory, ' +
        'considering factors like budget, preferences, and practical considerations for the Colombian market.';
      keyFactors = [
        'User-stated preferences and requirements',
        'Vehicle availability in Colombian market',
        'Safety ratings and features',
        'Reliability and maintenance considerations',
        'Budget fit and value proposition'
      ];
    }

    return JSON.stringify({
      strategy,
      reasoning,
      keyFactors,
      confidence: 0.85,
    }, null, 2);
  }

  private generateGenericResponse(query: string): string {
    return JSON.stringify({
      response: 'I understand your query about vehicle recommendations. ' +
        'Based on the information provided, I can help you find suitable options. ' +
        'Please note that this is a mock response as the real AI provider is not configured.',
      suggestion: 'To enable real AI capabilities, configure GITHUB_TOKEN and MODEL_ID in your environment variables.',
    }, null, 2);
  }
}
