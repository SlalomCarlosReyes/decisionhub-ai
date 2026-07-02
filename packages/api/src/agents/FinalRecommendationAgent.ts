/**
 * Final Recommendation Agent
 * 
 * Formats evaluation results into final CarRecommendation[] response.
 * Handles price formatting (COP), generates Spanish strengths/considerations,
 * and attaches decision explanation to the top recommendation.
 * 
 * Feature: FR-1.6.1 - Agentic Decision Workflow (AC-6)
 * Task: TASK-FEAT-AW006
 */

import {
  AgentInput,
  AgentOutput,
  CarRecommendation,
  EvaluationResult,
  Currency,
} from '@decisionhub/shared';
import { formatCurrency } from '@decisionhub/shared';
import { BaseAgent } from './base/BaseAgent';

/**
 * Input interface for Final Recommendation Agent
 */
export interface FinalRecommendationInput extends AgentInput {
  evaluationResults: EvaluationResult[];
  decisionExplanation?: string;
  currency?: Currency;
}

/**
 * Output interface for Final Recommendation Agent
 */
export interface FinalRecommendationOutput extends AgentOutput {
  recommendations: CarRecommendation[];
  summary: {
    totalRecommendations: number;
    averageScore: number;
    topScore: number;
  };
}

/**
 * Final Recommendation Agent
 * 
 * Formats evaluation results into user-friendly recommendations with:
 * - Formatted prices in specified currency (default: COP)
 * - Spanish language strengths (pros)
 * - Spanish language considerations (cons)
 * - Decision explanation attached to top pick
 * - Matched features highlighting
 * 
 * Pure deterministic logic - no AI calls required.
 */
export class FinalRecommendationAgent extends BaseAgent {
  name = 'FinalRecommendationAgent';
  description = 'Formats evaluation results into final recommendations';

  /**
   * Execute recommendation formatting
   * 
   * @param input - Evaluation results, optional decision explanation, currency
   * @returns Formatted recommendations with summary statistics
   */
  async execute(input: FinalRecommendationInput): Promise<FinalRecommendationOutput> {
    this.log(`Formatting ${input.evaluationResults.length} evaluation results into recommendations`);

    const currency = input.currency || 'COP';

    const { result: recommendations, executionTime } = await this.measureExecutionTime(
      () => this.formatRecommendations(input, currency)
    );

    const summary = this.calculateSummary(recommendations);

    this.log(
      `Formatted ${summary.totalRecommendations} recommendations (avg score: ${summary.averageScore}) in ${executionTime}ms`
    );

    return {
      recommendations,
      summary,
    };
  }

  /**
   * Format evaluation results into CarRecommendation array
   */
  private async formatRecommendations(
    input: FinalRecommendationInput,
    currency: Currency
  ): Promise<CarRecommendation[]> {
    const { evaluationResults, decisionExplanation } = input;

    // Take top 5 results (or all if less than 5)
    const topResults = evaluationResults.slice(0, 5);

    const recommendations: CarRecommendation[] = topResults.map((result, index) => {
      const isTopPick = index === 0;

      return {
        car: result.vehicle,
        score: result.finalScore,
        reasoning: isTopPick && decisionExplanation
          ? decisionExplanation
          : this.generateReasoning(result, currency),
        matchedFeatures: this.extractMatchedFeatures(result),
        pros: this.generateStrengths(result),
        cons: this.generateConsiderations(result),
      };
    });

    return recommendations;
  }

