/**
 * Unit Tests: Lead Decision Agent
 * 
 * Tests AI-powered decision explanation generation that provides
 * strategy, reasoning, and key factors for recommendations.
 * 
 * Framework: Vitest
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW012
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { LeadDecisionAgent } from './LeadDecisionAgent.js';
import { AIProviderFactory } from '../services/ai/index.js';
import type { CarRecommendation, Car } from '@decisionhub/shared';

describe('LeadDecisionAgent', () => {
  let agent: LeadDecisionAgent;
  let mockRecommendations: CarRecommendation[];

  beforeAll(async () => {
    // Initialize AI provider before tests
    await AIProviderFactory.initialize();
  });

  beforeEach(() => {
    agent = new LeadDecisionAgent();

    // Mock recommendations for testing
    mockRecommendations = [
      {
        car: {
          id: 'toyota-camry',
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          price: 145000000,
          bodyType: 'sedan',
          fuelType: 'hybrid',
          transmission: 'automatic',
          imageUrl: '/images/toyota-camry.jpg',
          mpg: { city: 51, highway: 53, combined: 52 },
          features: ['ABS', 'Airbags', 'Lane Assist'],
          rating: 4.7,
        } as Car,
        score: 92,
        reasoning: 'Excellent safety and efficiency',
        matchedFeatures: ['hybrid', 'safety'],
        pros: ['Alta eficiencia', 'Muy seguro'],
        cons: ['Precio elevado'],
      },
      {
        car: {
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
          features: ['ABS', 'Airbags'],
          rating: 4.5,
        } as Car,
        score: 88,
        reasoning: 'Great family vehicle',
        matchedFeatures: ['spacious', 'reliable'],
        pros: ['Espacioso', 'Confiable'],
        cons: ['Consumo moderado'],
      },
      {
        car: {
          id: 'mazda3',
          make: 'Mazda',
          model: '3',
          year: 2023,
          price: 95000000,
          bodyType: 'sedan',
          fuelType: 'gasoline',
          transmission: 'automatic',
          imageUrl: '/images/mazda3.jpg',
          mpg: { city: 26, highway: 35, combined: 29 },
          features: ['ABS'],
          rating: 4.3,
        } as Car,
        score: 85,
        reasoning: 'Good value option',
        matchedFeatures: ['affordable'],
        pros: ['Buen precio'],
        cons: ['Menos características'],
      },
    ];
  });

  describe('Decision Explanation Generation', () => {
    it('should generate decision explanation', async () => {
      const input = {
        query: 'SUV seguro para familia',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('keyFactors');
      expect(result).toHaveProperty('confidence');
    });

    it('should provide strategy explanation', async () => {
      const input = {
        query: 'Vehículo económico',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result.strategy).toBeTruthy();
      expect(typeof result.strategy).toBe('string');
      expect(result.strategy.length).toBeGreaterThan(10);
    });

    it('should provide detailed reasoning', async () => {
      const input = {
        query: 'Sedan confiable',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result.reasoning).toBeTruthy();
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(20);
    });
  });

  describe('Key Factors Identification', () => {
    it('should identify key factors', async () => {
      const input = {
        query: 'SUV familiar',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(Array.isArray(result.keyFactors)).toBe(true);
      expect(result.keyFactors.length).toBeGreaterThan(0);
    });

    it('should provide meaningful factors', async () => {
      const input = {
        query: 'Vehículo seguro',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      result.keyFactors.forEach(factor => {
        expect(typeof factor).toBe('string');
        expect(factor.length).toBeGreaterThan(5);
      });
    });

    it('should limit number of key factors', async () => {
      const input = {
        query: 'SUV con muchas características',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      // Should have reasonable number of key factors (typically 3-5)
      expect(result.keyFactors.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide confidence score', async () => {
      const input = {
        query: 'SUV seguro',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should have reasonable confidence for clear queries', async () => {
      const input = {
        query: 'SUV familiar seguro bajo 150 millones',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Recommendation Analysis', () => {
    it('should analyze top recommendations', async () => {
      const input = {
        query: 'Mejor vehículo',
        topRecommendations: mockRecommendations.slice(0, 3),
      };

      const result = await agent.execute(input);

      expect(result.reasoning).toBeTruthy();
      expect(result.keyFactors.length).toBeGreaterThan(0);
    });

    it('should handle single recommendation', async () => {
      const input = {
        query: 'Vehículo',
        topRecommendations: [mockRecommendations[0]],
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.strategy).toBeTruthy();
    });

    it('should handle multiple recommendations', async () => {
      const input = {
        query: 'Opciones de vehículos',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.reasoning).toBeTruthy();
    });
  });

  describe('Query Context Integration', () => {
    it('should consider query context', async () => {
      const input = {
        query: 'SUV seguro para familia numerosa',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result.strategy).toBeTruthy();
      expect(result.reasoning).toBeTruthy();
    });

    it('should handle budget-focused queries', async () => {
      const input = {
        query: 'Vehículo bajo 100 millones',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.keyFactors.length).toBeGreaterThan(0);
    });

    it('should handle feature-focused queries', async () => {
      const input = {
        query: 'Vehículo con tecnología avanzada',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.reasoning).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty recommendations list', async () => {
      const input = {
        query: 'Vehículo',
        topRecommendations: [],
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.strategy).toBeTruthy();
    });

    it('should handle vague queries', async () => {
      const input = {
        query: 'Vehículo',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle very specific queries', async () => {
      const input = {
        query: 'Toyota Camry híbrido 2024 plateado con todas las características de seguridad',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.keyFactors.length).toBeGreaterThan(0);
    });
  });

  describe('AI Provider Integration', () => {
    it('should work with mock AI provider', async () => {
      const input = {
        query: 'SUV familiar',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      // Mock provider should return valid structure
      expect(result).toBeDefined();
      expect(result.strategy).toBeTruthy();
      expect(result.reasoning).toBeTruthy();
      expect(Array.isArray(result.keyFactors)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('should return consistent structure', async () => {
      const input = {
        query: 'Sedan económico',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      // Verify complete structure
      expect(result).toMatchObject({
        strategy: expect.any(String),
        reasoning: expect.any(String),
        keyFactors: expect.any(Array),
        confidence: expect.any(Number),
      });
    });
  });

  describe('Performance', () => {
    it('should complete quickly', async () => {
      const input = {
        query: 'SUV seguro',
        topRecommendations: mockRecommendations,
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      // Should complete in reasonable time (mock should be fast)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large recommendation lists efficiently', async () => {
      const manyRecommendations = Array.from({ length: 20 }, (_, i) => ({
        ...mockRecommendations[0],
        car: {
          ...mockRecommendations[0].car,
          id: `vehicle-${i}`,
        },
        score: 90 - i,
      }));

      const input = {
        query: 'Mejores opciones',
        topRecommendations: manyRecommendations,
      };

      const start = Date.now();
      await agent.execute(input);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Output Structure', () => {
    it('should return valid DecisionExplanation structure', async () => {
      const input = {
        query: 'SUV familiar',
        topRecommendations: mockRecommendations,
      };

      const result = await agent.execute(input);

      // Check required properties
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('keyFactors');
      expect(result).toHaveProperty('confidence');

      // Check types
      expect(typeof result.strategy).toBe('string');
      expect(typeof result.reasoning).toBe('string');
      expect(Array.isArray(result.keyFactors)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });
  });
});
