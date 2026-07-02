/**
 * Intent Agent
 * Parses natural language queries to extract structured intent
 * 
 * Implements FR-1.6.1 AC-2: Intent Analysis
 * 
 * Capabilities:
 * - Extracts vehicle category (SUV, Sedan, Truck, etc.)
 * - Parses budget constraints (min/max in COP, USD, EUR)
 * - Detects key requirements (seguro, familiar, económico, etc.)
 * - Classifies query type (recommendation vs comparison vs informational)
 * - Calculates confidence score based on clarity
 * - Supports Spanish and English queries
 */

import { BaseAgent } from './base/BaseAgent';
import { IntentAnalysis, Currency } from '@decisionhub/shared';

export interface IntentAgentInput {
  query: string;
  currency?: Currency;
}

export class IntentAgent extends BaseAgent {
  name = 'IntentAgent';
  description = 'Parses natural language queries to extract structured intent';

  async execute(input: IntentAgentInput): Promise<IntentAnalysis> {
    this.log(`Parsing query: "${input.query}"`);

    const query = input.query.toLowerCase();
    const currency = input.currency || 'COP';

    // Extract category
    const category = this.extractCategory(query);
    
    // Extract budget
    const budget = this.extractBudget(query, currency);
    
    // Extract requirements/keywords
    const requirements = this.extractRequirements(query);
    
    // Classify query type
    const queryType = this.classifyQueryType(query);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(category, budget, requirements, queryType);

    const result: IntentAnalysis = {
      category,
      budget,
      requirements,
      queryType,
      confidence,
      rawQuery: input.query,
    };

    this.log(`Intent analysis complete: category=${category}, queryType=${queryType}, confidence=${confidence.toFixed(2)}`);

    return result;
  }

  /**
   * Extract vehicle category from query
   * Supports Spanish and English patterns
   */
  private extractCategory(query: string): string | undefined {
    const categoryPatterns: Record<string, RegExp> = {
      suv: /\b(suv|camioneta)\b/i,
      sedan: /\b(sedan|sedán)\b/i,
      truck: /\b(camión|pickup|pick-up|truck)\b/i,
      hatchback: /\b(hatchback|compacto)\b/i,
      hybrid: /\b(híbrido|hybrid)\b/i,
      electric: /\b(eléctrico|electric|ev)\b/i,
      van: /\b(van|minivan|furgoneta)\b/i,
      coupe: /\b(coupe|coupé|deportivo)\b/i,
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(query)) {
        return category;
      }
    }

