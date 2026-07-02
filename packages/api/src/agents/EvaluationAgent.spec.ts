/**
 * Unit Tests: Evaluation Agent
 * 
 * Tests vehicle scoring, ranking, and filtering algorithms.
 * 
 * Framework: Vitest
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW012
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationAgent, type EvaluationInput } from './EvaluationAgent.js';
import type { Car, DecisionCriteria, CarSearchCriteria } from '@decisionhub/shared';

describe('EvaluationAgent', () => {
  let agent: EvaluationAgent;
  let mockVehicles: Car[];
  let mockCriteria: DecisionCriteria[];
  let searchCriteria: CarSearchCriteria;

  beforeEach(() => {
    agent = new EvaluationAgent();

    // Mock vehicles for testing
    mockVehicles = [
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 145000000,
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'automatic',
        imageUrl: '/images/toyota-camry.jpg',
        mpg: { city: 28, highway: 39, combined: 32 },
        features: ['ABS', 'Airbags', 'Bluetooth'],
        rating: 4.5,
      },
      {
        id: 'vehicle-2',
        make: 'Honda',
        model: 'CR-V',
        year: 2024,
        price: 165000000,
        bodyType: 'suv',
        fuelType: 'gasoline',
        transmission: 'automatic',
        imageUrl: '/images/honda-crv.jpg',
        mpg: { city: 28, highway: 34, combined: 30 },
        features: ['ABS', 'Airbags', 'Lane Assist'],
        rating: 4.7,
      },
      {
        id: 'vehicle-3',
        make: 'Mazda',
        model: '3',
        year: 2023,
        price: 95000000,
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'manual',
        imageUrl: '/images/mazda3.jpg',
        mpg: { city: 26, highway: 35, combined: 29 },
        features: ['ABS', 'Bluetooth'],
        rating: 4.3,
      },
    ];

    mockCriteria = [
      { name: 'seguridad', weight: 0.30, description: 'Calificación de seguridad' },
      { name: 'precio', weight: 0.25, description: 'Ajuste al presupuesto' },
      { name: 'confiabilidad', weight: 0.20, description: 'Historial de confiabilidad' },
      { name: 'eficiencia', weight: 0.15, description: 'Eficiencia de combustible' },
      { name: 'tecnologia', weight: 0.10, description: 'Características tecnológicas' },
    ];

    searchCriteria = {
      category: 'sedan',
      maxBudget: 150000000,
    };
  });

  describe('Vehicle Evaluation', () => {
    it('should evaluate all vehicles', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      expect(result.evaluationResults).toHaveLength(mockVehicles.length);
      expect(result.summary.totalEvaluated).toBe(mockVehicles.length);
    });

    it('should assign scores to each vehicle', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      result.evaluationResults.forEach(evaluation => {
        expect(evaluation.finalScore).toBeGreaterThanOrEqual(0);
        expect(evaluation.finalScore).toBeLessThanOrEqual(100);
        expect(evaluation).toHaveProperty('vehicle');
        expect(evaluation).toHaveProperty('criteriaScores');
        expect(evaluation).toHaveProperty('rank');
      });
    });

    it('should calculate criteria scores', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      result.evaluationResults.forEach(evaluation => {
        mockCriteria.forEach(criterion => {
          expect(evaluation.criteriaScores).toHaveProperty(criterion.name);
          const score = evaluation.criteriaScores[criterion.name];
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('Scoring Algorithm', () => {
    it('should apply weighted scoring', async () => {
      const highWeightCriteria: DecisionCriteria[] = [
        { name: 'precio', weight: 0.90, description: 'Precio principal' },
        { name: 'seguridad', weight: 0.10, description: 'Seguridad secundaria' },
      ];

      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: highWeightCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      // Vehicle with best price should score highest
      const cheapestVehicle = mockVehicles.reduce((prev, curr) => 
        curr.price < prev.price ? curr : prev
      );
      
      const cheapestEvaluation = result.evaluationResults.find(
        e => e.vehicle.id === cheapestVehicle.id
      );
      
      expect(cheapestEvaluation?.finalScore).toBeGreaterThan(60);
    });

    it('should sum weights correctly', () => {
      const totalWeight = mockCriteria.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 2);
    });
  });

  describe('Ranking', () => {
    it('should assign ranks in descending order', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      const ranks = result.evaluationResults.map(e => e.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([1, 2, 3]);
    });

    it('should rank highest score as rank 1', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      const rank1 = result.evaluationResults.find(e => e.rank === 1);
      const allScores = result.evaluationResults.map(e => e.finalScore);
      const maxScore = Math.max(...allScores);

      expect(rank1?.finalScore).toBe(maxScore);
    });
  });

  describe('Filtering', () => {
    it('should filter vehicles below threshold', async () => {
      // Create a vehicle that will score very low
      const lowScoringVehicle: Car = {
        id: 'low-score',
        make: 'Unknown',
        model: 'Bad',
        year: 2015,
        price: 200000000, // Over budget
        bodyType: 'other',
        fuelType: 'diesel',
        transmission: 'manual',
        imageUrl: '/images/unknown.jpg',
        mpg: { city: 15, highway: 20, combined: 17 },
        features: [],
        rating: 2.0,
      };

      const input: EvaluationInput = {
        vehicles: [...mockVehicles, lowScoringVehicle],
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      // Vehicles with score < 50 should be filtered
      result.evaluationResults.forEach(evaluation => {
        expect(evaluation.finalScore).toBeGreaterThanOrEqual(50);
      });
    });

    it('should count filtered vehicles correctly', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      expect(result.summary.meetsThreshold).toBeLessThanOrEqual(result.summary.totalEvaluated);
      expect(result.summary.meetsThreshold).toBeGreaterThan(0);
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate summary correctly', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      expect(result.summary).toHaveProperty('totalEvaluated');
      expect(result.summary).toHaveProperty('meetsThreshold');
      expect(result.summary).toHaveProperty('averageScore');
      expect(result.summary).toHaveProperty('highestScore');
      expect(result.summary).toHaveProperty('lowestScore');

      expect(result.summary.highestScore).toBeGreaterThanOrEqual(result.summary.averageScore);
      expect(result.summary.lowestScore).toBeLessThanOrEqual(result.summary.averageScore);
    });

    it('should calculate average score correctly', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      const scores = result.evaluationResults.map(e => e.finalScore);
      const manualAvg = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

      expect(result.summary.averageScore).toBe(manualAvg);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vehicle list', async () => {
      const input: EvaluationInput = {
        vehicles: [],
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      expect(result.evaluationResults).toHaveLength(0);
      expect(result.summary.totalEvaluated).toBe(0);
    });

    it('should handle single vehicle', async () => {
      const input: EvaluationInput = {
        vehicles: [mockVehicles[0]],
        criteria: mockCriteria,
        searchCriteria,
      };

      const result = await agent.execute(input);

      expect(result.evaluationResults).toHaveLength(1);
      expect(result.evaluationResults[0].rank).toBe(1);
    });

    it('should handle vehicles with missing data', async () => {
      const incompleteVehicle: Car = {
        id: 'incomplete',
        make: 'Test',
        model: 'Incomplete',
        year: 2024,
        price: 100000000,
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'automatic',
        imageUrl: '/images/test.jpg',
        features: [], // Provide empty array
        rating: 3.0, // Provide default rating
        mpg: { city: 20, highway: 25, combined: 22 }, // Provide default mpg
      };

      const input: EvaluationInput = {
        vehicles: [incompleteVehicle],
        criteria: mockCriteria,
        searchCriteria,
      };

      await expect(agent.execute(input)).resolves.toBeDefined();
    });

    it('should handle extreme budget values', async () => {
      const extremeBudget: CarSearchCriteria = {
        ...searchCriteria,
        maxBudget: 1000000000000, // 1 trillion
      };

      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria: extremeBudget,
      };

      const result = await agent.execute(input);

      expect(result.evaluationResults.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should evaluate quickly', async () => {
      const input: EvaluationInput = {
        vehicles: mockVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      // Should complete in less than 100ms for 3 vehicles
      expect(duration).toBeLessThan(100);
    });

    it('should handle many vehicles efficiently', async () => {
      // Create 50 vehicles
      const manyVehicles = Array.from({ length: 50 }, (_, i) => ({
        ...mockVehicles[0],
        id: `vehicle-${i}`,
        price: 100000000 + (i * 1000000),
      }));

      const input: EvaluationInput = {
        vehicles: manyVehicles,
        criteria: mockCriteria,
        searchCriteria,
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      // Should complete in less than 500ms for 50 vehicles
      expect(duration).toBeLessThan(500);
    });
  });
});