  /**
   * Generate reasoning in Spanish for a recommendation
   */
  private generateReasoning(result: EvaluationResult, currency: Currency): string {
    const { vehicle, finalScore } = result;
    const parts: string[] = [];

    // Opening statement based on score tier
    if (finalScore >= 85) {
      parts.push(`El ${vehicle.year} ${vehicle.make} ${vehicle.model} es una excelente opción que destaca en múltiples aspectos.`);
    } else if (finalScore >= 70) {
      parts.push(`El ${vehicle.year} ${vehicle.make} ${vehicle.model} es una buena opción que cumple con los criterios importantes.`);
    } else {
      parts.push(`El ${vehicle.year} ${vehicle.make} ${vehicle.model} es una opción sólida que considera tus preferencias.`);
    }

    // Price information
    const priceFormatted = formatCurrency(vehicle.price, currency);
    parts.push(`Tiene un precio de ${priceFormatted}.`);

    // Highlight top scoring criteria (top 2)
    const sortedCriteria = Object.entries(result.criteriaScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 2);

    if (sortedCriteria.length > 0) {
      const criteriaNames = sortedCriteria.map(([name]) => name.toLowerCase());
      if (criteriaNames.length === 1) {
        parts.push(`Destaca especialmente en ${criteriaNames[0]}.`);
      } else {
        parts.push(`Destaca especialmente en ${criteriaNames[0]} y ${criteriaNames[1]}.`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Extract matched features from evaluation result
   */
  private extractMatchedFeatures(result: EvaluationResult): string[] {
    // Safety check
    if (!result || !result.vehicle) {
      return [];
    }
    
    const { vehicle } = result;
    
    // Extract key features that likely contributed to high scores
    const relevantFeatures: string[] = [];

    // Safety features
    const safetyKeywords = ['airbag', 'abs', 'estabilidad', 'stability', 'freno', 'brake', 'cámara', 'camera'];
    // Comfort features
    const comfortKeywords = ['cuero', 'leather', 'climatizador', 'climate', 'asientos', 'seats'];
    // Technology features
    const techKeywords = ['carplay', 'android', 'navegación', 'navigation', 'pantalla', 'touchscreen', 'bluetooth'];

    const allKeywords = [...safetyKeywords, ...comfortKeywords, ...techKeywords];

    // Check if features exist before iterating
    if (vehicle.features && Array.isArray(vehicle.features)) {
      for (const feature of vehicle.features) {
        const featureLower = feature.toLowerCase();
        if (allKeywords.some(keyword => featureLower.includes(keyword))) {
          relevantFeatures.push(feature);
        }
      }
    }

    // Return up to 5 matched features
    return relevantFeatures.slice(0, 5);
  }

  /**
   * Generate strengths (pros) in Spanish based on criteria scores
   */
  private generateStrengths(result: EvaluationResult): string[] {
    // Safety check
    if (!result || !result.vehicle || !result.criteriaScores) {
      return ['Información del vehículo no disponible'];
    }
    
    const { vehicle, criteriaScores } = result;
    const strengths: string[] = [];

    // High-scoring criteria become strengths (score >= 70)
    const highScores = Object.entries(criteriaScores)
      .filter(([, score]) => score >= 70)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 4);

    for (const [criterion, score] of highScores) {
      strengths.push(`${criterion}: ${score}/100`);
    }

    // Age bonus (if recent model)
    const age = new Date().getFullYear() - vehicle.year;
    if (age <= 2) {
      strengths.push('Modelo muy reciente');
    } else if (age <= 4) {
      strengths.push('Modelo reciente');
    }

    // Fuel efficiency bonus
    if (vehicle.mpg && vehicle.mpg.combined >= 30) {
      strengths.push(`Eficiente: ${vehicle.mpg.combined} MPG combinado`);
    }

    // Electric/Hybrid bonus
    if (vehicle.fuelType === 'electric') {
      strengths.push('Vehículo 100% eléctrico');
    } else if (vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plugin-hybrid') {
      strengths.push('Tecnología híbrida');
    }

    // Return 3-5 strengths
    return strengths.slice(0, 5);
  }

  /**
   * Generate considerations (cons) in Spanish based on criteria scores
   */
  private generateConsiderations(result: EvaluationResult): string[] {
    // Safety check
    if (!result || !result.vehicle || !result.criteriaScores) {
      return ['Información del vehículo no disponible'];
    }
    
    const { vehicle, criteriaScores } = result;
    const considerations: string[] = [];

    // Low-scoring criteria become considerations (score < 60)
    const lowScores = Object.entries(criteriaScores)
      .filter(([, score]) => score < 60)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 2);

    for (const [criterion, score] of lowScores) {
      considerations.push(`${criterion} podría mejorar (${score}/100)`);
    }

    // Age consideration (if older model)
    const age = new Date().getFullYear() - vehicle.year;
    if (age > 6) {
      considerations.push(`Modelo del ${vehicle.year} (${age} años de antigüedad)`);
    }

    // Fuel efficiency consideration
    if (vehicle.mpg && vehicle.mpg.combined < 20) {
      considerations.push(`Consumo de combustible: ${vehicle.mpg.combined} MPG`);
    }

    // Body type consideration (if not SUV/sedan)
    if (vehicle.bodyType && !['suv', 'sedan'].includes(vehicle.bodyType)) {
      const bodyTypeSpanish: Record<string, string> = {
        'truck': 'camioneta',
        'coupe': 'coupé',
        'hatchback': 'hatchback',
        'van': 'van',
      };
      const bodyInSpanish = bodyTypeSpanish[vehicle.bodyType] || vehicle.bodyType;
      considerations.push(`Tipo de carrocería: ${bodyInSpanish}`);
    }

    // Return 2-3 considerations (don't overwhelm with negatives)
    return considerations.slice(0, 3);
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(recommendations: CarRecommendation[]): FinalRecommendationOutput['summary'] {
    if (recommendations.length === 0) {
      return {
        totalRecommendations: 0,
        averageScore: 0,
        topScore: 0,
      };
    }

    const totalScore = recommendations.reduce((sum, rec) => sum + rec.score, 0);
    const averageScore = Math.round(totalScore / recommendations.length);
    const topScore = recommendations[0].score;

    return {
      totalRecommendations: recommendations.length,
      averageScore,
      topScore,
    };
  }
}
