/**
 * Natural Language Parser Service
 * Extracts intent, budget, preferences, and criteria from user queries
 */

import {
  CarSearchCriteria,
  DetectedPreference,
  DecisionCriteria,
  AIAnalysis,
  FuelType,
  BodyType,
  Currency,
} from '@decisionhub/shared';
import { parseBudget } from '@decisionhub/shared';

export class NaturalLanguageParser {
  /**
   * Parse a natural language query and extract structured information
   */
  static parseQuery(query: string, currency: Currency = 'COP'): AIAnalysis {
    const normalizedQuery = query.toLowerCase();

    // Extract budget
    const budget = this.extractBudget(normalizedQuery);

    // Extract preferences
    const detectedPreferences = this.extractPreferences(normalizedQuery);

    // Extract search criteria
    const searchCriteria = this.extractSearchCriteria(normalizedQuery, budget);

    // Generate decision criteria based on preferences
    const decisionCriteria = this.generateDecisionCriteria(detectedPreferences);

    return {
      category: 'cars',
      budget: budget
        ? {
            max: budget,
            currency,
          }
        : undefined,
      detectedPreferences,
      decisionCriteria,
      searchCriteria,
      originalQuery: query,
    };
  }

  /**
   * Extract budget from query
   */
  private static extractBudget(query: string): number | undefined {
    // Try to match Colombian budget patterns
    const patterns = [
      // "250 millones", "250 million", "250M"
      /(\d+)\s*(?:millones?|million|m)\s*(?:cop)?/i,
      // "presupuesto de 250", "budget of 250"
      /(?:presupuesto|budget).*?(\d+)\s*(?:millones?|million|m)/i,
      // "hasta 250", "up to 250"
      /(?:hasta|up to|máximo|maximum).*?(\d+)\s*(?:millones?|million|m)/i,
      // Direct numbers like "250000000"
      /(\d{9,})/,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        // If value is less than 1000, assume it's in millions
        if (value < 1000) {
          return value * 1_000_000;
        }
        return value;
      }
    }

