import {
  Car,
  CarSearchCriteria,
  CarRecommendation,
  AgentInput,
  AgentOutput,
} from '@decisionhub/shared';
import { BaseAgent } from './base/BaseAgent';
import { loadCarsData } from '../data/mockData';

interface RecommendationInput extends AgentInput {
  criteria?: CarSearchCriteria;
}

interface RecommendationOutput extends AgentOutput {
  recommendations: CarRecommendation[];
}

/**
 * Car Recommendation Agent (MVP - Mock Implementation)
 * Uses rule-based logic to recommend cars based on user criteria
 * Future: Replace with real LLM integration
 */
export class CarRecommendationAgent extends BaseAgent {
  name = 'CarRecommendationAgent';
  description = 'Recommends cars based on user criteria using mock AI logic';

  async execute(input: RecommendationInput): Promise<RecommendationOutput> {
    this.log('Executing car recommendation logic...');

    const { result, executionTime } = await this.measureExecutionTime(() =>
      this.generateRecommendations(input.criteria || {})
    );

    this.log(`Generated ${result.length} recommendations in ${executionTime}ms`);

    return {
      recommendations: result,
    };
  }

  private async generateRecommendations(
    criteria: CarSearchCriteria
  ): Promise<CarRecommendation[]> {
    const allCars = await loadCarsData();

    // Filter cars based on criteria
    let filteredCars = this.filterByCriteria(allCars, criteria);

    // Score each car
    const scoredCars = filteredCars.map((car) => ({
      car,
      score: this.calculateScore(car, criteria),
      matchedFeatures: this.getMatchedFeatures(car, criteria),
    }));

    // Sort by score (highest first)
    scoredCars.sort((a, b) => b.score - a.score);

    // Take top 5
    const topCars = scoredCars.slice(0, 5);

    // Generate recommendations with reasoning
    return topCars.map((scored) => ({
      car: scored.car,
      score: scored.score,
      reasoning: this.generateReasoning(scored.car, criteria, scored.score),
      matchedFeatures: scored.matchedFeatures,
      pros: this.generatePros(scored.car, criteria),
      cons: this.generateCons(scored.car, criteria),
    }));
  }

  private filterByCriteria(
    cars: Car[],
    criteria: CarSearchCriteria
  ): Car[] {
    return cars.filter((car) => {
      // Price filter
      if (criteria.minPrice && car.price < criteria.minPrice) return false;
      if (criteria.maxPrice && car.price > criteria.maxPrice) return false;

      // Year filter
      if (criteria.minYear && car.year < criteria.minYear) return false;
      if (criteria.maxYear && car.year > criteria.maxYear) return false;

      // Fuel type filter
      if (
        criteria.fuelTypes &&
        criteria.fuelTypes.length > 0 &&
        !criteria.fuelTypes.includes(car.fuelType)
      ) {
        return false;
      }

      // Body type filter
      if (
        criteria.bodyTypes &&
        criteria.bodyTypes.length > 0 &&
        car.bodyType &&
        !criteria.bodyTypes.includes(car.bodyType)
      ) {
        return false;
      }

      return true;
    });
  }

  private calculateScore(car: Car, criteria: CarSearchCriteria): number {
    let score = 50; // Base score

    // Price scoring (prefer within budget)
    if (criteria.maxPrice) {
      const priceRatio = car.price / criteria.maxPrice;
      if (priceRatio <= 0.8) {
        score += 20; // Well within budget
      } else if (priceRatio <= 0.95) {
        score += 10; // Close to budget
      }
    }

    // Feature matching
    if (criteria.requiredFeatures && criteria.requiredFeatures.length > 0) {
      const matchedCount = criteria.requiredFeatures.filter((feature) =>
        car.features.some((carFeature) =>
          carFeature.toLowerCase().includes(feature.toLowerCase())
        )
      ).length;
      score += (matchedCount / criteria.requiredFeatures.length) * 30;
    }

    // MPG bonus (fuel efficiency)
    if (criteria.minMpg && car.mpg && car.mpg.combined >= criteria.minMpg) {
      score += 10;
    }

    // Newer cars get bonus
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;
    if (age <= 2) score += 10;
    else if (age <= 5) score += 5;

    return Math.round(score);
  }

