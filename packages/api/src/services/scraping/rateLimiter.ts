/**
 * Rate Limiter Service
 * 
 * Controls the rate of requests to external services to respect their limits
 * and avoid being blocked or throttled.
 * 
 * Features:
 * - Per-source rate limiting
 * - Configurable max requests per interval
 * - Queue management
 * - Request scheduling
 */

import Bottleneck from 'bottleneck';

export interface RateLimiterOptions {
  maxConcurrent?: number; // Max concurrent requests
  minTime?: number; // Minimum time between requests (ms)
  maxRequests?: number; // Max requests per interval
  interval?: number; // Time interval (ms)
  reservoir?: number; // Initial reservoir
}

export class RateLimiter {
  private limiter: Bottleneck;
  private source: string;

  constructor(source: string, options: RateLimiterOptions = {}) {
    this.source = source;
    this.limiter = new Bottleneck({
      maxConcurrent: options.maxConcurrent || 1, // 1 concurrent request
      minTime: options.minTime || 6000, // 6 seconds between requests (10 req/min)
      reservoir: options.reservoir || 10, // Start with 10 requests available
      reservoirRefreshAmount: options.maxRequests || 10,
      reservoirRefreshInterval: options.interval || 60000, // Refresh every minute
    });

    // Log events
    this.limiter.on('queued', () => {
      console.log(`[RateLimiter:${this.source}] Request queued`);
    });

    this.limiter.on('executing', () => {
      console.log(`[RateLimiter:${this.source}] Executing request`);
    });

    this.limiter.on('done', () => {
      console.log(`[RateLimiter:${this.source}] Request completed`);
    });
  }

  /**
   * Schedule a function to be executed with rate limiting
   */
  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(() => fn());
  }

  /**
   * Wrap a function with rate limiting
   */
  wrap<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
    return this.limiter.wrap(fn);
  }

  /**
   * Get current queue info
   */
  getQueueInfo() {
    return {
      source: this.source,
      queued: this.limiter.counts().QUEUED,
      running: this.limiter.counts().RUNNING,
      executing: this.limiter.counts().EXECUTING,
    };
  }

  /**
   * Stop accepting new requests
   */
  stop(): Promise<void> {
    return this.limiter.stop();
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.limiter.stop({ dropWaitingJobs: true });
  }
}

// Pre-configured limiters for common sources
export const tuCarroLimiter = new RateLimiter('TuCarro', {
  maxConcurrent: 1,
  minTime: 6000, // 10 requests per minute
});

export const olxLimiter = new RateLimiter('OLX', {
  maxConcurrent: 1,
  minTime: 6000,
});

export const mercadoLibreLimiter = new RateLimiter('MercadoLibre', {
  maxConcurrent: 2,
  minTime: 3000, // 20 requests per minute (more generous)
});

export const consumerReportsLimiter = new RateLimiter('ConsumerReports', {
  maxConcurrent: 1,
  minTime: 10000, // 6 requests per minute (conservative)
});

export const nhtsaLimiter = new RateLimiter('NHTSA', {
  maxConcurrent: 2,
  minTime: 1000, // Official API, more generous
});