    return undefined; // No specific category found
  }

  /**
   * Extract budget constraints from query
   * Handles various formats:
   * - "bajo 180 millones" → { max: 180000000, currency: 'COP' }
   * - "entre 100 y 200 millones" → { min: 100M, max: 200M }
   * - "under 50k USD" → { max: 50000, currency: 'USD' }
   */
  private extractBudget(query: string, currency: Currency): IntentAnalysis['budget'] {
    // Match various budget patterns
    const patterns = [
      // "entre 100 y 200 millones" or "between 100 and 200 million"
      /(?:entre|between)\s+(\d+)\s*(?:y|and)\s+(\d+)\s*(?:millones?|million|m\b)?/i,
      // "bajo 180 millones" or "under 180 million" or "hasta 180"
      /(?:bajo|under|hasta|up to|máximo|max|menos de|less than)\s+(\d+)\s*(?:millones?|million|m\b|k\b)?/i,
      // "sobre 100 millones" or "over 100 million" or "mínimo 100"
      /(?:sobre|over|desde|from|mínimo|min|más de|more than)\s+(\d+)\s*(?:millones?|million|m\b|k\b)?/i,
      // "180 millones" (standalone number with unit)
      /\b(\d+)\s*(?:millones?|million|m\b)\b/i,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = query.match(pattern);
      
      if (match) {
        if (i === 0 && match[2]) {
          // Range pattern: "entre 100 y 200"
          return {
            min: this.normalizeAmount(match[1], currency),
            max: this.normalizeAmount(match[2], currency),
            currency,
          };
        } else if (i === 1) {
          // Max pattern: "bajo 180"
          return {
            max: this.normalizeAmount(match[1], currency),
            currency,
          };
        } else if (i === 2) {
          // Min pattern: "sobre 100"
          return {
            min: this.normalizeAmount(match[1], currency),
            currency,
          };
        } else if (i === 3) {
          // Standalone: treat as max
          return {
            max: this.normalizeAmount(match[1], currency),
            currency,
          };
        }
      }
    }

    return undefined;
  }

  /**
   * Normalize budget amount based on context
   * Handles millions (M), thousands (K), and COP conversion
   */
  private normalizeAmount(value: string, currency: Currency): number {
    const num = parseInt(value, 10);
    
    // If currency is COP and value looks like millions (< 1000)
    // Convert to actual COP value (e.g., 180 millones → 180,000,000)
    if (currency === 'COP' && num < 1000) {
      return num * 1_000_000;
    }
    
    return num;
  }

  /**
   * Extract requirement keywords from query
   * Detects user preferences like safety, family-friendly, economical, etc.
   */
  private extractRequirements(query: string): string[] {
    const keywords: string[] = [];
    
    const requirementPatterns: Record<string, RegExp> = {
      'seguro': /\b(segur[oa]s?|safety|safe)\b/i,
      'familiar': /\b(familiar|familia|family)\b/i,
      'económico': /\b(económic[oa]|barato|affordable|económic|cheap)\b/i,
      'confiable': /\b(confiable|reliable|confiabilidad|reliability)\b/i,
      'espacioso': /\b(espacios[oa]|amplio|spacious|grande|roomy)\b/i,
      'eficiente': /\b(eficiente|efficiency|bajo consumo|fuel.?efficient)\b/i,
      'moderno': /\b(moderno|modern|nuevo|reciente|new|latest)\b/i,
      'tecnología': /\b(tecnología|technology|tech)\b/i,
      'lujo': /\b(lujo|luxury|premium|lujoso)\b/i,
      'deportivo': /\b(deportivo|sport|sporty|rápido|fast)\b/i,
      'todoterreno': /\b(todoterreno|off.?road|4x4|awd)\b/i,
      'urbano': /\b(urbano|city|urban)\b/i,
    };

    for (const [keyword, pattern] of Object.entries(requirementPatterns)) {
      if (pattern.test(query)) {
        keywords.push(keyword);
      }
    }

    return keywords;
  }

  /**
   * Classify query type based on intent indicators
   * - recommendation: User wants suggestions
   * - comparison: User wants to compare vehicles
   * - informational: User asks questions
   */
  private classifyQueryType(query: string): IntentAnalysis['queryType'] {
    // Check for comparison indicators
    const comparisonPatterns = /\b(compar[ae]|vs|versus|diferencia|difference|between|cual es mejor|which is better)\b/i;
    if (comparisonPatterns.test(query)) {
      return 'comparison';
    }

    // Check for informational indicators (questions without purchase intent)
    const informationalPatterns = /\b(qué es|what is|cuál es|which is|cómo|how|por qué|why|info|información|explain|explicar)\b/i;
    if (informationalPatterns.test(query)) {
      return 'informational';
    }

    // Default to recommendation (most common intent)
    return 'recommendation';
  }

  /**
   * Calculate confidence score based on extracted information
   * Higher confidence when more structured information is found
   * 
   * Scoring breakdown:
   * - Base confidence: 0.5
   * - Category found: +0.3
   * - Budget max found: +0.2
   * - Budget range (min + max): +0.1 (additional)
   * - Requirements found: +0.1 per requirement (max +0.2)
   * - Clear query structure: calculated based on completeness
   * 
   * Maximum confidence: 1.0
   */
  private calculateConfidence(
    category: string | undefined,
    budget: IntentAnalysis['budget'],
    requirements: string[],
    queryType: IntentAnalysis['queryType']
  ): number {
    let confidence = 0.5; // Base confidence

    // Category specificity
    if (category) {
      confidence += 0.3;
    }

    // Budget clarity
    if (budget?.max) {
      confidence += 0.2;
    }
    if (budget?.min && budget?.max) {
      confidence += 0.1; // Range is clearer than just max
    }

    // Requirements (each adds value, but cap at +0.2)
    const requirementScore = Math.min(requirements.length * 0.1, 0.2);
    confidence += requirementScore;

    // Query type clarity bonus
    if (queryType === 'comparison' || queryType === 'recommendation') {
      confidence += 0.05; // Clear intent
    }

    return Math.min(confidence, 1.0);
  }
}
