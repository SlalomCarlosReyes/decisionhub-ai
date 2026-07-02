/**
 * Evaluation Agent
 * 
 * Scores and ranks vehicles using weighted decision criteria.
 * Implements deterministic scoring logic with multiple criteria evaluation.
 * 
 * Feature: FR-1.6.1 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW003
 */

import {
  Car,
  CarSearchCriteria,
  DecisionCriteria,
  AgentInput,
  AgentOutput,
  EvaluationResult,
} from '@decisionhub/shared';
import { BaseAgent } from './base/BaseAgent';

/**
 * Input interface for Evaluation Agent
 */
export interface EvaluationInput extends AgentInput {
  vehicles: Car[];
  criteria: DecisionCriteria[];
  searchCriteria: CarSearchCriteria;
}

/**
 * Output interface for Evaluation Agent
 */
export interface EvaluationOutput extends AgentOutput {
  evaluationResults: EvaluationResult[];
  summary: {
    totalEvaluated: number;
    meetsThreshold: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}

/**
 * Evaluation Agent
 * 
 * Scores vehicles against weighted decision criteria and ranks them.
 * Uses rule-based scoring logic (no AI required).
 * 
 * Scoring Process:
 * 1. For each vehicle, evaluate against each criterion (0-100)
 * 2. Apply criterion weight to calculate weighted score
 * 3. Sum weighted scores for final score
 * 4. Apply budget adjustment bonus/penalty
 * 5. Filter vehicles with final score < 50
 * 6. Sort by final score (highest first)
 * 7. Assign ranks (1, 2, 3, etc.)
 */
export class EvaluationAgent extends BaseAgent {
  name = 'EvaluationAgent';
  description = 'Scores and ranks vehicles using weighted decision criteria';

  /**
   * Execute vehicle evaluation
   * 
   * @param input - Vehicles to evaluate, criteria, and search parameters
   * @returns Ranked evaluation results with scores and rankings
   */
  async execute(input: EvaluationInput): Promise<EvaluationOutput> {
    this.log(`Evaluating ${input.vehicles.length} vehicles with ${input.criteria.length} criteria`);

    const { result: evaluationResults, executionTime } = await this.measureExecutionTime(
      () => this.evaluateVehicles(input)
    );

    // Calculate summary statistics
    const summary = this.calculateSummary(evaluationResults, input.vehicles.length);

    this.log(
      `Evaluation complete: ${summary.meetsThreshold}/${summary.totalEvaluated} vehicles meet threshold (${executionTime}ms)`
    );

    return {
      evaluationResults,
      summary,
    };
  }

  /**
   * Evaluate all vehicles and return scored/ranked results
   */
  private async evaluateVehicles(input: EvaluationInput): Promise<EvaluationResult[]> {
    const { vehicles, criteria, searchCriteria } = input;

    // Score each vehicle
    const scoredVehicles = vehicles.map((vehicle) =>
      this.scoreVehicle(vehicle, criteria, searchCriteria)
    );

    // Filter vehicles below threshold (score < 50)
    const meetsThreshold = scoredVehicles.filter((result) => result.finalScore >= 50);

    // Sort by final score (highest first)
    meetsThreshold.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    const rankedResults = meetsThreshold.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));

