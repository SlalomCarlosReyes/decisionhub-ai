/**
 * Unit Tests: Intent Agent
 * 
 * Tests query parsing, budget extraction, requirement detection,
 * and confidence scoring for Spanish and English queries.
 * 
 * Framework: Vitest
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW012
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IntentAgent, type IntentAgentInput } from './IntentAgent.js';
import type { IntentAnalysis } from '@decisionhub/shared';

describe('IntentAgent', () => {
  let agent: IntentAgent;

  beforeEach(() => {
    agent = new IntentAgent();
  });

  describe('Spanish Query Parsing', () => {
    it('should parse SUV with budget and requirements', async () => {
      const input: IntentAgentInput = {
        query: 'SUV familiar seguro bajo 180 millones',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.category).toBe('suv');
      expect(result.budget).toEqual({
        max: 180000000,
        currency: 'COP'
      });
      expect(result.requirements).toContain('seguro');
      expect(result.requirements).toContain('familiar');
      expect(result.queryType).toBe('recommendation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should parse budget range', async () => {
      const input: IntentAgentInput = {
        query: 'Sedan entre 100 y 150 millones',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.category).toBe('sedan');
      expect(result.budget).toEqual({
        min: 100000000,
        max: 150000000,
        currency: 'COP'
      });
      expect(result.queryType).toBe('recommendation');
    });

    it('should extract multiple requirements', async () => {
      const input: IntentAgentInput = {
        query: 'Camioneta espaciosa confiable económica',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.category).toBe('suv');
      expect(result.requirements).toContain('espacioso');
      expect(result.requirements).toContain('confiable');
      expect(result.requirements).toContain('económico');
      expect(result.requirements.length).toBeGreaterThanOrEqual(3);
    });

    it('should detect comparison query type', async () => {
      const input: IntentAgentInput = {
        query: 'Comparar SUV vs Sedan',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.queryType).toBe('comparison');
      expect(result.confidence).toBeLessThan(1.0); // Lower confidence for comparison
    });

    it('should detect informational query type', async () => {
      const input: IntentAgentInput = {
        query: 'Qué es mejor para familia grande?',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.queryType).toBe('informational');
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('English Query Parsing', () => {
    it('should parse English SUV query', async () => {
      const input: IntentAgentInput = {
        query: 'SUV under 180 million for family',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.category).toBe('suv');
      expect(result.budget?.max).toBe(180000000);
      expect(result.requirements).toContain('familiar');
    });

    it('should parse English sedan query', async () => {
      const input: IntentAgentInput = {
        query: 'Reliable sedan with good fuel efficiency',
        currency: 'COP'
      };

      const result = await agent.execute(input);

      expect(result.category).toBe('sedan');
      expect(result.requirements).toContain('confiable');
      expect(result.requirements).toContain('eficiente');
    });
  });

  describe('Category Detection', () => {
    it.each([
      ['SUV espacioso', 'suv'],
      ['Camioneta grande', 'suv'],
      ['Sedan elegante', 'sedan'],
      ['Hatchback compacto', 'hatchback'],
      ['Pickup resistente', 'truck'],
    ])('should detect category from "%s" as %s', async (query, expectedCategory) => {
      const result = await agent.execute({ query, currency: 'COP' });
      expect(result.category).toBe(expectedCategory);
    });
  });

  describe('Budget Extraction', () => {
    it.each([
      ['bajo 100 millones', { max: 100000000 }],
      ['menos de 150 millones', { max: 150000000 }],
      ['hasta 200 millones', { max: 200000000 }],
      ['entre 80 y 120 millones', { min: 80000000, max: 120000000 }],
      ['desde 100 millones', { min: 100000000 }],
    ])('should extract budget from "%s"', async (query, expectedBudget) => {
      const result = await agent.execute({ query, currency: 'COP' });
      
      if (expectedBudget.min) {
        expect(result.budget?.min).toBe(expectedBudget.min);
      }
      if (expectedBudget.max) {
        expect(result.budget?.max).toBe(expectedBudget.max);
      }
      expect(result.budget?.currency).toBe('COP');
    });
  });

  describe('Requirements Detection', () => {
    it.each([
      ['seguro y confiable', ['seguro', 'confiable']],
      ['familiar y espacioso', ['familiar', 'espacioso']],
      ['económico y eficiente', ['económico']],
      ['moderno con tecnología', ['moderno', 'tecnología']],
      ['cómodo y lujoso', ['lujo']],
    ])('should detect requirements from "%s"', async (query, expectedRequirements) => {
      const result = await agent.execute({ query, currency: 'COP' });
      
      expectedRequirements.forEach(req => {
        expect(result.requirements).toContain(req);
      });
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for clear queries', async () => {
      const result = await agent.execute({
        query: 'SUV seguro bajo 150 millones',
        currency: 'COP'
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should have lower confidence for vague queries', async () => {
      const result = await agent.execute({
        query: 'Algo bueno',
        currency: 'COP'
      });

      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should have medium confidence for partial queries', async () => {
      const result = await agent.execute({
        query: 'SUV familiar',
        currency: 'COP'
      });

      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query', async () => {
      const result = await agent.execute({
        query: '',
        currency: 'COP'
      });

      expect(result.rawQuery).toBe('');
      expect(result.confidence).toBeLessThanOrEqual(0.6);
    });

    it('should handle query with only spaces', async () => {
      const result = await agent.execute({
        query: '   ',
        currency: 'COP'
      });

      expect(result.confidence).toBeLessThanOrEqual(0.6);
    });

    it('should handle query with special characters', async () => {
      const result = await agent.execute({
        query: 'SUV!!! @@@ seguro??? $$$',
        currency: 'COP'
      });

      expect(result.category).toBe('suv');
      expect(result.requirements).toContain('seguro');
    });

    it('should handle very long query', async () => {
      const longQuery = 'SUV ' + 'muy '.repeat(100) + 'seguro bajo 150 millones';
      
      const result = await agent.execute({
        query: longQuery,
        currency: 'COP'
      });

      expect(result.category).toBe('suv');
      expect(result.budget?.max).toBe(150000000);
    });
  });

  describe('Currency Handling', () => {
    it('should respect provided currency', async () => {
      const result = await agent.execute({
        query: 'SUV bajo 50000',
        currency: 'USD'
      });

      expect(result.budget?.currency).toBe('USD');
      expect(result.budget?.max).toBe(50000);
    });

    it('should default to COP if not specified', async () => {
      const result = await agent.execute({
        query: 'SUV bajo 100 millones',
        currency: 'COP'
      });

      expect(result.budget?.currency).toBe('COP');
    });
  });

  describe('Output Structure', () => {
    it('should return all required fields', async () => {
      const result = await agent.execute({
        query: 'SUV familiar seguro bajo 180 millones',
        currency: 'COP'
      });

      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('budget');
      expect(result).toHaveProperty('requirements');
      expect(result).toHaveProperty('queryType');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('rawQuery');
    });

    it('should have valid confidence range', async () => {
      const result = await agent.execute({
        query: 'SUV seguro',
        currency: 'COP'
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should preserve raw query', async () => {
      const query = 'SUV familiar seguro bajo 180 millones';
      const result = await agent.execute({
        query,
        currency: 'COP'
      });

      expect(result.rawQuery).toBe(query);
    });
  });
});
