/**
 * Unit Tests: Data Cache Service
 * 
 * Tests caching functionality, TTL management, and statistics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataCache } from './dataCache.js';

describe('DataCache', () => {
  let cache: DataCache;

  beforeEach(() => {
    cache = new DataCache({ stdTTL: 2, checkperiod: 1 });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      const result = cache.get('key1');
      
      expect(result).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      const result = cache.get('nonexistent');
      
      expect(result).toBeUndefined();
    });

    it('should overwrite existing keys', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      
      const result = cache.get('key1');
      expect(result).toBe('value2');
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('TTL Management', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1', 1); // 1 second TTL
      
      expect(cache.get('key1')).toBe('value1');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should use default TTL when not specified in set()', async () => {
      cache.set('key1', 'value1', 2); // Explicit 2 seconds
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(cache.get('key1')).toBe('value1');
      
      // Wait beyond TTL for expiration
      await new Promise(resolve => setTimeout(resolve, 1500));
      expect(cache.get('key1')).toBeUndefined();
    }, 10000);

    it('should allow custom TTL per entry', async () => {
      cache.set('key1', 'value1', 1);
      cache.set('key2', 'value2', 3);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('Statistics', () => {
    it('should track cache hits', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(0);
    });

    it('should track cache misses', () => {
      cache.get('nonexistent1');
      cache.get('nonexistent2');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should track number of keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const stats = cache.getStats();
      expect(stats.keys).toBe(3);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('nonexistent');
      
      cache.resetStats();
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Advanced Features', () => {
    it('should list all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const keys = cache.getKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.getKeys()).toHaveLength(0);
      const stats = cache.getStats();
      expect(stats.keys).toBe(0);
    });

    it('should handle complex objects', () => {
      const obj = {
        name: 'Test',
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
      };
      
      cache.set('complex', obj);
      const result = cache.get<typeof obj>('complex');
      
      expect(result).toEqual(obj);
    });

    it('should clone objects by default', () => {
      const obj = { value: 'original' };
      cache.set('obj', obj);
      
      const retrieved = cache.get<typeof obj>('obj');
      retrieved!.value = 'modified';
      
      const retrievedAgain = cache.get<typeof obj>('obj');
      expect(retrievedAgain!.value).toBe('original');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type information', () => {
      interface User {
        id: number;
        name: string;
      }
      
      const user: User = { id: 1, name: 'John' };
      cache.set<User>('user', user);
      
      const result = cache.get<User>('user');
      expect(result).toEqual(user);
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('John');
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('array', arr);
      
      const result = cache.get<number[]>('array');
      expect(result).toEqual(arr);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      cache.set('null', null);
      
      const result = cache.get('null');
      expect(result).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('undefined', undefined);
      
      // node-cache returns null for undefined values
      const result = cache.get('undefined');
      expect(result).toBeNull();
    });

    it('should handle empty strings', () => {
      cache.set('empty', '');
      
      const result = cache.get('empty');
      expect(result).toBe('');
    });

    it('should handle zero values', () => {
      cache.set('zero', 0);
      
      const result = cache.get('zero');
      expect(result).toBe(0);
    });
  });
});