  private getMatchedFeatures(
    car: Car,
    criteria: CarSearchCriteria
  ): string[] {
    if (!criteria.requiredFeatures) return [];

    return criteria.requiredFeatures.filter((feature) =>
      car.features.some((carFeature) =>
        carFeature.toLowerCase().includes(feature.toLowerCase())
      )
    );
  }

  private generateReasoning(
    car: Car,
    criteria: CarSearchCriteria,
    score: number
  ): string {
    const parts: string[] = [];

    parts.push(
      `The ${car.year} ${car.make} ${car.model} is ${
        score >= 80
          ? 'an excellent'
          : score >= 65
          ? 'a great'
          : 'a good'
      } match for your criteria.`
    );

    if (criteria.maxPrice) {
      const priceRatio = (car.price / criteria.maxPrice) * 100;
      parts.push(
        `It's priced at $${car.price.toLocaleString()}, which is ${Math.round(
          priceRatio
        )}% of your maximum budget.`
      );
    }

    if (criteria.requiredFeatures && criteria.requiredFeatures.length > 0) {
      const matched = this.getMatchedFeatures(car, criteria);
      if (matched.length > 0) {
        parts.push(
          `It includes ${matched.length} of your required features: ${matched.join(', ')}.`
        );
      }
    }

    if (car.mpg) {
      parts.push(
        `Fuel economy is ${car.mpg.combined} MPG combined (${car.mpg.city} city / ${car.mpg.highway} highway).`
      );
    }

    return parts.join(' ');
  }

  private generatePros(car: Car, criteria: CarSearchCriteria): string[] {
    const pros: string[] = [];

    // Price advantage
    if (criteria.maxPrice && car.price < criteria.maxPrice * 0.8) {
      pros.push('Well within your budget');
    }

    // Fuel efficiency
    if (car.mpg && car.mpg.combined >= 30) {
      pros.push('Excellent fuel economy');
    } else if (car.mpg && car.mpg.combined >= 25) {
      pros.push('Good fuel economy');
    }

    // Newer vehicle
    const currentYear = new Date().getFullYear();
    if (currentYear - car.year <= 2) {
      pros.push('Nearly new vehicle');
    }

    // Feature rich
    if (car.features.length >= 10) {
      pros.push('Feature-rich');
    }

    // Electric/Hybrid bonus
    if (car.fuelType === 'electric') {
      pros.push('Zero emissions');
    } else if (car.fuelType === 'hybrid' || car.fuelType === 'plugin-hybrid') {
      pros.push('Eco-friendly hybrid technology');
    }

    return pros.slice(0, 4); // Max 4 pros
  }

  private generateCons(car: Car, criteria: CarSearchCriteria): string[] {
    const cons: string[] = [];

    // Price concern
    if (criteria.maxPrice && car.price > criteria.maxPrice * 0.9) {
      cons.push('Near the top of your budget');
    }

    // Older vehicle
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;
    if (age >= 5) {
      cons.push(`${age} years old`);
    }

    // Fuel economy
    if (car.mpg && car.mpg.combined < 20) {
      cons.push('Lower fuel economy');
    }

    // Missing features
    if (criteria.requiredFeatures && criteria.requiredFeatures.length > 0) {
      const matched = this.getMatchedFeatures(car, criteria);
      const missing = criteria.requiredFeatures.length - matched.length;
      if (missing > 0) {
        cons.push(`Missing ${missing} requested feature${missing > 1 ? 's' : ''}`);
      }
    }

    return cons.slice(0, 3); // Max 3 cons
  }
}
