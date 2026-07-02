/**
 * Unit Tests: Research Agent
 * 
 * Tests AI-powered analysis of user queries to extract preferences,
 * suggest filters, and generate decision criteria.
 * 
 * Framework: Vitest
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW012
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ResearchAgent } from './ResearchAgent.js';
import { AIProviderFactory } from '../services/ai/index.js';
import type { NaturalLanguageRequest } from '@decisionhub/shared';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;

  beforeAll(async () => {
    // Initialize AI provider before tests
    await AIProviderFactory.initialize();
  });

  beforeEach(() => {
    agent = new ResearchAgent();
  });

  describe('Query Analysis', () => {
    it('should analyze SUV safety query', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Busco un SUV seguro para mi familia bajo 150 millones',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('suggestedFilters');
      expect(result).toHaveProperty('preferences');
      expect(result).toHaveProperty('criteria');
      
      expect(result.insights).toBeTruthy();
      expect(typeof result.insights).toBe('string');
    });

    it('should analyze sedan efficiency query', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Necesito un sedan económico y eficiente',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result.insights).toBeTruthy();
      expect(Array.isArray(result.preferences)).toBe(true);
    });
  });

  describe('Filter Suggestions', () => {
    it('should suggest filters structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV espacioso',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result.suggestedFilters).toBeDefined();
      expect(typeof result.suggestedFilters).toBe('object');
    });
  });

  describe('Preference Detection', () => {
    it('should detect preferences', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Vehículo seguro y confiable',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(Array.isArray(result.preferences)).toBe(true);
    });

    it('should have valid preference structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV muy seguro',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      if (result.preferences.length > 0) {
        const pref = result.preferences[0];
        expect(pref).toHaveProperty('label');
        expect(pref).toHaveProperty('value');
        expect(pref).toHaveProperty('confidence');
        expect(pref.confidence).toBeGreaterThanOrEqual(0);
        expect(pref.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Decision Criteria Generation', () => {
    it('should generate decision criteria structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV familiar seguro',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(Array.isArray(result.criteria)).toBe(true);
    });

    it('should have valid criteria structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Vehículo económico',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      if (result.criteria.length > 0) {
        const criterion = result.criteria[0];
        expect(criterion).toHaveProperty('name');
        expect(criterion).toHaveProperty('weight');
        expect(criterion).toHaveProperty('description');
        expect(criterion.weight).toBeGreaterThan(0);
        expect(criterion.weight).toBeLessThanOrEqual(1);
      }
    });

    it('should provide descriptions for criteria', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV confiable',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      result.criteria.forEach(criterion => {
        expect(criterion.description).toBeTruthy();
        expect(typeof criterion.description).toBe('string');
      });
    });
  });

  describe('Language Support', () => {
    it('should handle Spanish queries', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Busco camioneta grande para trabajo',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result.insights).toBeTruthy();
      expect(Array.isArray(result.preferences)).toBe(true);
    });

    it('should handle English queries', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Looking for a safe family SUV',
        currency: 'USD',
      };

      const result = await agent.execute(request);

      expect(result.insights).toBeTruthy();
      expect(Array.isArray(result.preferences)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle vague queries', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Vehículo',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result).toBeDefined();
      expect(result.insights).toBeTruthy();
    });

    it('should handle very specific queries', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Toyota Camry 2024 híbrido plateado con techo panorámico bajo 180 millones',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result).toBeDefined();
      expect(result.insights).toBeTruthy();
    });

    it('should handle queries with multiple requirements', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV seguro, económico, espacioso, confiable, moderno',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      expect(result).toBeDefined();
      expect(result.insights).toBeTruthy();
    });
  });

  describe('AI Provider Integration', () => {
    it('should work with mock AI provider', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV familiar',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      // Mock provider should return valid structure
      expect(result).toBeDefined();
      expect(result.insights).toBeTruthy();
      expect(Array.isArray(result.preferences)).toBe(true);
      expect(Array.isArray(result.criteria)).toBe(true);
    });

    it('should return consistent structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'Sedan económico',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      // Verify complete structure
      expect(result).toMatchObject({
        insights: expect.any(String),
        suggestedFilters: expect.any(Object),
        preferences: expect.any(Array),
        criteria: expect.any(Array),
      });
    });
  });

  describe('Performance', () => {
    it('should complete quickly', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV seguro',
        currency: 'COP',
      };

      const start = Date.now();
      await agent.execute(request);
      const duration = Date.now() - start;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Output Structure', () => {
    it('should return valid ResearchResult structure', async () => {
      const request: NaturalLanguageRequest = {
        query: 'SUV familiar',
        currency: 'COP',
      };

      const result = await agent.execute(request);

      // Check required properties
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('suggestedFilters');
      expect(result).toHaveProperty('preferences');
      expect(result).toHaveProperty('criteria');

      // Check types
      expect(typeof result.insights).toBe('string');
      expect(typeof result.suggestedFilters).toBe('object');
      expect(Array.isArray(result.preferences)).toBe(true);
      expect(Array.isArray(result.criteria)).toBe(true);
    });
  });
});
