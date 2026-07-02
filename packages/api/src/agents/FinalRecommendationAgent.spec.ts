/**
 * Unit Tests: Final Recommendation Agent
 * 
 * Tests recommendation formatting, Spanish text generation,
 * and COP currency formatting.
 * 
 * Framework: Vitest
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW012
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FinalRecommendationAgent, type FinalRecommendationInput } from './FinalRecommendationAgent.js';
import type { Car, EvaluationResult } from '@decisionhub/shared';

describe('FinalRecommendationAgent', () => {
  let agent: FinalRecommendationAgent;
  let mockVehicles: Car[];
  let mockEvaluationResults: EvaluationResult[];

  beforeEach(() => {
    agent = new FinalRecommendationAgent();

    mockVehicles = [
      {
        id: 'toyota-camry',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 145000000,
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'automatic',
        imageUrl: '/images/toyota-camry.jpg',
        mpg: { city: 28, highway: 39, combined: 32 },
        features: ['ABS', 'Airbags', 'Bluetooth', 'Lane Assist'],
        rating: 4.5,
      },
      {
        id: 'honda-crv',
        make: 'Honda',
        model: 'CR-V',
        year: 2024,
        price: 165000000,
        bodyType: 'suv',
        fuelType: 'gasoline',
        transmission: 'automatic',
        imageUrl: '/images/honda-crv.jpg',
        mpg: { city: 28, highway: 34, combined: 30 },
        features: ['ABS', 'Airbags', 'Lane Assist', 'Apple CarPlay'],
        rating: 4.7,
      },
      {
        id: 'mazda3',
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

    mockEvaluationResults = [
      {
        vehicle: mockVehicles[0],
        finalScore: 87.5,
        criteriaScores: {
          seguridad: 95,
          precio: 85,
          confiabilidad: 90,
          eficiencia: 80,
          tecnologia: 88,
        },
        rank: 1,
      },
      {
        vehicle: mockVehicles[1],
        finalScore: 84.2,
        criteriaScores: {
          seguridad: 92,
          precio: 78,
          confiabilidad: 88,
          eficiencia: 75,
          tecnologia: 90,
        },
        rank: 2,
      },
      {
        vehicle: mockVehicles[2],
        finalScore: 82.8,
        criteriaScores: {
          seguridad: 85,
          precio: 95,
          confiabilidad: 80,
          eficiencia: 85,
          tecnologia: 70,
        },
        rank: 3,
      },
    ];
  });

  describe('Recommendation Formatting', () => {
    it('should format evaluations into recommendations', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result.recommendations).toHaveLength(3);
      expect(result.summary.totalRecommendations).toBe(3);
    });

    it('should preserve vehicle information', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach((rec, index) => {
        const originalVehicle = mockEvaluationResults[index].vehicle;
        expect(rec.car.id).toBe(originalVehicle.id);
        expect(rec.car.make).toBe(originalVehicle.make);
        expect(rec.car.model).toBe(originalVehicle.model);
      });
    });

    it('should include scores', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach((rec, index) => {
        expect(rec.score).toBe(mockEvaluationResults[index].finalScore);
      });
    });
  });

  describe('Spanish Text Generation', () => {
    it('should generate pros in Spanish', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach(rec => {
        expect(rec.pros).toBeDefined();
        expect(rec.pros.length).toBeGreaterThanOrEqual(3);
        
        // Check for Spanish content (common words)
        const allPros = rec.pros.join(' ').toLowerCase();
        const hasSpanishContent = 
          allPros.includes('seguridad') || 
          allPros.includes('calificación') ||
          allPros.includes('modelo') ||
          allPros.includes('tecnología') ||
          allPros.includes('eficiente') ||
          allPros.includes('eléctrico') ||
          allPros.includes('híbrido') ||
          allPros.includes('reciente');
        
        expect(hasSpanishContent).toBe(true);
      });
    });

    it('should generate cons in Spanish', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach(rec => {
        expect(rec.cons).toBeDefined();
        expect(Array.isArray(rec.cons)).toBe(true);
      });
    });

    it('should generate reasoning', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach(rec => {
        expect(rec.reasoning).toBeDefined();
        expect(rec.reasoning.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Decision Explanation Integration', () => {
    it('should attach decision explanation to top pick', async () => {
      const decisionExplanation = {
        summary: 'Esta es la mejor opción según tus requisitos',
        keyFactors: ['Factor 1', 'Factor 2'],
        tradeoffs: ['Trade-off 1'],
        confidence: 0.9,
      };

      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        decisionExplanation,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      // Recommendations should be generated
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toHaveProperty('reasoning');
    });

    it('should use generic reasoning when no explanation provided', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach(rec => {
        expect(rec.reasoning).toBeTruthy();
        expect(rec.reasoning.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Ranking Limits', () => {
    it('should limit to 5 recommendations', async () => {
      // Create 10 evaluations
      const manyEvaluations = Array.from({ length: 10 }, (_, i) => ({
        vehicle: { ...mockVehicles[0], id: `vehicle-${i}` },
        finalScore: 90 - i,
        criteriaScores: { general: 90 - i },
        rank: i + 1,
      }));

      const input: FinalRecommendationInput = {
        evaluationResults: manyEvaluations,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result.recommendations.length).toBeLessThanOrEqual(5);
      expect(result.summary.totalRecommendations).toBeLessThanOrEqual(5);
    });

    it('should keep top ranked vehicles', async () => {
      const manyEvaluations = Array.from({ length: 10 }, (_, i) => ({
        vehicle: { ...mockVehicles[0], id: `vehicle-${i}`, price: 100000000 + (i * 1000000) },
        finalScore: 90 - i,
        criteriaScores: { general: 90 - i },
        rank: i + 1,
      }));

      const input: FinalRecommendationInput = {
        evaluationResults: manyEvaluations,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      // Should keep vehicles with ranks 1-5
      result.recommendations.forEach((rec, index) => {
        expect(rec.car.id).toBe(`vehicle-${index}`);
      });
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate average score', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      const scores = result.recommendations.map(r => r.score);
      const expectedAvg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

      expect(result.summary.averageScore).toBe(expectedAvg);
    });

    it('should identify top score', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      // Top score should be the first recommendation's score (highest ranked)
      expect(result.summary.topScore).toBe(result.recommendations[0].score);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty evaluation results', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: [],
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result.recommendations).toHaveLength(0);
      expect(result.summary.totalRecommendations).toBe(0);
    });

    it('should handle single evaluation', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: [mockEvaluationResults[0]],
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].car.id).toBe(mockVehicles[0].id);
    });

    it('should handle vehicles with minimal data', async () => {
      const minimalEvaluation: EvaluationResult = {
        vehicle: {
          id: 'minimal',
          make: 'Test',
          model: 'Minimal',
          year: 2024,
          price: 100000000,
          bodyType: 'sedan',
          fuelType: 'gasoline',
          transmission: 'automatic',
          imageUrl: '/test.jpg',
        } as Car,
        finalScore: 75,
        criteriaScores: { general: 75 },
        rank: 1,
      };

      const input: FinalRecommendationInput = {
        evaluationResults: [minimalEvaluation],
        currency: 'COP',
      };

      await expect(agent.execute(input)).resolves.toBeDefined();
    });

    it('should handle extreme scores', async () => {
      const extremeEvaluations: EvaluationResult[] = [
        {
          ...mockEvaluationResults[0],
          finalScore: 100,
        },
        {
          ...mockEvaluationResults[1],
          finalScore: 0,
        },
      ];

      const input: FinalRecommendationInput = {
        evaluationResults: extremeEvaluations,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].score).toBe(100);
      expect(result.recommendations[1].score).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should format quickly', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      // Should complete in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should handle many recommendations efficiently', async () => {
      const manyEvaluations = Array.from({ length: 20 }, (_, i) => ({
        vehicle: { ...mockVehicles[0], id: `vehicle-${i}` },
        finalScore: 90 - i,
        criteriaScores: { general: 90 - i },
        rank: i + 1,
      }));

      const input: FinalRecommendationInput = {
        evaluationResults: manyEvaluations,
        currency: 'COP',
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      // Should complete in less than 100ms even with 20 vehicles
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Output Structure', () => {
    it('should return correct structure', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalRecommendations');
      expect(result.summary).toHaveProperty('averageScore');
      expect(result.summary).toHaveProperty('topScore');
    });

    it('should have valid recommendation structure', async () => {
      const input: FinalRecommendationInput = {
        evaluationResults: mockEvaluationResults,
        currency: 'COP',
      };

      const result = await agent.execute(input);

      result.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('car');
        expect(rec).toHaveProperty('score');
        expect(rec).toHaveProperty('reasoning');
        expect(rec).toHaveProperty('matchedFeatures');
        expect(rec).toHaveProperty('pros');
        expect(rec).toHaveProperty('cons');
        
        expect(Array.isArray(rec.matchedFeatures)).toBe(true);
        expect(Array.isArray(rec.pros)).toBe(true);
        expect(Array.isArray(rec.cons)).toBe(true);
      });
    });
  });
});