    return rankedResults;
  }

  /**
   * Score a single vehicle against all criteria
   */
  private scoreVehicle(
    vehicle: Car,
    criteria: DecisionCriteria[],
    searchCriteria: CarSearchCriteria
  ): EvaluationResult {
    const criteriaScores: Record<string, number> = {};
    let weightedSum = 0;

    // Score each criterion
    for (const criterion of criteria) {
      const rawScore = this.scoreCriterion(vehicle, criterion, searchCriteria);
      const weightedScore = rawScore * criterion.weight;

      criteriaScores[criterion.name] = Math.round(rawScore);
      weightedSum += weightedScore;
    }

    // Apply budget adjustment if budget is specified
    let finalScore = weightedSum;
    if (searchCriteria.maxPrice) {
      const budgetAdjustment = this.calculateBudgetAdjustment(
        vehicle.price,
        searchCriteria.maxPrice
      );
      finalScore += budgetAdjustment;
    }

    // Cap final score at 100
    finalScore = Math.min(finalScore, 100);

    return {
      vehicle,
      finalScore: Math.round(finalScore),
      criteriaScores,
      rank: 0, // Will be assigned after sorting
    };
  }

  /**
   * Score a vehicle against a specific criterion
   */
  private scoreCriterion(
    vehicle: Car,
    criterion: DecisionCriteria,
    searchCriteria: CarSearchCriteria
  ): number {
    const criterionLower = criterion.name.toLowerCase();

    // Map criterion name to scoring logic
    if (criterionLower.includes('segur') || criterionLower.includes('safety')) {
      return this.scoreSafety(vehicle);
    }
    if (criterionLower.includes('confiab') || criterionLower.includes('reliab')) {
      return this.scoreReliability(vehicle);
    }
    if (criterionLower.includes('comod') || criterionLower.includes('comfort')) {
      return this.scoreComfort(vehicle);
    }
    if (criterionLower.includes('eficien') || criterionLower.includes('efficienc')) {
      return this.scoreEfficiency(vehicle);
    }
    if (criterionLower.includes('tecnol') || criterionLower.includes('tech')) {
      return this.scoreTechnology(vehicle);
    }
    if (criterionLower.includes('espac') || criterionLower.includes('space')) {
      return this.scoreSpacious(vehicle);
    }
    if (criterionLower.includes('valor') || criterionLower.includes('value')) {
      return this.scoreValue(vehicle, searchCriteria);
    }

    // Default: feature matching based on required features
    return this.scoreFeatureMatch(vehicle, searchCriteria);
  }

  /**
   * Score vehicle safety features
   */
  private scoreSafety(vehicle: Car): number {
    let score = 50; // Base score

    const safetyFeatures = [
      'airbag',
      'abs',
      'control de estabilidad',
      'stability control',
      'lane assist',
      'asistencia de carril',
      'frenado automático',
      'automatic braking',
      'cámara trasera',
      'backup camera',
      'blind spot',
      'punto ciego',
    ];

    const matchedFeatures = safetyFeatures.filter((feature) =>
      vehicle.features.some((carFeature) =>
        carFeature.toLowerCase().includes(feature.toLowerCase())
      )
    );

    // Award points for each safety feature (up to 50 bonus points)
    score += Math.min(matchedFeatures.length * 8, 50);

    return Math.min(score, 100);
  }

  /**
   * Score vehicle reliability based on brand and age
   */
  private scoreReliability(vehicle: Car): number {
    let score = 50;

    // Age factor (newer vehicles are generally more reliable)
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;

    if (age <= 2) score += 30;
    else if (age <= 5) score += 20;
    else if (age <= 8) score += 10;
    else score += 0;

    // Brand reputation bonus (known for reliability)
    const reliableBrands = ['toyota', 'honda', 'mazda', 'lexus', 'subaru'];
    if (reliableBrands.includes(vehicle.make.toLowerCase())) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Score vehicle comfort features
   */
  private scoreComfort(vehicle: Car): number {
    let score = 50;

    // Seating capacity (more seats = more comfort for families)
    if (vehicle.specifications?.seating) {
      if (vehicle.specifications.seating >= 7) score += 25;
      else if (vehicle.specifications.seating >= 5) score += 15;
    }

    // Comfort features
    const comfortFeatures = [
      'leather',
      'cuero',
      'climatizador',
      'climate control',
      'heated seats',
      'asientos calefactables',
      'panoramic',
      'sunroof',
      'techo panorámico',
      'ventilated seats',
      'asientos ventilados',
    ];

    const matchedFeatures = comfortFeatures.filter((feature) =>
      vehicle.features.some((carFeature) =>
        carFeature.toLowerCase().includes(feature.toLowerCase())
      )
    );

    score += Math.min(matchedFeatures.length * 5, 25);

    return Math.min(score, 100);
  }

  /**
   * Score vehicle fuel efficiency
   */
  private scoreEfficiency(vehicle: Car): number {
    // If no MPG data, use fuel type as proxy
    if (!vehicle.mpg) {
      if (vehicle.fuelType === 'electric') return 100;
      if (vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plugin-hybrid') return 85;
      return 50; // Neutral for gasoline/diesel
    }

    let score = 0;
    const combined = vehicle.mpg.combined;

    // MPG-based scoring
    if (combined >= 40) score = 100;
    else if (combined >= 35) score = 90;
    else if (combined >= 30) score = 80;
    else if (combined >= 25) score = 70;
    else if (combined >= 20) score = 60;
    else score = 40;

    // Additional bonus for hybrid/electric
    if (vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plugin-hybrid') {
      score = Math.min(score + 10, 100);
    }
    if (vehicle.fuelType === 'electric') {
      score = 100;
    }

    return score;
  }

  /**
   * Score vehicle technology features
   */
  private scoreTechnology(vehicle: Car): number {
    let score = 50;

    const techFeatures = [
      'infotainment',
      'apple carplay',
      'android auto',
      'navigation',
      'navegación',
      'bluetooth',
      'usb',
      'wireless charging',
      'carga inalámbrica',
      'digital',
      'touchscreen',
      'pantalla táctil',
      'adaptive cruise',
      'cruise control',
    ];

    const matchedFeatures = techFeatures.filter((feature) =>
      vehicle.features.some((carFeature) =>
        carFeature.toLowerCase().includes(feature.toLowerCase())
      )
    );

    // Award points for tech features (up to 50 bonus points)
    score += Math.min(matchedFeatures.length * 7, 50);

    return Math.min(score, 100);
  }

  /**
   * Score vehicle spaciousness
   */
  private scoreSpacious(vehicle: Car): number {
    let score = 50;

    // Body type influences spaciousness
    if (vehicle.bodyType === 'suv' || vehicle.bodyType === 'van') {
      score += 20;
    } else if (vehicle.bodyType === 'truck') {
      score += 15;
    }

    // Seating capacity
    if (vehicle.specifications?.seating) {
      if (vehicle.specifications.seating >= 7) score += 20;
      else if (vehicle.specifications.seating >= 5) score += 10;
    }

    // Cargo space
    if (vehicle.specifications?.cargoSpace) {
      if (vehicle.specifications.cargoSpace >= 70) score += 10;
      else if (vehicle.specifications.cargoSpace >= 50) score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Score vehicle value (price vs features)
   */
  private scoreValue(vehicle: Car, searchCriteria: CarSearchCriteria): number {
    let score = 50;

    // Price relative to budget
    if (searchCriteria.maxPrice) {
      const priceRatio = vehicle.price / searchCriteria.maxPrice;
      if (priceRatio <= 0.7) score += 20; // Great value
      else if (priceRatio <= 0.85) score += 10; // Good value
    }

    // Feature count bonus (more features = better value)
    const featureCount = vehicle.features.length;
    if (featureCount >= 15) score += 20;
    else if (featureCount >= 10) score += 10;
    else if (featureCount >= 5) score += 5;

    // Newer cars with reasonable price = better value
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;
    if (age <= 2) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Score vehicle based on feature matching
   */
  private scoreFeatureMatch(vehicle: Car, searchCriteria: CarSearchCriteria): number {
    if (!searchCriteria.requiredFeatures || searchCriteria.requiredFeatures.length === 0) {
      return 70; // Neutral score when no specific features required
    }

    let matchedCount = 0;
    for (const requiredFeature of searchCriteria.requiredFeatures) {
      if (
        vehicle.features.some((carFeature) =>
          carFeature.toLowerCase().includes(requiredFeature.toLowerCase())
        )
      ) {
        matchedCount++;
      }
    }

    const matchRate = matchedCount / searchCriteria.requiredFeatures.length;
    return Math.round(50 + matchRate * 50); // 50-100 based on match rate
  }

  /**
   * Calculate budget adjustment bonus/penalty
   */
  private calculateBudgetAdjustment(price: number, maxBudget: number): number {
    const ratio = price / maxBudget;

    if (ratio <= 0.8) return 10; // Well under budget - bonus
    if (ratio <= 0.9) return 5; // Under budget - small bonus
    if (ratio <= 1.0) return 0; // At budget - neutral
    if (ratio <= 1.1) return -5; // Slightly over - small penalty
    return -10; // Over budget - penalty
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    results: EvaluationResult[],
    totalEvaluated: number
  ): EvaluationOutput['summary'] {
    if (results.length === 0) {
      return {
        totalEvaluated,
        meetsThreshold: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const scores = results.map((r) => r.finalScore);
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return {
      totalEvaluated,
      meetsThreshold: results.length,
      averageScore,
      highestScore,
      lowestScore,
    };
  }
}