    return undefined;
  }

  /**
   * Extract user preferences from query
   */
  private static extractPreferences(query: string): DetectedPreference[] {
    const preferences: DetectedPreference[] = [];

    // Family/seating preferences
    if (
      /familia|family|familar|niños|children|kids|pasajeros|passengers|5|seis|seven/i.test(
        query
      )
    ) {
      preferences.push({
        label: 'Vehículo Familiar',
        value: 'family-vehicle',
        confidence: 0.9,
      });
    }

    // Safety preferences
    if (/segur|safety|safe|confiable|reliable/i.test(query)) {
      preferences.push({
        label: 'Seguridad',
        value: 'safety',
        confidence: 0.95,
      });
    }

    // Comfort preferences
    if (/cómod|comfort|espacios|spacious|luxury|lujo/i.test(query)) {
      preferences.push({
        label: 'Comodidad',
        value: 'comfort',
        confidence: 0.9,
      });
    }

    // Fuel efficiency
    if (
      /económic|econom|fuel\s*efficiency|consumo|bajo consumo|eficient|gasolina|combustible/i.test(
        query
      )
    ) {
      preferences.push({
        label: 'Eficiencia de Combustible',
        value: 'fuel-efficiency',
        confidence: 0.9,
      });
    }

    // Technology
    if (/tecnolog|technology|tech|smart|conectividad|connectivity/i.test(query)) {
      preferences.push({
        label: 'Tecnología',
        value: 'technology',
        confidence: 0.85,
      });
    }

    // Reliability
    if (/confiable|reliable|durabilidad|durability|mantenimiento|maintenance/i.test(query)) {
      preferences.push({
        label: 'Confiabilidad',
        value: 'reliability',
        confidence: 0.9,
      });
    }

    // Performance
    if (/potencia|power|performance|rápido|fast|deportivo|sporty/i.test(query)) {
      preferences.push({
        label: 'Rendimiento',
        value: 'performance',
        confidence: 0.85,
      });
    }

    // City driving
    if (/ciudad|city|urban|urbano/i.test(query)) {
      preferences.push({
        label: 'Conducción Urbana',
        value: 'city-driving',
        confidence: 0.8,
      });
    }

    // Adventure/off-road
    if (/aventura|adventure|viajes|travel|carretera|highway|campo|off[-\s]?road/i.test(query)) {
      preferences.push({
        label: 'Aventura',
        value: 'adventure',
        confidence: 0.85,
      });
    }

    return preferences;
  }

  /**
   * Extract structured search criteria from query
   */
  private static extractSearchCriteria(
    query: string,
    maxBudget?: number
  ): CarSearchCriteria {
    const criteria: CarSearchCriteria = {};

    // Budget
    if (maxBudget) {
      criteria.maxPrice = maxBudget;
      // Set minimum as 60% of max
      criteria.minPrice = Math.floor(maxBudget * 0.6);
    }

    // Fuel types
    const fuelTypes: FuelType[] = [];
    if (/eléctric|electric|ev\b/i.test(query)) fuelTypes.push('electric');
    if (/híbrid|hybrid/i.test(query)) {
      fuelTypes.push('hybrid');
      fuelTypes.push('plugin-hybrid');
    }
    if (/gasolina|gasoline|gas\b/i.test(query)) fuelTypes.push('gasoline');
    if (/diesel/i.test(query)) fuelTypes.push('diesel');

    if (fuelTypes.length > 0) {
      criteria.fuelTypes = fuelTypes;
    }

    // Body types
    const bodyTypes: BodyType[] = [];
    if (/suv|camioneta/i.test(query)) bodyTypes.push('suv');
    if (/sedan|sedán/i.test(query)) bodyTypes.push('sedan');
    if (/pickup|truck|camión/i.test(query)) bodyTypes.push('truck');
    if (/hatchback/i.test(query)) bodyTypes.push('hatchback');
    if (/van|minivan/i.test(query)) bodyTypes.push('van');

    if (bodyTypes.length > 0) {
      criteria.bodyTypes = bodyTypes;
    }

    // Year
    const yearMatch = query.match(/(\d{4})/);
    if (yearMatch) {
      criteria.minYear = parseInt(yearMatch[1]);
    } else if (/nuevo|new|reciente|recent|último|latest/i.test(query)) {
      criteria.minYear = new Date().getFullYear() - 1;
    }

    return criteria;
  }

  /**
   * Generate decision criteria with weights based on detected preferences
   */
  private static generateDecisionCriteria(
    preferences: DetectedPreference[]
  ): DecisionCriteria[] {
    const criteriaMap: Record<string, DecisionCriteria> = {
      safety: {
        name: 'Seguridad',
        weight: 0,
        description: 'Características de seguridad y calificaciones',
      },
      comfort: {
        name: 'Comodidad',
        weight: 0,
        description: 'Espacio interior y características de confort',
      },
      'fuel-efficiency': {
        name: 'Eficiencia de Combustible',
        weight: 0,
        description: 'Consumo de combustible y costos de operación',
      },
      reliability: {
        name: 'Confiabilidad',
        weight: 0,
        description: 'Historial de confiabilidad y costos de mantenimiento',
      },
      technology: {
        name: 'Tecnología',
        weight: 0,
        description: 'Características tecnológicas e innovación',
      },
      performance: {
        name: 'Rendimiento',
        weight: 0,
        description: 'Potencia, aceleración y manejo',
      },
    };

    // Default weights if no preferences detected
    if (preferences.length === 0) {
      return [
        { name: 'Seguridad', weight: 0.25, description: 'Características de seguridad' },
        { name: 'Confiabilidad', weight: 0.25, description: 'Historial de confiabilidad' },
        { name: 'Comodidad', weight: 0.2, description: 'Confort y espacio' },
        {
          name: 'Eficiencia de Combustible',
          weight: 0.15,
          description: 'Consumo de combustible',
        },
        { name: 'Tecnología', weight: 0.1, description: 'Características tecnológicas' },
        { name: 'Rendimiento', weight: 0.05, description: 'Potencia y manejo' },
      ];
    }

    // Assign weights based on preferences
    const totalConfidence = preferences.reduce((sum, p) => sum + (p.confidence || 1), 0);

    preferences.forEach((pref) => {
      const weight = (pref.confidence || 1) / totalConfidence;

      // Map preference values to criteria
      switch (pref.value) {
        case 'safety':
          criteriaMap.safety.weight += weight * 0.4;
          break;
        case 'comfort':
        case 'family-vehicle':
          criteriaMap.comfort.weight += weight * 0.35;
          break;
        case 'fuel-efficiency':
        case 'city-driving':
          criteriaMap['fuel-efficiency'].weight += weight * 0.35;
          break;
        case 'reliability':
          criteriaMap.reliability.weight += weight * 0.3;
          break;
        case 'technology':
          criteriaMap.technology.weight += weight * 0.25;
          break;
        case 'performance':
        case 'adventure':
          criteriaMap.performance.weight += weight * 0.25;
          break;
      }
    });

    // Normalize weights to sum to 1
    const totalWeight = Object.values(criteriaMap).reduce((sum, c) => sum + c.weight, 0);
    Object.values(criteriaMap).forEach((c) => {
      c.weight = c.weight / totalWeight;
    });

    // Return sorted by weight
    return Object.values(criteriaMap)
      .filter((c) => c.weight > 0)
      .sort((a, b) => b.weight - a.weight);
  }
}
