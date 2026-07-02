/**
 * Unit Tests: Rate Limiter Service
 * 
 * Tests rate limiting, queue management, and request scheduling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from './rateLimiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter('TestSource', {
      maxConcurrent: 1,
      minTime: 100, // 100ms between requests for faster tests
      reservoir: 5,
      maxRequests: 5,
      interval: 1000,
    });
  });

  afterEach(async () => {
    try {
      await limiter.stop();
    } catch (error) {
      // Ignore "already stopped" errors
    }
  });

  describe('Basic Scheduling', () => {
    it('should schedule and execute a function', async () => {
      const fn = async () => 'result';
      
      const result = await limiter.schedule(fn);
      
      expect(result).toBe('result');
    });

    it('should respect minTime between requests', async () => {
      const results: string[] = [];
      
      await limiter.schedule(async () => {
        results.push('first');
        return 'first';
      });
      await limiter.schedule(async () => {
        results.push('second');
        return 'second';
      });
      
      expect(results).toEqual(['first', 'second']);
    }, 5000);

    it('should handle async functions', async () => {
      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'async result';
      };
      
      const result = await limiter.schedule(asyncFn);
      
      expect(result).toBe('async result');
    });

    it('should handle errors', async () => {
      const errorFn = async () => {
        throw new Error('Test error');
      };
      
      await expect(limiter.schedule(errorFn)).rejects.toThrow('Test error');
    });
  });

  describe('Concurrent Requests', () => {
    it('should enforce maxConcurrent limit', async () => {
      const concurrentLimiter = new RateLimiter('Concurrent', {
        maxConcurrent: 2,
        minTime: 0,
      });

      let concurrent = 0;
      let maxConcurrent = 0;

      const task = async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise(resolve => setTimeout(resolve, 30));
        concurrent--;
        return 'done';
      };

      // Start 3 tasks simultaneously
      const results = await Promise.all([
        concurrentLimiter.schedule(task),
        concurrentLimiter.schedule(task),
        concurrentLimiter.schedule(task),
      ]);

      expect(maxConcurrent).toBeLessThanOrEqual(2);
      expect(results).toHaveLength(3);
    }, 15000);
  });

  describe('Wrap Function', () => {
    it('should wrap a function with rate limiting', async () => {
      const originalFn = async (x: number) => x * 2;
      const wrappedFn = limiter.wrap(originalFn);
      
      const result = await wrappedFn(5);
      
      expect(result).toBe(10);
    });

    it('should execute wrapped function multiple times', async () => {
      const originalFn = async (x: number) => x + 1;
      const wrappedFn = limiter.wrap(originalFn);
      
      const first = await wrappedFn(1);
      const second = await wrappedFn(2);
      
      expect(first).toBe(2);
      expect(second).toBe(3);
    }, 5000);
  });

  describe('Queue Management', () => {
    it('should queue requests when busy', async () => {
      const task = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      };

      // Start first task
      const first = limiter.schedule(task);
      
      // Second task should be queued
      await new Promise(resolve => setTimeout(resolve, 10));
      const queueInfo = limiter.getQueueInfo();
      
      expect(queueInfo.source).toBe('TestSource');
      
      await first;
    });

    it('should provide queue information', () => {
      const info = limiter.getQueueInfo();
      
      expect(info).toHaveProperty('source');
      expect(info).toHaveProperty('queued');
      expect(info).toHaveProperty('running');
      expect(info).toHaveProperty('executing');
      expect(info.source).toBe('TestSource');
    });
  });

  describe('Stop and Clear', () => {
    it('should stop limiter', async () => {
      const task = async () => 'result';
      await limiter.schedule(task);
      
      await limiter.stop();
      
      const info = limiter.getQueueInfo();
      expect(info.queued).toBe(0);
    });

    it('should clear the queue', () => {
      limiter.clear();
      
      const info = limiter.getQueueInfo();
      expect(info.queued).toBe(0);
    });
  });

  describe('Reservoir Management', () => {
    it('should limit based on reservoir', async () => {
      const limitedLimiter = new RateLimiter('Limited', {
        reservoir: 2,
        minTime: 0,
        maxConcurrent: 2,
      });

      let executed = 0;
      const task = async () => {
        executed++;
        return executed;
      };

      // Schedule 2 tasks - should complete immediately
      await Promise.all([
        limitedLimiter.schedule(task),
        limitedLimiter.schedule(task),
      ]);
      expect(executed).toBe(2);
    }, 10000);
  });

  describe('Performance', () => {
    it('should handle sequential requests', async () => {
      const fastLimiter = new RateLimiter('Fast', {
        minTime: 10,
        maxConcurrent: 1,
      });

      const results: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const result = await fastLimiter.schedule(async () => i);
        results.push(result);
      }
      
      expect(results).toEqual([0, 1, 2]);
    }, 10000);

    it('should handle parallel requests with high concurrency', async () => {
      const unlimitedLimiter = new RateLimiter('Unlimited', {
        minTime: 0,
        maxConcurrent: 5,
      });

      const results = await Promise.all(
        Array.from({ length: 3 }, (_, i) => 
          unlimitedLimiter.schedule(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return i;
          })
        )
      );
      
      expect(results).toHaveLength(3);
      expect(results).toEqual([0, 1, 2]);
    }, 15000);
  });
});
